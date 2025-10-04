document.addEventListener('DOMContentLoaded', () => {

    // --- PAGE ROUTING AND LOGIC ---

    // If on the login page, handle login logic.
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        handleLoginPage(loginForm);
    } else {
        // If on any other page, run the main app logic for authenticated users.
        handleAuthenticatedPages();
    }

    // --- FUNCTION DEFINITIONS ---

    function handleLoginPage(form) {
        // If user is already logged in, redirect them to the dashboard
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
                // In a real app, passwords would be hashed and compared securely.
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

            const newUser = {
                email: email,
                password: password,
                coins: 50, // Starting bonus
                isAdmin: false,
                lastClaimTime: null
            };
            localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
            alert("Account created successfully! You can now log in.");
            emailInput.value = email;
            passwordInput.value = '';
        });
    }


    function handleAuthenticatedPages() {
        // --- APP-WIDE LOGIC (FOR LOGGED-IN USERS) ---
        const userEmailDisplay = document.getElementById('user-email-display');
        const coinBalanceDisplay = document.getElementById('coin-balance-display');
        const logoutBtn = document.getElementById('logout-btn');
        const adminNavLink = document.getElementById('admin-nav-link');

        // Check for a logged-in user
        const currentUserEmail = localStorage.getItem('currentUser');
        if (!currentUserEmail) {
            window.location.href = 'index.html';
            return;
        }

        let userData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));

        function updateUserData(newData) {
            userData = { ...userData, ...newData };
            localStorage.setItem(`user_${currentUserEmail}`, JSON.stringify(userData));
            updateUI();
        }

        function updateUI() {
            if (userEmailDisplay) userEmailDisplay.textContent = userData.email;
            if (coinBalanceDisplay) coinBalanceDisplay.textContent = `Coins: ${userData.coins}`;
            if (adminNavLink && userData.isAdmin) {
                adminNavLink.style.display = 'flex';
            }
        }
        
        function setActiveNavLink() {
            const currentPage = window.location.pathname.split('/').pop();
            // Fallback for root path or empty path
            const activePage = currentPage === '' ? 'dashboard.html' : currentPage;
            const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === activePage) {
                    link.classList.add('active');
                }
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
        
        // Initial setup for authenticated pages
        updateUI();
        setActiveNavLink();
        initializeDummyUser(); // Ensure test user exists for demo

        // --- PAGE-SPECIFIC LOGIC ---
        handleRewardsPage(); // Run logic for the Daily Rewards page
    }

    function initializeDummyUser() {
        if (!localStorage.getItem('user_test@example.com')) {
            const dummyUser = {
                email: 'test@example.com',
                password: 'password123',
                coins: 100,
                isAdmin: true,
                lastClaimTime: null
            };
            localStorage.setItem('user_test@example.com', JSON.stringify(dummyUser));
        }
    }
    
    function handleRewardsPage() {
        const claimButton = document.getElementById('claim-reward-btn');
        if (!claimButton) return; // Only run if on the rewards page

        const rewardMessage = document.getElementById('reward-message');
        const timerMessage = document.getElementById('timer-message');
        
        const REWARD_AMOUNT = 50;
        const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;
        let countdownInterval;
        
        // This function must re-fetch user data as it's not in the same scope
        let userData = JSON.parse(localStorage.getItem(`user_${localStorage.getItem('currentUser')}`));
        const updateUserData = (newData) => {
             userData = { ...userData, ...newData };
             localStorage.setItem(`user_${userData.email}`, JSON.stringify(userData));
             // Re-render coin balance in header immediately
             document.getElementById('coin-balance-display').textContent = `Coins: ${userData.coins}`;
        };

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
                    const hours = Math.floor((timer / (1000 * 60 * 60)) % 24);
                    const minutes = Math.floor((timer / (1000 * 60)) % 60);
                    const seconds = Math.floor((timer / 1000) % 60);
                    timerMessage.textContent = `Next claim in: ${hours}h ${minutes}m ${seconds}s`;
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
});
// --- PAGE-SPECIFIC LOGIC ---
handleRewardsPage(); // Run logic for the Daily Rewards page
// --- PAGE-SPECIFIC LOGIC ---
handleRewardsPage();
handleDashboardPage(); // Run logic for the Dashboard page
function handleDashboardPage() {
    const welcomeMessage = document.getElementById('welcome-message');
    // Only run if we are on the dashboard page
    if (!welcomeMessage) return;

    const dashboardCoins = document.getElementById('dashboard-coins');
    const dashboardRank = document.getElementById('dashboard-rank');
    const dashboardRewardTimer = document.getElementById('dashboard-reward-timer');
    let rewardCountdownInterval;

    const currentUserEmail = localStorage.getItem('currentUser');
    const userData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));

    // 1. Set Welcome Message and Coin Balance
    welcomeMessage.textContent = `Welcome back, ${userData.email.split('@')[0]}!`;
    dashboardCoins.textContent = userData.coins;

    // 2. Calculate and Display Leaderboard Rank
    function calculateRank() {
        const allUsers = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                allUsers.push(JSON.parse(localStorage.getItem(key)));
            }
        }
        
        // Sort users by coins in descending order
        allUsers.sort((a, b) => b.coins - a.coins);
        
        // Find the rank (index + 1) of the current user
        const userRank = allUsers.findIndex(user => user.email === currentUserEmail) + 1;
        
        dashboardRank.textContent = `#${userRank}`;
    }
    
    calculateRank();

    // 3. Display Daily Reward Status
    function checkRewardStatus() {
        const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;
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
                const hours = Math.floor((timer / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((timer / (1000 * 60)) % 60);
                const seconds = Math.floor((timer / 1000) % 60);
                dashboardRewardTimer.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000);
    }
    
    checkRewardStatus();
}
