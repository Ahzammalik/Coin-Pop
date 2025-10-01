// Global user data management
let currentUserData = null;

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm || signupForm) {
        handleAuthPages(loginForm, signupForm);
    } else {
        handleAuthenticatedPages();
    }
});

function handleAuthPages(loginForm, signupForm) {
    // Redirect if already logged in
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Handle login form
    if (loginForm) {
        handleLoginForm(loginForm);
    }

    // Handle signup form
    if (signupForm) {
        handleSignupForm(signupForm);
    }

    // Create admin account if it doesn't exist
    createAdminAccount();
}

function handleLoginForm(form) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const loginBtnText = document.getElementById('login-btn-text');
    const loginLoading = document.getElementById('login-loading');

    if (!emailInput || !passwordInput) {
        console.error('Login form elements not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (loginError) loginError.textContent = '';
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation
        if (!email || !password) {
            showFormError(loginError, 'Please enter both email and password.');
            return;
        }

        // Email validation
        if (!isValidEmail(email)) {
            showFormError(loginError, 'Please enter a valid email address.');
            return;
        }

        // Set loading state
        setButtonLoading(loginSubmitBtn, loginBtnText, loginLoading, true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const storedUser = localStorage.getItem(`user_${email}`);
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.password === password) {
                    localStorage.setItem('currentUser', email);
                    showNotification('Success', 'Login successful! Redirecting...', 'success');
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showFormError(loginError, 'Incorrect password. Please try again.');
                }
            } else {
                showFormError(loginError, 'No user found with that email address.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showFormError(loginError, 'An error occurred during login. Please try again.');
        } finally {
            setButtonLoading(loginSubmitBtn, loginBtnText, loginLoading, false);
        }
    });
}

function handleSignupForm(form) {
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const agreeTermsInput = document.getElementById('agree-terms');
    const signupError = document.getElementById('signup-error');
    const signupSubmitBtn = document.getElementById('signup-submit-btn');
    const signupBtnText = document.getElementById('signup-btn-text');
    const signupLoading = document.getElementById('signup-loading');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (signupError) signupError.textContent = '';
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        const agreeTerms = agreeTermsInput ? agreeTermsInput.checked : false;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showFormError(signupError, 'Please fill in all required fields.');
            return;
        }

        if (!isValidEmail(email)) {
            showFormError(signupError, 'Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            showFormError(signupError, 'Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            showFormError(signupError, 'Passwords do not match.');
            return;
        }

        if (!agreeTerms) {
            showFormError(signupError, 'You must agree to the terms and conditions.');
            return;
        }

        // Prevent creating account with admin email
        if (email === 'Ghazimalik1997@gmail.com') {
            showFormError(signupError, 'This email address is reserved for administration.');
            return;
        }

        // Set loading state
        setButtonLoading(signupSubmitBtn, signupBtnText, signupLoading, true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if user already exists
            if (localStorage.getItem(`user_${email}`)) {
                showFormError(signupError, 'User with this email already exists.');
                return;
            }

            // Create new user
            const newUser = {
                email: email,
                password: password,
                name: name,
                coins: 50,
                isAdmin: false,
                lastClaimTime: null,
                createdAt: new Date().toISOString(),
                sessions: 0,
                activities: [
                    {
                        icon: 'fa-user-plus',
                        title: 'Account Created',
                        time: new Date().toISOString(),
                        type: 'account'
                    }
                ]
            };

            localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
            localStorage.setItem('currentUser', email);
            
            showNotification('Success', 'Account created successfully! Redirecting...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            showFormError(signupError, 'An error occurred during registration. Please try again.');
        } finally {
            setButtonLoading(signupSubmitBtn, signupBtnText, signupLoading, false);
        }
    });
}

function handleAuthenticatedPages() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) {
        window.location.href = 'index.html';
        return;
    }

    // Load user data
    currentUserData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));
    
    // Check if user data exists
    if (!currentUserData) {
        console.error('User data not found, redirecting to login');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
        return;
    }

    // Update UI elements
    updateUI();

    // Set active navigation link
    setActiveNavLink();

    // Setup event listeners
    setupEventListeners();

    // Initialize page-specific functionality
    initializePageFeatures();
}

function updateUI() {
    const userEmailDisplay = document.getElementById('user-email-display');
    const userNameDisplay = document.getElementById('user-name-display');
    const coinBalanceDisplay = document.getElementById('coin-balance-display');
    const adminNavLink = document.getElementById('admin-nav-link');

    if (userEmailDisplay) userEmailDisplay.textContent = currentUserData.email;
    if (userNameDisplay) userNameDisplay.textContent = currentUserData.name || currentUserData.email.split('@')[0];
    if (coinBalanceDisplay) coinBalanceDisplay.textContent = `Coins: ${currentUserData.coins || 0}`;
    if (adminNavLink) {
        adminNavLink.style.display = currentUserData.isAdmin ? 'flex' : 'none';
    }
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshUserData();
        });
    }
}

function refreshUserData() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) return;

    // Reload user data from localStorage
    currentUserData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));
    
    if (currentUserData) {
        updateUI();
        showNotification('Data Refreshed', 'Your data has been updated successfully!', 'success');
    }
}

function initializePageFeatures() {
    // Page-specific initialization
    try {
        if (document.getElementById('claim-reward-btn')) {
            handleRewardsPage();
        }
        
        if (document.getElementById('pop-coin-btn')) {
            handlePlayPage();
        }
        
        if (document.getElementById('withdraw-form')) {
            handleWithdrawPage();
        }
        
        if (document.getElementById('admin-user-list')) {
            handleAdminPage();
        }
        
        if (document.getElementById('leaderboard-body')) {
            handleLeaderboardPage();
        }
        
        // Always handle dashboard updates
        handleDashboardUpdates();
        
    } catch (error) {
        console.error('Error initializing page features:', error);
    }
}

function handleDashboardUpdates() {
    const dashboardCoins = document.getElementById('dashboard-coins');
    const welcomeMessage = document.getElementById('welcome-message');
    
    if (dashboardCoins) {
        dashboardCoins.textContent = currentUserData.coins || 0;
    }
    
    if (welcomeMessage) {
        const displayName = currentUserData.name || currentUserData.email.split('@')[0];
        welcomeMessage.textContent = `Welcome back, ${displayName}!`;
    }
}

function handleRewardsPage() {
    const claimButton = document.getElementById('claim-reward-btn');
    if (!claimButton) return;
    
    const rewardMessage = document.getElementById('reward-message');
    const timerMessage = document.getElementById('timer-message');
    const REWARD_AMOUNT = 50;
    const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours
    let countdownInterval;

    function checkRewardStatus() {
        const lastClaim = currentUserData.lastClaimTime;
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
        
        // Update user data
        updateUserData({
            coins: (currentUserData.coins || 0) + REWARD_AMOUNT,
            lastClaimTime: Date.now()
        });
        
        // Add activity
        addUserActivity('Daily reward claimed', `Claimed ${REWARD_AMOUNT} coins`, 'fa-gift');
        
        showNotification('Reward Claimed', `You received ${REWARD_AMOUNT} coins!`, 'success');
        checkRewardStatus();
    });

    // Initialize reward status
    checkRewardStatus();
}

function handlePlayPage() {
    const popButton = document.getElementById('pop-coin-btn');
    if (!popButton) return;

    const resultMessage = document.getElementById('pop-result-message');

    popButton.addEventListener('click', () => {
        const coinsWon = Math.floor(Math.random() * 5) + 1;

        // Update user data
        updateUserData({
            coins: (currentUserData.coins || 0) + coinsWon,
            sessions: (currentUserData.sessions || 0) + 1
        });

        if (resultMessage) {
            resultMessage.textContent = `You won ${coinsWon} coins!`;
            resultMessage.className = 'text-green-600 font-semibold text-center';
            
            // Clear message after 2 seconds
            setTimeout(() => {
                resultMessage.textContent = 'Click the coin to earn more coins!';
                resultMessage.className = 'text-gray-600 text-center';
            }, 2000);
        }

        // Add animation
        popButton.classList.add('pop-animation');
        setTimeout(() => {
            popButton.classList.remove('pop-animation');
        }, 300);

        // Add activity for significant wins
        if (coinsWon >= 3) {
            addUserActivity('Big win!', `Won ${coinsWon} coins in a game`, 'fa-coins');
        }
    });
}

function handleWithdrawPage() {
    const withdrawForm = document.getElementById('withdraw-form');
    if (!withdrawForm) return;

    const amountInput = document.getElementById('withdraw-amount');
    const cashValueDisplay = document.getElementById('cash-value');
    const messageDisplay = document.getElementById('withdraw-message');

    const CONVERSION_RATE = 1000; // 1000 coins = PKR 1
    const MIN_WITHDRAWAL = 25000; // 25,000 coins = PKR 25

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
            showMessage(messageDisplay, 'Please enter a valid, positive number.', 'error');
            return;
        }

        if (amountToWithdraw > currentUserData.coins) {
            showMessage(messageDisplay, 'Insufficient coin balance for this withdrawal.', 'error');
            return;
        }

        if (amountToWithdraw < MIN_WITHDRAWAL) {
            showMessage(messageDisplay, `Minimum withdrawal is ${MIN_WITHDRAWAL.toLocaleString()} coins (PKR ${(MIN_WITHDRAWAL/CONVERSION_RATE).toFixed(2)}).`, 'error');
            return;
        }

        // Process withdrawal
        updateUserData({
            coins: currentUserData.coins - amountToWithdraw
        });

        const selectedMethod = withdrawForm.querySelector('input[name="method"]:checked');
        const methodName = selectedMethod ? selectedMethod.value : 'withdrawal';
        
        // Record payout
        recordPayout(amountToWithdraw, methodName);
        
        // Add activity
        addUserActivity('Withdrawal requested', `${amountToWithdraw.toLocaleString()} coins (PKR ${(amountToWithdraw/CONVERSION_RATE).toFixed(2)})`, 'fa-money-bill-wave');

        showMessage(messageDisplay, `Success! Your ${methodName} withdrawal of PKR ${(amountToWithdraw / CONVERSION_RATE).toFixed(2)} is being processed.`, 'success');

        // Reset form
        if (amountInput) amountInput.value = '';
        if (cashValueDisplay) cashValueDisplay.textContent = 'PKR 0.00';
    });
}

function handleLeaderboardPage() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return;

    function renderLeaderboard() {
        const allUsers = getAllUsers();
        allUsers.sort((a, b) => (b.coins || 0) - (a.coins || 0));
        
        leaderboardBody.innerHTML = '';

        if (allUsers.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">No players found.</td></tr>`;
            return;
        }

        allUsers.forEach((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.email === currentUserData.email;

            const row = document.createElement('tr');
            if (isCurrentUser) {
                row.className = 'user-highlight';
            }

            // Rank badge
            let rankClass = 'rank-other';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';

            // Player info
            const displayName = user.name || user.email.split('@')[0];
            const level = Math.floor((user.coins || 0) / 1000) + 1;
            const pkrValue = Math.floor((user.coins || 0) / 1000);

            row.innerHTML = `
                <td>
                    <div class="rank-badge ${rankClass}">${rank}</div>
                </td>
                <td>
                    <div class="player-info">
                        <div class="player-avatar">${displayName.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="player-name">${displayName}${isCurrentUser ? ' (You)' : ''}</div>
                            <div class="player-level">Level ${level}</div>
                        </div>
                    </div>
                </td>
                <td>${level}</td>
                <td class="coins-amount">${(user.coins || 0).toLocaleString()}</td>
                <td class="payout-amount">PKR ${pkrValue}</td>
                <td>
                    <span class="payout-status status-completed">Active</span>
                </td>
            `;

            leaderboardBody.appendChild(row);
        });
    }

    renderLeaderboard();
}

function handleAdminPage() {
    const userListBody = document.getElementById('admin-user-list');
    if (!userListBody) return;

    // Security check
    if (!currentUserData.isAdmin) {
        window.location.href = 'dashboard.html';
        return;
    }

    function renderUserTable() {
        const allUsers = getAllUsers();
        userListBody.innerHTML = '';

        if (allUsers.length === 0) {
            userListBody.innerHTML = `<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No users found.</td></tr>`;
            return;
        }

        allUsers.forEach(user => {
            const isCurrentUser = user.email === currentUserData.email;
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="player-info">
                        <div class="player-avatar">${(user.name || user.email).charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="player-name">${user.name || user.email.split('@')[0]}${isCurrentUser ? ' (You)' : ''}</div>
                            <div class="player-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" data-email="${user.email}" class="coin-input w-24 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value="${user.coins || 0}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button data-email="${user.email}" class="toggle-admin-btn px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        user.isAdmin ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                    }">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                        <button data-email="${user.email}" class="update-coins-btn px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs">Update</button>
                        ${!isCurrentUser ? `<button data-email="${user.email}" class="delete-user-btn px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs">Delete</button>` : ''}
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
            toggleAdminStatus(userEmail);
        }

        if (target.classList.contains('update-coins-btn')) {
            updateUserCoins(userEmail);
        }

        if (target.classList.contains('delete-user-btn')) {
            deleteUser(userEmail);
        }
    });

    renderUserTable();
}

// Utility Functions
function updateUserData(newData) {
    currentUserData = { ...currentUserData, ...newData };
    localStorage.setItem(`user_${currentUserData.email}`, JSON.stringify(currentUserData));
    updateUI();
}

function addUserActivity(title, description, icon) {
    if (!currentUserData.activities) {
        currentUserData.activities = [];
    }
    
    currentUserData.activities.push({
        icon: icon,
        title: title,
        description: description,
        time: new Date().toISOString()
    });
    
    // Keep only last 10 activities
    if (currentUserData.activities.length > 10) {
        currentUserData.activities = currentUserData.activities.slice(-10);
    }
    
    updateUserData({ activities: currentUserData.activities });
}

function getAllUsers() {
    const allUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            try {
                const user = JSON.parse(localStorage.getItem(key));
                allUsers.push(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }
    return allUsers;
}

function createAdminAccount() {
    const adminEmail = "Ghazimalik1997@gmail.com";
    const adminPassword = "Ghazi123$";
    
    if (!localStorage.getItem(`user_${adminEmail}`)) {
        const adminUser = {
            email: adminEmail,
            password: adminPassword,
            coins: 10000,
            isAdmin: true,
            lastClaimTime: null,
            name: "Ghazi Malik",
            status: "active",
            createdAt: new Date().toISOString(),
            activities: [
                {
                    icon: 'fa-user-shield',
                    title: 'Admin Account Created',
                    time: new Date().toISOString(),
                    type: 'admin'
                }
            ]
        };
        localStorage.setItem(`user_${adminEmail}`, JSON.stringify(adminUser));
        console.log("Admin account created successfully");
    }
}

function recordPayout(amount, method) {
    const payouts = JSON.parse(localStorage.getItem('payouts') || '[]');
    const payout = {
        id: Date.now(),
        player: currentUserData.name || currentUserData.email.split('@')[0],
        amount: Math.floor(amount / 1000), // Convert coins to PKR
        method: method,
        date: new Date().toISOString(),
        status: 'Pending'
    };
    payouts.push(payout);
    localStorage.setItem('payouts', JSON.stringify(payouts));
}

function toggleAdminStatus(userEmail) {
    const userToUpdate = JSON.parse(localStorage.getItem(`user_${userEmail}`));
    if (!userToUpdate) return;

    // Prevent removing last admin
    if (userToUpdate.isAdmin) {
        const adminUsers = getAllUsers().filter(user => user.isAdmin);
        if (adminUsers.length <= 1) {
            showNotification('Error', 'Cannot remove the last admin user.', 'error');
            return;
        }
    }
    
    userToUpdate.isAdmin = !userToUpdate.isAdmin;
    localStorage.setItem(`user_${userEmail}`, JSON.stringify(userToUpdate));
    
    // Update current user data if it's the same user
    if (userEmail === currentUserData.email) {
        currentUserData.isAdmin = userToUpdate.isAdmin;
        updateUI();
    }
    
    showNotification('Success', `Admin status updated for ${userToUpdate.name || userEmail}`, 'success');
    
    // Re-render the table
    if (document.getElementById('admin-user-list')) {
        handleAdminPage();
    }
}

function updateUserCoins(userEmail) {
    const input = document.querySelector(`.coin-input[data-email="${userEmail}"]`);
    if (!input) return;

    const amount = parseInt(input.value, 10);
    if (isNaN(amount)) {
        showNotification('Error', 'Please enter a valid number.', 'error');
        return;
    }

    const userToUpdate = JSON.parse(localStorage.getItem(`user_${userEmail}`));
    if (userToUpdate) {
        userToUpdate.coins = Math.max(0, amount); // Ensure coins don't go negative
        localStorage.setItem(`user_${userEmail}`, JSON.stringify(userToUpdate));
        
        // Update current user data if it's the same user
        if (userEmail === currentUserData.email) {
            currentUserData.coins = userToUpdate.coins;
            updateUI();
        }
        
        showNotification('Success', `Coins updated for ${userToUpdate.name || userEmail}`, 'success');
        
        // Re-render the table
        if (document.getElementById('admin-user-list')) {
            handleAdminPage();
        }
    }
}

function deleteUser(userEmail) {
    if (userEmail === currentUserData.email) {
        showNotification('Error', 'You cannot delete your own account.', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
        localStorage.removeItem(`user_${userEmail}`);
        showNotification('Success', `User ${userEmail} has been deleted.`, 'success');
        
        // Re-render the table
        if (document.getElementById('admin-user-list')) {
            handleAdminPage();
        }
    }
}

// Helper Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function showMessage(element, message, type) {
    if (element) {
        element.textContent = message;
        element.className = type === 'error' ? 'text-red-500' : 'text-green-500';
    }
}

function setButtonLoading(button, btnText, loading, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        if (btnText) btnText.textContent = 'Processing...';
        if (loading) loading.style.display = 'inline-block';
    } else {
        button.disabled = false;
        if (btnText) {
            if (button.id === 'login-submit-btn') btnText.textContent = 'Sign in';
            if (button.id === 'signup-submit-btn') btnText.textContent = 'Create Account';
        }
        if (loading) loading.style.display = 'none';
    }
}

function showNotification(title, message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div class="notification-content">
                <div class="notification-title"></div>
                <div class="notification-message"></div>
            </div>
        `;
        document.body.appendChild(notification);
    }

    const notificationTitle = notification.querySelector('.notification-title');
    const notificationMessage = notification.querySelector('.notification-message');
    
    // Set notification content and type
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    notification.className = `notification notification-${type}`;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Make updateUserData available globally for other scripts
window.updateUserData = updateUserData;
window.refreshUserData = refreshUserData;
