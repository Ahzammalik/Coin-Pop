document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        handleLoginPage(loginForm);
    } else {
        handleAuthenticatedPages();
    }
});

function handleLoginPage(form) {
    // ... (This function remains unchanged from the previous step)
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
        return;
    }
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const signupLink = document.getElementById('signup-link');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const email = emailInput.value;
        const password = passwordInput.value;
        const storedUser = localStorage.getItem(`user_${email}`);
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.password === password) {
                localStorage.setItem('currentUser', email);
                window.location.href = 'dashboard.html';
            } else {
                loginError.textContent = 'Incorrect password. Please try again.';
            }
        } else {
            loginError.textContent = 'No user found with that email address.';
        }
    });
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt("Please enter an email for your new account:", "newuser@example.com");
        if (!email) return;
        if (localStorage.getItem(`user_${email}`)) {
            alert("This email is already registered. Please log in.");
            return;
        }
        const password = prompt("Please enter a password:");
        if (!password) return;
        const newUser = { email, password, coins: 50, isAdmin: false, lastClaimTime: null };
        localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
        alert("Account created successfully! You can now log in.");
        emailInput.value = email;
        passwordInput.value = '';
    });
}

function handleAuthenticatedPages() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) {
        window.location.href = 'index.html';
        return;
    }

    // --- REFACTORED: Centralized User Data Management ---
    let userData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));

    const userEmailDisplay = document.getElementById('user-email-display');
    const coinBalanceDisplay = document.getElementById('coin-balance-display');
    const adminNavLink = document.getElementById('admin-nav-link');

    function updateUserData(newData) {
        userData = { ...userData, ...newData };
        localStorage.setItem(`user_${currentUserEmail}`, JSON.stringify(userData));
        updateUI(); // Re-render UI elements after data changes
    }

    function updateUI() {
        if (userEmailDisplay) userEmailDisplay.textContent = userData.email;
        if (coinBalanceDisplay) coinBalanceDisplay.textContent = `Coins: ${userData.coins}`;
        if (adminNavLink && userData.isAdmin) {
            adminNavLink.style.display = 'flex';
        }
    }

    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Initial setup
    initializeDummyUser();
    updateUI();
    setActiveNavLink();

    // --- PAGE-SPECIFIC LOGIC ---
    // Now we pass the shared data and functions to each page handler
    handleDashboardPage(userData);
    handleRewardsPage(userData, updateUserData);
    handlePlayPage(userData, updateUserData); // <-- New page logic
    handleLeaderboardPage(userData);
    handleWithdrawPage(userData, updateUserData);
    handleAdminPage(userData, updateUserData);
}

function initializeDummyUser() {
    // ... (This function remains unchanged)
    if (!localStorage.getItem('user_test@example.com')) {
        const dummyUser = { email: 'test@example.com', password: 'password123', coins: 100, isAdmin: true, lastClaimTime: null };
        localStorage.setItem('user_test@example.com', JSON.stringify(dummyUser));
    }
}

// Pass userData and updateUserData as arguments
function handleRewardsPage(userData, updateUserData) {
    const claimButton = document.getElementById('claim-reward-btn');
    if (!claimButton) return;
    
    // ... (The rest of the rewards logic is the same, but it now uses the passed-in arguments)
    const rewardMessage = document.getElementById('reward-message');
    const timerMessage = document.getElementById('timer-message');
    const REWARD_AMOUNT = 50;
    const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;
    let countdownInterval;

    function checkRewardStatus() {
        const lastClaim = userData.lastClaimTime;
        if (!lastClaim || (Date.now() - lastClaim >= COOLDOWN_PERIOD)) {
            enableClaimButton();
        } else {
            const remainingTime = COOLDOWN_PERIOD - (Date.now() - lastClaim);
            disableClaimButton(remainingTime);
        }
    }

    function enableClaimButton() { /* ... unchanged ... */
        claimButton.disabled = false;
        claimButton.textContent = `Claim ${REWARD_AMOUNT} Coins`;
        rewardMessage.textContent = 'Your daily reward is ready. Claim it now!';
        timerMessage.style.display = 'none';
        if (countdownInterval) clearInterval(countdownInterval);
    }
    function disableClaimButton(duration) { /* ... unchanged ... */
        claimButton.disabled = true;
        claimButton.textContent = 'Reward Claimed';
        rewardMessage.textContent = 'You have already claimed your reward for today.';
        timerMessage.style.display = 'block';
        startCountdown(duration);
    }
    function startCountdown(duration) { /* ... unchanged ... */
        let timer = duration;
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            timer -= 1000;
            if (timer < 0) {
                clearInterval(countdownInterval);
                checkRewardStatus();
            } else {
                const h = Math.floor((timer / (3600000)) % 24);
                const m = Math.floor((timer / (60000)) % 60);
                const s = Math.floor((timer / 1000) % 60);
                timerMessage.textContent = `Next claim in: ${h}h ${m}m ${s}s`;
            }
        }, 1000);
    }
    claimButton.addEventListener('click', () => {
        if (claimButton.disabled) return;
        updateUserData({
            coins: userData.coins + REWARD_AMOUNT,
            lastClaimTime: Date.now()
        });
        checkRewardStatus();
    });
    checkRewardStatus();
}

// Pass userData as an argument
function handleDashboardPage(userData) {
    const welcomeMessage = document.getElementById('welcome-message');
    if (!welcomeMessage) return;

    // ... (The rest of the dashboard logic is the same, but it now uses the passed-in userData)
    document.getElementById('dashboard-coins').textContent = userData.coins;
    welcomeMessage.textContent = `Welcome back, ${userData.email.split('@')[0]}!`;

    function calculateRank() {
        const allUsers = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                allUsers.push(JSON.parse(localStorage.getItem(key)));
            }
        }
        allUsers.sort((a, b) => b.coins - a.coins);
        const userRank = allUsers.findIndex(user => user.email === userData.email) + 1;
        document.getElementById('dashboard-rank').textContent = `#${userRank}`;
    }
    calculateRank();

    const dashboardRewardTimer = document.getElementById('dashboard-reward-timer');
    let rewardCountdownInterval;
    function checkRewardStatus() { /* ... unchanged ... */
        const COOLDOWN_PERIOD = 86400000;
        const lastClaim = userData.lastClaimTime;
        if (!lastClaim || (Date.now() - lastClaim >= COOLDOWN_PERIOD)) {
            dashboardRewardTimer.textContent = 'Ready to Claim!';
            dashboardRewardTimer.classList.remove('text-red-500');
            dashboardRewardTimer.classList.add('text-green-600');
            if (rewardCountdownInterval) clearInterval(rewardCountdownInterval);
        } else {
            const remainingTime = COOLDOWN_PERIOD - (Date.now() - lastClaim);
            dashboardRewardTimer.classList.remove('text-green-600');
            dashboardRewardTimer.classList.add('text-red-500');
            startRewardCountdown(remainingTime);
        }
    }
    function startRewardCountdown(duration) { /* ... unchanged ... */
        let timer = duration;
        if (rewardCountdownInterval) clearInterval(rewardCountdownInterval);
        rewardCountdownInterval = setInterval(() => {
            timer -= 1000;
            if (timer < 0) {
                clearInterval(rewardCountdownInterval);
                checkRewardStatus();
            } else {
                const h = Math.floor((timer / 3600000) % 24);
                const m = Math.floor((timer / 60000) % 60);
                const s = Math.floor((timer / 1000) % 60);
                dashboardRewardTimer.textContent = `${h}h ${m}m ${s}s`;
            }
        }, 1000);
    }
    checkRewardStatus();
}

// --- NEW FUNCTION for the Play Page ---
function handlePlayPage(userData, updateUserData) {
    const popButton = document.getElementById('pop-coin-btn');
    if (!popButton) return; // Only run on the Play page

    const resultMessage = document.getElementById('pop-result-message');

    popButton.addEventListener('click', () => {
        // Generate a random number of coins between 1 and 5
        const coinsWon = Math.floor(Math.random() * 5) + 1;

        // Update user data
        updateUserData({
            coins: userData.coins + coinsWon
        });

        // Display the result
        resultMessage.textContent = `You won ${coinsWon} coins!`;

        // Trigger the animation
        popButton.classList.add('pop-animation');
        
        // Remove the animation class after it finishes to allow it to be re-triggered
        setTimeout(() => {
            popButton.classList.remove('pop-animation');
        }, 300); // Animation duration is 0.3s
    });
}

// --- NEW FUNCTION for the Leaderboard Page ---
function handleLeaderboardPage(currentUserData) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return; // Only run on the Leaderboard page

    // 1. Fetch and sort all users
    const allUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            allUsers.push(JSON.parse(localStorage.getItem(key)));
        }
    }

    // Sort users by coins in descending order
    allUsers.sort((a, b) => b.coins - a.coins);

    // 2. Clear the loading message
    leaderboardBody.innerHTML = '';

    // 3. Populate the table
    if (allUsers.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-gray-500">No players found.</td></tr>`;
        return;
    }

    allUsers.forEach((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.email === currentUserData.email;

        // Create table row element
        const row = document.createElement('tr');
        
        // Add a highlight class if the row is for the current user
        if (isCurrentUser) {
            row.className = 'bg-blue-50 font-semibold';
        }

        // Create cells for rank, player name, and coins
        const rankCell = document.createElement('td');
        rankCell.className = 'px-6 py-4 whitespace-nowrap';
        rankCell.textContent = `#${rank}`;

        const playerCell = document.createElement('td');
        playerCell.className = 'px-6 py-4 whitespace-nowrap';
        // Displaying only the part before '@' for privacy/cleanliness
        playerCell.textContent = user.email.split('@')[0]; 
        if(isCurrentUser) playerCell.textContent += ' (You)';


        const coinsCell = document.createElement('td');
        coinsCell.className = 'px-6 py-4 whitespace-nowrap text-blue-600 font-bold';
        coinsCell.textContent = user.coins;

        // Append cells to the row
        row.appendChild(rankCell);
        row.appendChild(playerCell);
        row.appendChild(coinsCell);

        // Append the row to the table body
        leaderboardBody.appendChild(row);
    });
}

// --- NEW FUNCTION for the Withdraw Page ---
function handleWithdrawPage(userData, updateUserData) {
    const withdrawForm = document.getElementById('withdraw-form');
    if (!withdrawForm) return; // Only run on the Withdraw page

    const amountInput = document.getElementById('withdraw-amount');
    const cashValueDisplay = document.getElementById('cash-value');
    const messageDisplay = document.getElementById('withdraw-message');

    const CONVERSION_RATE = 1000; // 1000 coins = PKR1

    // Update cash value as the user types
    amountInput.addEventListener('input', () => {
        const amount = parseInt(amountInput.value, 10) || 0;
        const value = (amount / CONVERSION_RATE).toFixed(2);
        cashValueDisplay.textContent = `PKR{value}`;
    });

    // Handle form submission
    withdrawForm.addEventListener('submit', (e) => {
        e.preventDefault();
        messageDisplay.textContent = '';
        messageDisplay.classList.remove('text-red-500', 'text-green-500');

        const amountToWithdraw = parseInt(amountInput.value, 10);

        // --- Validation ---
        if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
            messageDisplay.textContent = 'Please enter a valid, positive number.';
            messageDisplay.classList.add('text-red-500');
            return;
        }

        if (amountToWithdraw > userData.coins) {
            messageDisplay.textContent = 'Insufficient coin balance for this withdrawal.';
            messageDisplay.classList.add('text-red-500');
            return;
        }

        // --- Process Withdrawal ---
        updateUserData({
            coins: userData.coins - amountToWithdraw
        });

        // Show success message
        const selectedMethod = withdrawForm.querySelector('input[name="method"]:checked').value;
        messageDisplay.textContent = `Success! Your PKR{selectedMethod} reward is being processed.`;
        messageDisplay.classList.add('text-green-500');

        // Reset form
        amountInput.value = '';
        cashValueDisplay.textContent = 'Rs0.00';
    });
}
// --- NEW FUNCTION for the Admin Page ---
function handleAdminPage(currentUserData, updateUserData) {
    const userListBody = document.getElementById('admin-user-list');
    if (!userListBody) return; // Only run on the Admin page

    // --- SECURITY CHECK ---
    // If the current user is not an admin, redirect them immediately.
    if (!currentUserData.isAdmin) {
        window.location.href = 'dashboard.html';
        return;
    }

    function renderUserTable() {
        userListBody.innerHTML = ''; // Clear the table before re-rendering
        
        const allUsers = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                allUsers.push(JSON.parse(localStorage.getItem(key)));
            }
        }

        allUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${user.coins}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button data-email="${user.email}" class="toggle-admin-btn px-3 py-1 text-sm font-medium rounded-md ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                        <input type="number" data-email="${user.email}" class="coin-input w-24 border-gray-300 rounded-md shadow-sm text-sm" placeholder="Add/Sub">
                        <button data-email="${user.email}" class="update-coins-btn px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">Update</button>
                    </div>
                </td>
            `;
            userListBody.appendChild(row);
        });
    }

    // Event Delegation for the entire table body
    userListBody.addEventListener('click', (e) => {
        const target = e.target;
        const userEmail = target.dataset.email;

        if (!userEmail) return;

        // Handle toggling admin status
        if (target.classList.contains('toggle-admin-btn')) {
            const userToUpdate = JSON.parse(localStorage.getItem(`user_${userEmail}`));
            userToUpdate.isAdmin = !userToUpdate.isAdmin;
            localStorage.setItem(`user_${userEmail}`, JSON.stringify(userToUpdate));
            renderUserTable(); // Re-render the table to show the change
        }

        // Handle updating coins
        if (target.classList.contains('update-coins-btn')) {
            const input = userListBody.querySelector(`.coin-input[data-email="${userEmail}"]`);
            const amount = parseInt(input.value, 10);

            if (isNaN(amount)) {
                alert('Please enter a valid number.');
                return;
            }

            const userToUpdate = JSON.parse(localStorage.getItem(`user_${userEmail}`));
            userToUpdate.coins += amount;
            localStorage.setItem(`user_${userEmail}`, JSON.stringify(userToUpdate));
            
            // If the admin is updating their own coins, update their session data too
            if (userEmail === currentUserData.email) {
                updateUserData({ coins: userToUpdate.coins });
            }

            renderUserTable(); // Re-render the table with new coin values
        }
    });
    
    // Initial render of the user table
    renderUserTable();
}
// Add to main.js - Contact Management for Admin Panel
function handleAdminContactPage(currentUserData) {
    const contactMessagesBody = document.getElementById('contact-messages-body');
    if (!contactMessagesBody) return;

    // Security check
    if (!currentUserData.isAdmin) {
        window.location.href = 'dashboard.html';
        return;
    }

    function renderContactMessages() {
        contactMessagesBody.innerHTML = '';
        let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        
        if (messages.length === 0) {
            contactMessagesBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                        No contact messages received yet.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        messages.forEach(message => {
            const row = document.createElement('tr');
            const date = new Date(message.timestamp).toLocaleDateString();
            const time = new Date(message.timestamp).toLocaleTimeString();
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium">${message.name}</div>
                    <div class="text-sm text-gray-500">${message.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="capitalize">${message.subject}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="max-w-xs truncate">${message.message}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm">${date}</div>
                    <div class="text-xs text-gray-500">${time}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${message.status === 'unread' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${message.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="view-message-btn text-blue-600 hover:text-blue-900 mr-3" data-id="${message.id}">
                        View
                    </button>
                    <button class="delete-message-btn text-red-600 hover:text-red-900" data-id="${message.id}">
                        Delete
                    </button>
                </td>
            `;
            contactMessagesBody.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll('.view-message-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const messageId = this.getAttribute('data-id');
                viewMessageDetails(messageId);
            });
        });

        document.querySelectorAll('.delete-message-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const messageId = this.getAttribute('data-id');
                deleteMessage(messageId);
            });
        });
    }

    function viewMessageDetails(messageId) {
        let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const message = messages.find(m => m.id == messageId);
        
        if (message) {
            // Mark as read
            message.status = 'read';
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            // Show modal with message details
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Message from ${message.name}</h3>
                        <button class="close-modal text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <strong>Email:</strong> ${message.email}
                        </div>
                        <div>
                            <strong>Subject:</strong> ${message.subject}
                        </div>
                        <div>
                            <strong>Date:</strong> ${new Date(message.timestamp).toLocaleString()}
                        </div>
                        <div>
                            <strong>Message:</strong>
                            <p class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">${message.message}</p>
                        </div>
                        ${message.replies && message.replies.length > 0 ? `
                        <div>
                            <strong>Replies:</strong>
                            ${message.replies.map(reply => `
                                <div class="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded">
                                    <div class="text-sm text-gray-600 dark:text-gray-300">${new Date(reply.timestamp).toLocaleString()}</div>
                                    <div>${reply.message}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        <div class="mt-4">
                            <textarea id="reply-message" class="w-full p-3 border rounded" placeholder="Type your reply here..."></textarea>
                            <button id="send-reply" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal
            modal.querySelector('.close-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
                renderContactMessages();
            });
            
            // Send reply
            modal.querySelector('#send-reply').addEventListener('click', () => {
                const replyText = modal.querySelector('#reply-message').value;
                if (replyText.trim()) {
                    if (!message.replies) message.replies = [];
                    message.replies.push({
                        message: replyText,
                        timestamp: new Date().toISOString(),
                        admin: true
                    });
                    localStorage.setItem('contactMessages', JSON.stringify(messages));
                    modal.querySelector('#reply-message').value = '';
                    alert('Reply sent successfully!');
                    document.body.removeChild(modal);
                    renderContactMessages();
                }
            });
        }
    }

    function deleteMessage(messageId) {
        if (confirm('Are you sure you want to delete this message?')) {
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messages = messages.filter(m => m.id != messageId);
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            renderContactMessages();
        }
    }

    renderContactMessages();
}
function handleAdminPage(currentUserData, updateUserData) {
    // ... existing code ...
    
    // Add contact messages handling
    handleAdminContactPage(currentUserData);
    
    // ... rest of the function
}
