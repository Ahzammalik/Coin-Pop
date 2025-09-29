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
