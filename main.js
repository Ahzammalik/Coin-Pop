document.addEventListener('DOMContentLoaded', () => {
    // --- APP-WIDE LOGIC ---

    const userEmailDisplay = document.getElementById('user-email-display');
    const coinBalanceDisplay = document.getElementById('coin-balance-display');
    const logoutBtn = document.getElementById('logout-btn');
    const adminNavLink = document.getElementById('admin-nav-link');

    // For simulation: Create a dummy user if one doesn't exist.
    // In a real app, users would be created during signup.
    function initializeDummyUser() {
        if (!localStorage.getItem('user_test@example.com')) {
            const dummyUser = {
                email: 'test@example.com',
                password: 'password123', // In a real app, this should be hashed.
                coins: 100,
                isAdmin: true, // Set to true to test admin link
                lastClaimTime: null // No rewards claimed yet
            };
            localStorage.setItem('user_test@example.com', JSON.stringify(dummyUser));
        }
        // Simulate login by setting the current user
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', 'test@example.com');
        }
    }

    initializeDummyUser();

    // Check for a logged-in user
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) {
        // If no user is logged in, redirect to the login page (assumed to be index.html)
        window.location.href = 'index.html';
        return; // Stop further execution
    }

    // Load user data from localStorage
    let userData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));

    // Function to update user data in both the variable and localStorage
    function updateUserData(newData) {
        userData = { ...userData, ...newData };
        localStorage.setItem(`user_${currentUserEmail}`, JSON.stringify(userData));
        updateUI();
    }

    // Function to update all UI elements with current user data
    function updateUI() {
        if (userEmailDisplay) userEmailDisplay.textContent = userData.email;
        if (coinBalanceDisplay) coinBalanceDisplay.textContent = `Coins: ${userData.coins}`;
        if (adminNavLink && userData.isAdmin) {
            adminNavLink.style.display = 'flex';
        }
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html'; // Redirect to login
        });
    }

    // Initial UI update on page load
    updateUI();


    // --- DAILY REWARDS PAGE-SPECIFIC LOGIC ---

    const claimButton = document.getElementById('claim-reward-btn');
    const rewardMessage = document.getElementById('reward-message');
    const timerMessage = document.getElementById('timer-message');

    // This ensures the following code only runs on the rewards page
    if (claimButton) {
        const REWARD_AMOUNT = 50;
        const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        let countdownInterval;

        function checkRewardStatus() {
            const lastClaim = userData.lastClaimTime;
            if (!lastClaim) {
                // User has never claimed before
                enableClaimButton();
                return;
            }

            const now = Date.now();
            const timeSinceClaim = now - lastClaim;

            if (timeSinceClaim >= COOLDOWN_PERIOD) {
                // More than 24 hours have passed
                enableClaimButton();
            } else {
                // Cooldown period is active
                disableClaimButton();
                const remainingTime = COOLDOWN_PERIOD - timeSinceClaim;
                startCountdown(remainingTime);
            }
        }

        function enableClaimButton() {
            claimButton.disabled = false;
            claimButton.textContent = `Claim ${REWARD_AMOUNT} Coins`;
            rewardMessage.textContent = 'Your daily reward is ready. Claim it now!';
            timerMessage.style.display = 'none';
            if (countdownInterval) clearInterval(countdownInterval);
        }

        function disableClaimButton() {
            claimButton.disabled = true;
            claimButton.textContent = 'Reward Claimed';
            rewardMessage.textContent = 'You have already claimed your reward for today.';
            timerMessage.style.display = 'block';
        }

        function startCountdown(duration) {
            let timer = duration;
            countdownInterval = setInterval(() => {
                timer -= 1000;
                if (timer < 0) {
                    clearInterval(countdownInterval);
                    checkRewardStatus(); // Re-check status, which will enable the button
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

            // Update user data with new coins and the current timestamp
            updateUserData({
                coins: userData.coins + REWARD_AMOUNT,
                lastClaimTime: Date.now()
            });
            
            // Re-run the check to disable the button and start the timer
            checkRewardStatus();
        });

        // Initial check when the page loads
        checkRewardStatus();
    }
});
