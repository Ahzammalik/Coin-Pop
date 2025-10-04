document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        handleLoginPage(loginForm);
    } else {
        handleAuthenticatedPages();
    }
});

function handleLoginPage(form) {
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
        // In case the user tries to access a page directly without a login page, like signin.html,
        // we should try to redirect to the login page, assuming it's named index.html or signin.html
        // A check prevents a redirect loop if the login page itself is missing.
        if (!window.location.pathname.endsWith('signin.html') && !window.location.pathname.endsWith('index.html')) {
            window.location.href = 'signin.html';
        }
        return;
    }

    // Centralized User Data Management
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
        const path = window.location.pathname.split('/').pop();
        const currentPage = path === '' ? 'dashboard.html' : path; // Default to dashboard
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'signin.html';
    });
    
    // Initial setup
    initializeDummyUser();
    updateUI();
    setActiveNavLink();

    // --- PAGE-SPECIFIC LOGIC ---
    handleDashboardPage(userData);
    handleRewardsPage(userData, updateUserData);
    handlePlayPage(userData, updateUserData);
    handleLeaderboardPage(userData);
    handleWithdrawPage(userData, updateUserData);
    handleAdminPage(userData, updateUserData);
}

function initializeDummyUser() {
    if (!localStorage.getItem('user_test@example.com')) {
        const dummyUser = { email: 'test@example.com', password: 'password123', coins: 100, isAdmin: true, lastClaimTime: null };
        localStorage.setItem('user_test@example.com', JSON.stringify(dummyUser));
    }
}

function handleRewardsPage(userData, updateUserData) {
    const claimButton = document.getElementById('claim-reward-btn');
    if (!claimButton) return;
    
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

    function enableClaimButton() {
        claimButton.disabled = false;
        claimButton.textContent = `Claim ${REWARD_AMOUNT} Coins`;
        rewardMessage.textContent = 'Your daily reward is ready. Claim it now!';
        timerMessage.style.display = 'none';
        if (countdownInterval) clearInterval(countdownInterval);
    }
    function disableClaimButton(duration) {
        claimButton.disabled = true;
        claimButton.textContent = 'Reward Claimed';
        rewardMessage.textContent = 'You have already claimed your reward for today.';
        timerMessage.style.display = 'block';
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
                const h = Math.floor((timer / 3600000) % 24);
                const m = Math.floor((timer / 60000) % 60);
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

function handleDashboardPage(userData) {
    const welcomeMessage = document.getElementById('welcome-message');
    if (!welcomeMessage) return;

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
    function checkRewardStatus() {
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
                dashboardRewardTimer.textContent = `${h}h ${m}m ${s}s`;
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
        resultMessage.textContent = `You won ${coinsWon} coins!`;
        popButton.classList.add('pop-animation');
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
            allUsers.push(JSON.parse(localStorage.getItem(key)));
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
            row.className = 'bg-blue-50 font-semibold';
        }
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">#${rank}</td>
            <td class="px-6 py-4 whitespace-nowrap">${user.email.split('@')[0]}${isCurrentUser ? ' (You)' : ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-blue-600 font-bold">${user.coins}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

function handleWithdrawPage(userData, updateUserData) {
    const withdrawForm = document.getElementById('withdraw-form');
    if (!withdrawForm) return;

    const amountInput = document.getElementById('withdraw-amount');
    const cashValueDisplay = document.getElementById('cash-value');
    const messageDisplay = document.getElementById('withdraw-message');
    const CONVERSION_RATE = 1000;

    amountInput.addEventListener('input', () => {
        const amount = parseInt(amountInput.value, 10) || 0;
        const value = (amount / CONVERSION_RATE).toFixed(2);
        cashValueDisplay.textContent = `$${value}`;
    });

    withdrawForm.addEventListener('submit', (e) => {
        e.preventDefault();
        messageDisplay.textContent = '';
        messageDisplay.classList.remove('text-red-500', 'text-green-500');
        const amountToWithdraw = parseInt(amountInput.value, 10);

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

        updateUserData({
            coins: userData.coins - amountToWithdraw
        });
        const selectedMethod = withdrawForm.querySelector('input[name="method"]:checked').value;
        messageDisplay.textContent = `Success! Your ${selectedMethod} reward is being processed.`;
        messageDisplay.classList.add('text-green-500');
        amountInput.value = '';
        cashValueDisplay.textContent = '$0.00';
    });
}

function handleAdminPage(currentUserData, updateUserData) {
    const userListBody = document.getElementById('admin-user-list');
    if (!userListBody) return;

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

    userListBody.addEventListener('click', (e) => {
        const target = e.target;
        const userEmail = target.dataset.email;
        if (!userEmail) return;

        if (target.classList.contains('toggle-admin-btn')) {
            const userToUpdate = JSON.parse(localStorage.getItem(`user_${userEmail}`));
            userToUpdate.isAdmin = !userToUpdate.isAdmin;
            localStorage.setItem(`user_${userEmail}`, JSON.stringify(userToUpdate));
            renderUserTable();
        }

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
            if (userEmail === currentUserData.email) {
                updateUserData({ coins: userToUpdate.coins });
            }
            renderUserTable();
        }
    });
    
    renderUserTable();
}
