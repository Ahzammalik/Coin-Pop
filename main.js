document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        handleLoginPage(loginForm);
    } else {
        handleAuthenticatedPages();
    }
});

function handleLoginPage(form) {
    // Redirect if already logged in
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const emailInput = document.getElementById('login-email'); // Fixed ID
    const passwordInput = document.getElementById('login-password'); // Fixed ID
    const loginError = document.getElementById('login-error');
    const signupLink = document.getElementById('signup-link');

    // Check if elements exist before adding event listeners
    if (!emailInput || !passwordInput || !loginError) {
        console.error('Login page elements not found');
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation
        if (!email || !password) {
            loginError.textContent = 'Please enter both email and password.';
            return;
        }

        const storedUser = localStorage.getItem(`user_${email}`);
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData.password === password) {
                    localStorage.setItem('currentUser', email);
                    window.location.href = 'dashboard.html';
                } else {
                    loginError.textContent = 'Incorrect password. Please try again.';
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                loginError.textContent = 'Error reading user data. Please try again.';
            }
        } else {
            loginError.textContent = 'No user found with that email address.';
        }
    });

    // Handle signup link if it exists
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt("Please enter an email for your new account:", "newuser@example.com");
            if (!email) return;

            // Email validation
            if (!email.includes('@') || !email.includes('.')) {
                alert("Please enter a valid email address.");
                return;
            }

            if (localStorage.getItem(`user_${email}`)) {
                alert("This email is already registered. Please log in.");
                return;
            }

            const password = prompt("Please enter a password:");
            if (!password) return;

            // Password validation
            if (password.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }

            const newUser = { 
                email, 
                password, 
                coins: 50, 
                isAdmin: false, 
                lastClaimTime: null,
                name: email.split('@')[0] // Add name field for consistency
            };
            localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
            alert("Account created successfully! You can now log in.");
            
            if (emailInput) emailInput.value = email;
            if (passwordInput) passwordInput.value = '';
        });
    }
}

function handleAuthenticatedPages() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dummy user if needed
    initializeDummyUser();

    // Centralized User Data Management
    let userData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));
    
    // Check if user data exists
    if (!userData) {
        console.error('User data not found, redirecting to login');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
        return;
    }

    const userEmailDisplay = document.getElementById('user-email-display');
    const coinBalanceDisplay = document.getElementById('coin-balance-display');
    const adminNavLink = document.getElementById('admin-nav-link');
    const logoutBtn = document.getElementById('logout-btn');

    function updateUserData(newData) {
        userData = { ...userData, ...newData };
        localStorage.setItem(`user_${currentUserEmail}`, JSON.stringify(userData));
        updateUI();
    }

    function updateUI() {
        if (userEmailDisplay) userEmailDisplay.textContent = userData.email;
        if (coinBalanceDisplay) coinBalanceDisplay.textContent = `Coins: ${userData.coins}`;
        if (adminNavLink) {
            adminNavLink.style.display = userData.isAdmin ? 'flex' : 'none';
        }
    }

    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link, .nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // Initial setup
    updateUI();
    setActiveNavLink();

    // Page-specific logic with error handling
    try {
        handleDashboardPage(userData, updateUserData);
        handleRewardsPage(userData, updateUserData);
        handlePlayPage(userData, updateUserData);
        handleLeaderboardPage(userData);
        handleWithdrawPage(userData, updateUserData);
        handleAdminPage(userData, updateUserData);
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

function initializeDummyUser() {
    if (!localStorage.getItem('user_test@example.com')) {
        const dummyUser = { 
            email: 'test@example.com', 
            password: 'password123', 
            coins: 100, 
            isAdmin: true, 
            lastClaimTime: null,
            name: 'Test User'
        };
        localStorage.setItem('user_test@example.com', JSON.stringify(dummyUser));
    }
}

function handleRewardsPage(userData, updateUserData) {
    const claimButton = document.getElementById('claim-reward-btn');
    if (!claimButton) return;
    
    const rewardMessage = document.getElementById('reward-message');
    const timerMessage = document.getElementById('timer-message');
    const REWARD_AMOUNT = 50;
    const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours
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

    function enableClaimButton() {
        claimButton.disabled = false;
        claimButton.textContent = `Claim ${REWARD_AMOUNT} Coins`;
        if (rewardMessage) {
            rewardMessage.textContent = 'Your daily reward is ready. Claim it now!';
            rewardMessage.className = 'text-green-600 text-sm font-medium';
        }
        if (timerMessage) {
            timerMessage.style.display = 'none';
        }
        if (countdownInterval) clearInterval(countdownInterval);
    }

    function disableClaimButton(duration) {
        claimButton.disabled = true;
        claimButton.textContent = 'Reward Claimed';
        if (rewardMessage) {
            rewardMessage.textContent = 'You have already claimed your reward for today.';
            rewardMessage.className = 'text-gray-600 text-sm';
        }
        if (timerMessage) {
            timerMessage.style.display = 'block';
            timerMessage.className = 'text-red-500 text-sm font-medium';
        }
        startCountdown(duration);
    }

    function startCountdown(duration) {
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
                if (timerMessage) {
                    timerMessage.textContent = `Next claim in: ${h}h ${m}m ${s}s`;
                }
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

    // Initialize reward status
    checkRewardStatus();
}

function handleDashboardPage(userData, updateUserData) {
    const welcomeMessage = document.getElementById('welcome-message');
    if (!welcomeMessage) return;

    const dashboardCoins = document.getElementById('dashboard-coins');
    const dashboardRank = document.getElementById('dashboard-rank');
    const dashboardRewardTimer = document.getElementById('dashboard-reward-timer');

    if (dashboardCoins) dashboardCoins.textContent = userData.coins;
    
    // Use name if available, otherwise use email prefix
    const displayName = userData.name || userData.email.split('@')[0];
    welcomeMessage.textContent = `Welcome back, ${displayName}!`;

    function calculateRank() {
        const allUsers = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                try {
                    const user = JSON.parse(localStorage.getItem(key));
                    allUsers.push(user);
                } catch (error) {
                    console.error('Error parsing user data for key:', key, error);
                }
            }
        }
        allUsers.sort((a, b) => b.coins - a.coins);
        const userRank = allUsers.findIndex(user => user.email === userData.email) + 1;
        if (dashboardRank) dashboardRank.textContent = `#${userRank}`;
    }

    calculateRank();

    let rewardCountdownInterval;
    function checkRewardStatus() {
        const COOLDOWN_PERIOD = 86400000; // 24 hours
        const lastClaim = userData.lastClaimTime;
        
        if (!dashboardRewardTimer) return;
        
        if (!lastClaim || (Date.now() - lastClaim >= COOLDOWN_PERIOD)) {
            dashboardRewardTimer.textContent = 'Ready to Claim!';
            dashboardRewardTimer.className = 'text-green-600 font-semibold';
            if (rewardCountdownInterval) clearInterval(rewardCountdownInterval);
        } else {
            const remainingTime = COOLDOWN_PERIOD - (Date.now() - lastClaim);
            dashboardRewardTimer.className = 'text-red-500 font-semibold';
            startRewardCountdown(remainingTime);
        }
    }

    function startRewardCountdown(duration) {
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
                if (dashboardRewardTimer) {
                    dashboardRewardTimer.textContent = `${h}h ${m}m ${s}s`;
                }
            }
        }, 1000);
    }

    checkRewardStatus();
}

function handlePlayPage(userData, updateUserData) {
    const popButton = document.getElementById('pop-coin-btn');
    if (!popButton) return;

    const resultMessage = document.getElementById('pop-result-message');

    popButton.addEventListener('click', () => {
        const coinsWon = Math.floor(Math.random() * 5) + 1;

        updateUserData({
            coins: userData.coins + coinsWon
        });

        if (resultMessage) {
            resultMessage.textContent = `You won ${coinsWon} coins!`;
            resultMessage.className = 'text-green-600 font-semibold text-center';
            
            // Clear previous message after 2 seconds
            setTimeout(() => {
                resultMessage.textContent = 'Click the coin to earn more coins!';
                resultMessage.className = 'text-gray-600 text-center';
            }, 2000);
        }

        // Add animation class
        popButton.classList.add('pop-animation');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            popButton.classList.remove('pop-animation');
        }, 300);
    });
}

function handleLeaderboardPage(currentUserData) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return;

    const allUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            try {
                const user = JSON.parse(localStorage.getItem(key));
                allUsers.push(user);
            } catch (error) {
                console.error('Error parsing user data for key:', key, error);
            }
        }
    }

    allUsers.sort((a, b) => b.coins - a.coins);
    leaderboardBody.innerHTML = '';

    if (allUsers.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-gray-500">No players found.</td></tr>`;
        return;
    }

    allUsers.forEach((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.email === currentUserData.email;

        const row = document.createElement('tr');
        if (isCurrentUser) {
            row.className = 'bg-blue-50 font-semibold dark:bg-blue-900';
        } else {
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        }

        const rankCell = document.createElement('td');
        rankCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';
        rankCell.textContent = `#${rank}`;

        const playerCell = document.createElement('td');
        playerCell.className = 'px-6 py-4 whitespace-nowrap text-sm';
        
        // Use name if available, otherwise use email prefix
        const displayName = user.name || user.email.split('@')[0];
        playerCell.textContent = displayName;
        if (isCurrentUser) playerCell.textContent += ' (You)';

        const coinsCell = document.createElement('td');
        coinsCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400';
        coinsCell.textContent = user.coins;

        row.appendChild(rankCell);
        row.appendChild(playerCell);
        row.appendChild(coinsCell);
        leaderboardBody.appendChild(row);
    });
}

function handleWithdrawPage(userData, updateUserData) {
    const withdrawForm = document.getElementById('withdraw-form');
    if (!withdrawForm) return;

    const amountInput = document.getElementById('withdraw-amount');
    const cashValueDisplay = document.getElementById('cash-value');
    const messageDisplay = document.getElementById('withdraw-message');

    const CONVERSION_RATE = 1000; // 1000 coins = PKR 1

    if (amountInput && cashValueDisplay) {
        amountInput.addEventListener('input', () => {
            const amount = parseInt(amountInput.value, 10) || 0;
            const value = (amount / CONVERSION_RATE).toFixed(2);
            cashValueDisplay.textContent = `PKR ${value}`;
        });
    }

    withdrawForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!messageDisplay) return;

        messageDisplay.textContent = '';
        messageDisplay.classList.remove('text-red-500', 'text-green-500');

        const amountToWithdraw = parseInt(amountInput.value, 10);

        // Validation
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

        if (amountToWithdraw < CONVERSION_RATE) {
            messageDisplay.textContent = `Minimum withdrawal is ${CONVERSION_RATE} coins.`;
            messageDisplay.classList.add('text-red-500');
            return;
        }

        // Process withdrawal
        updateUserData({
            coins: userData.coins - amountToWithdraw
        });

        const selectedMethod = withdrawForm.querySelector('input[name="method"]:checked');
        if (selectedMethod) {
            messageDisplay.textContent = `Success! Your ${selectedMethod.value} withdrawal of PKR ${(amountToWithdraw / CONVERSION_RATE).toFixed(2)} is being processed.`;
        } else {
            messageDisplay.textContent = `Success! Your withdrawal of PKR ${(amountToWithdraw / CONVERSION_RATE).toFixed(2)} is being processed.`;
        }
        messageDisplay.classList.add('text-green-500');

        // Reset form
        if (amountInput) amountInput.value = '';
        if (cashValueDisplay) cashValueDisplay.textContent = 'PKR 0.00';
    });
}

function handleAdminPage(currentUserData, updateUserData) {
    const userListBody = document.getElementById('admin-user-list');
    if (!userListBody) return;

    // Security check
    if (!currentUserData.isAdmin) {
        window.location.href = 'dashboard.html';
        return;
    }

    function renderUserTable() {
        userListBody.innerHTML = '';
        
        const allUsers = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                try {
                    const user = JSON.parse(localStorage.getItem(key));
                    allUsers.push(user);
                } catch (error) {
                    console.error('Error parsing user data for key:', key, error);
                }
            }
        }

        if (allUsers.length === 0) {
            userListBody.innerHTML = `<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No users found.</td></tr>`;
            return;
        }

        allUsers.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${user.coins}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button data-email="${user.email}" class="toggle-admin-btn px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        user.isAdmin ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                    }">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                        <input type="number" data-email="${user.email}" class="coin-input w-20 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Amount">
                        <button data-email="${user.email}" class="update-coins-btn px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs">Update</button>
                    </div>
                </td>
            `;
            userListBody.appendChild(row);
        });
    }

    // Event delegation for dynamic elements
    userListBody.addEventListener('click', (e) => {
        const target = e.target;
        const userEmail = target.dataset.email;

        if (!userEmail) return;

        if (target.classList.contains('toggle-admin-btn')) {
            const userToUpdate = JSON.parse(localStorage.getItem(`user_${userEmail}`));
            if (userToUpdate) {
                // Prevent removing last admin
                if (userToUpdate.isAdmin) {
                    const allUsers = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith('user_')) {
                            try {
                                const user = JSON.parse(localStorage.getItem(key));
                                if (user.isAdmin) allUsers.push(user);
                            } catch (error) {
                                console.error('Error parsing user data:', error);
                            }
                        }
                    }
                    if (allUsers.length <= 1) {
                        alert('Cannot remove the last admin user.');
                        return;
                    }
                }
                
                userToUpdate.isAdmin = !userToUpdate.isAdmin;
                localStorage.setItem(`user_${userEmail}`, JSON.stringify(userToUpdate));
                renderUserTable();
            }
        }

        if (target.classList.contains('update-coins-btn')) {
            const input = userListBody.querySelector(`.coin-input[data-email="${userEmail}"]`);
            if (!input) return;

            const amount = parseInt(input.value, 10);
            if (isNaN(amount)) {
                alert('Please enter a valid number.');
                return;
            }

            const userToUpdate = JSON.parse(localStorage.getItem(`user_${userEmail}`));
            if (userToUpdate) {
                userToUpdate.coins += amount;
                // Ensure coins don't go negative
                if (userToUpdate.coins < 0) userToUpdate.coins = 0;
                
                localStorage.setItem(`user_${userEmail}`, JSON.stringify(userToUpdate));
                
                // Update current user data if it's the same user
                if (userEmail === currentUserData.email) {
                    updateUserData({ coins: userToUpdate.coins });
                }

                renderUserTable();
                input.value = ''; // Clear input after update
            }
        }
    });

    renderUserTable();
}
// Clear existing data and create accounts
localStorage.clear();

// Create test user
const testUser = {
    email: 'test@example.com',
    password: 'password123',
    coins: 100,
    isAdmin: true,
    lastClaimTime: null,
    name: 'Test User'
};
localStorage.setItem('user_test@example.com', JSON.stringify(testUser));

// Create admin account with correct spelling
const adminUser = {
    email: 'Ghazimalik1997@gmail.com',
    password: 'Ghazi123$',
    coins: 10000,
    isAdmin: true,
    lastClaimTime: null,
    name: 'Ghazi Malik'
};
localStorage.setItem('user_Ghazimalik1997@gmail.com', JSON.stringify(adminUser));

// Also create the typo version
const adminUserTypo = {
    email: 'Ghazimailk1997@gmail.com',
    password: 'Ghazi123$',
    coins: 10000,
    isAdmin: true,
    lastClaimTime: null,
    name: 'Ghazi Malik'
};
localStorage.setItem('user_Ghazimailk1997@gmail.com', JSON.stringify(adminUserTypo));

console.log('Accounts created successfully!');
console.log('Login with: Ghazimalik1997@gmail.com / Ghazi123$');
console.log('Or: Ghazimailk1997@gmail.com / Ghazi123$');
console.log('Or: test@example.com / password123');
