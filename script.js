document.addEventListener('DOMContentLoaded', () => {
    // STATE MANAGEMENT
    let user = {
        email: '', // Now storing email for login
        coins: 0
    };
    let isSigningUp = false; // To toggle between Sign In/Sign Up form
    const MIN_WITHDRAWAL_PKR = 250;
    const COINS_PER_PKR = 100;

    // DOM ELEMENTS
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const authSubmitButton = document.getElementById('auth-submit-button');
    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const signOutBtn = document.getElementById('sign-out-btn'); // New sign out button
    
    const screens = document.querySelectorAll('#app-container .screen');
    const navButtons = document.querySelectorAll('header .nav-btn');
    const playNowBtn = document.getElementById('play-now-btn');
    const levelCompleteModal = document.getElementById('level-complete-modal');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const withdrawForm = document.getElementById('withdraw-form');

    // GAME VARIABLES
    let currentScore = 0;
    let targetScore = 20;
    let rewardCoins = 5;
    let gameInterval;

    // --- INITIALIZATION ---
    function init() {
        loadData();
        if (user.email) { // Check for email instead of name
            showApp();
        } else {
            loginScreen.classList.add('active');
        }
        
        // Event Listeners for new UI elements
        authSubmitButton.addEventListener('click', handleAuth);
        signInTab.addEventListener('click', () => toggleAuthMode(false));
        signUpTab.addEventListener('click', () => toggleAuthMode(true));
        signOutBtn.addEventListener('click', handleSignOut); // New event listener

        navButtons.forEach(btn => btn.addEventListener('click', handleNav));
        playNowBtn.addEventListener('click', () => {
            showScreen('play-screen');
            // Ensure game intro is visible when navigating to play screen
            document.getElementById('game-intro').style.display = 'block';
            document.getElementById('game-area').style.display = 'none';
        });
        document.getElementById('start-level-btn').addEventListener('click', startGame);
        nextLevelBtn.addEventListener('click', handleNextLevel);
        withdrawForm.addEventListener('submit', handleWithdrawal);

        // Footer nav listeners
        document.querySelectorAll('footer .nav-btn').forEach(btn => btn.addEventListener('click', handleNav));
    }

    // --- DATA PERSISTENCE ---
    function saveData() {
        localStorage.setItem('coinPopUser', JSON.stringify(user));
    }

    function loadData() {
        const savedUser = localStorage.getItem('coinPopUser');
        if (savedUser) {
            user = JSON.parse(savedUser);
        }
    }

    // --- UI & NAVIGATION ---
    function toggleAuthMode(isSignUpMode) {
        isSigningUp = isSignUpMode;
        if (isSigningUp) {
            signUpTab.classList.add('active');
            signInTab.classList.remove('active');
            authSubmitButton.textContent = 'Sign Up';
        } else {
            signInTab.classList.add('active');
            signUpTab.classList.remove('active');
            authSubmitButton.textContent = 'Sign In';
        }
    }

    function handleAuth() {
        const email = emailInput.value.trim();
        const password = passwordInput.value; // In a real app, hash this!

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        // --- Client-side demo auth logic (simplified) ---
        // In a real app, this would involve Firebase or a backend API call
        if (isSigningUp) {
            // For demo: just save the email. In real app: create new user.
            user.email = email;
            user.coins = 0; // New user starts with 0 coins
            saveData();
            alert('Account created! You are now signed in.');
            showApp();
        } else {
            // For demo: check if email exists in localStorage. Assume password is "valid".
            const savedUser = JSON.parse(localStorage.getItem('coinPopUser'));
            if (savedUser && savedUser.email === email) {
                user = savedUser; // Load existing user data
                alert('Signed in successfully!');
                showApp();
            } else {
                alert('Invalid email or password. Please try again or sign up.');
            }
        }
    }

    function handleSignOut() {
        if (confirm('Are you sure you want to sign out?')) {
            user = { email: '', coins: 0 }; // Clear user data
            saveData(); // Save empty user to localStorage
            appContainer.style.display = 'none';
            loginScreen.style.display = 'flex'; // Show login screen
            loginScreen.classList.add('active');
            emailInput.value = ''; // Clear inputs
            passwordInput.value = '';
            toggleAuthMode(false); // Reset to sign-in tab
            alert('You have been signed out.');
        }
    }

    function showApp() {
        loginScreen.style.display = 'none';
        appContainer.style.display = 'block';
        showScreen('dashboard-screen');
        updateDashboard();
    }
    
    function showScreen(screenId) {
        screens.forEach(screen => screen.style.display = 'none');
        document.getElementById(screenId).style.display = 'block';
        
        // Update active state for nav buttons
        navButtons.forEach(btn => {
            if (btn.dataset.screen === screenId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        // Footer nav buttons don't have active state for screens.
    }

    function handleNav(event) {
        const screenId = event.target.dataset.screen;
        showScreen(screenId);
    }

    function updateDashboard() {
        const pkrValue = user.coins / COINS_PER_PKR;
        
        document.getElementById('coin-balance-display').textContent = user.coins; // Only show coins at top
        document.getElementById('wallet-coin-balance').textContent = user.coins;
        document.getElementById('wallet-pkr-value').textContent = `PKR ${pkrValue.toFixed(2)}`;
        
        const progress = Math.min((pkrValue / MIN_WITHDRAWAL_PKR) * 100, 100);
        document.getElementById('withdrawal-progress').style.width = `${progress}%`;

        const withdrawNavBtn = document.getElementById('withdraw-nav-btn');
        if (pkrValue >= MIN_WITHDRAWAL_PKR) {
            withdrawNavBtn.disabled = false;
            document.getElementById('withdrawal-message').textContent = 'You can now withdraw your earnings!';
            document.getElementById('withdraw-pkr-balance').textContent = `PKR ${pkrValue.toFixed(2)}`;
            document.getElementById('withdraw-amount').max = Math.floor(pkrValue); // Set max withdrawable amount
        } else {
            withdrawNavBtn.disabled = true;
            document.getElementById('withdrawal-message').textContent = `You need to reach PKR ${MIN_WITHDRAWAL_PKR} to unlock withdrawals.`;
            document.getElementById('withdraw-pkr-balance').textContent = `PKR ${pkrValue.toFixed(2)}`;
            document.getElementById('withdraw-amount').max = 0; // Cannot withdraw
        }
    }

    // --- GAME LOGIC ---
    function startGame() {
        document.getElementById('game-intro').style.display = 'none';
        const gameArea = document.getElementById('game-area');
        gameArea.style.display = 'block';
        gameArea.innerHTML = `<div id="game-hud">Score: <span id="current-score">0</span> / <span id="hud-target-score">${targetScore}</span></div>`; // Reset area and HUD

        currentScore = 0;
        updateScoreDisplay();
        gameInterval = setInterval(spawnBalloon, 1000); // Spawn every 1 second
    }
    
    function updateScoreDisplay() {
        document.getElementById('current-score').textContent = currentScore;
        document.getElementById('hud-target-score').textContent = targetScore;
    }

    function spawnBalloon() {
        const gameArea = document.getElementById('game-area');
        if (currentScore >= targetScore) return; // Stop spawning if level complete

        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#9c27b0', '#ff9800']; // More colors
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random position within game area
        const maxLeft = gameArea.clientWidth - 60; // balloon width
        const maxTop = gameArea.clientHeight - 75; // balloon height
        balloon.style.left = `${Math.random() * maxLeft}px`;
        balloon.style.top = `${Math.random() * maxTop}px`;

        balloon.addEventListener('click', () => {
            popBalloon(balloon);
        });

        gameArea.appendChild(balloon);

        // Remove balloon after some time if not popped to prevent clutter
        setTimeout(() => {
            if (balloon.parentNode === gameArea) {
                balloon.remove();
            }
        }, 5000); // Remove after 5 seconds
    }

    function popBalloon(balloon) {
        // Optional: Add a popping sound
        // const popSound = new Audio('pop.mp3');
        // popSound.play();
        
        balloon.remove();
        currentScore++;
        updateScoreDisplay();

        if (currentScore >= targetScore) {
            endLevel();
        }
    }

    function endLevel() {
        clearInterval(gameInterval);
        user.coins += rewardCoins;
        saveData();
        updateDashboard();
        
        document.getElementById('modal-coins-earned').textContent = rewardCoins;
        levelCompleteModal.style.display = 'flex';
    }

    function handleNextLevel() {
        levelCompleteModal.style.display = 'none';
        
        // *** GOOGLE ADS INTEGRATION POINT ***
        if (window.Android && typeof window.Android.showInterstitialAd === 'function') {
            window.Android.showInterstitialAd();
        } else {
            console.log("Not in Android app, skipping ad.");
            prepareNextLevel();
        }
    }
    
    // This function will be called by Android after the ad is closed.
    window.adClosed = function() {
        console.log("Ad closed, preparing next level.");
        prepareNextLevel();
    }

    function prepareNextLevel() {
        // Reset game for next level
        targetScore += 10; // Increase difficulty
        rewardCoins += 2; // Increase reward
        document.getElementById('target-score').textContent = targetScore;
        document.getElementById('reward-coins').textContent = rewardCoins;
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('game-intro').style.display = 'block';
        showScreen('play-screen');
    }

    // --- WITHDRAWAL LOGIC ---
    function handleWithdrawal(event) {
        event.preventDefault();
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const method = document.getElementById('payment-method').value;
        const accountNumber = document.getElementById('account-number').value;
        const pkrBalance = user.coins / COINS_PER_PKR;


        if(amount < MIN_WITHDRAWAL_PKR) {
            alert(`Minimum withdrawal amount is PKR ${MIN_WITHDRAWAL_PKR}.`);
            return;
        }

        if(amount > pkrBalance) {
            alert(`You only have PKR ${pkrBalance.toFixed(2)} available for withdrawal.`);
            return;
        }

        if(amount && method && accountNumber) {
            if (confirm(`Confirm withdrawal request:\nAmount: PKR ${amount}\nMethod: ${method}\nAccount: ${accountNumber}`)) {
                // Deduct coins/PKR from user balance (for demo only, real app needs backend verification)
                user.coins -= amount * COINS_PER_PKR;
                saveData();
                updateDashboard();

                alert(`Withdrawal Request Submitted!\nAmount: PKR ${amount}\nMethod: ${method}\nAccount: ${accountNumber}\n\nThis is a client-side demo. In a real app, this request would be sent to a secure server for processing and manual payout.`);
                withdrawForm.reset();
            }
        } else {
            alert('Please fill out all fields.');
        }
    }

    // --- Admin Panel Placeholder ---
    // (This requires a backend, so keeping it commented out for client-side demo)
    // function checkAdminAccess() {
    //     if (user.email === 'Ghazimalik1997@gmail.com') {
    //         document.querySelector('[data-screen="admin-screen"]').style.display = 'block';
    //     } else {
    //         document.querySelector('[data-screen="admin-screen"]').style.display = 'none';
    //     }
    // }

    init();
});
// Find your existing showApp() function and add the 'if' block.

function showApp() {
    loginScreen.style.display = 'none';
    appContainer.style.display = 'block';
    showScreen('dashboard-screen');
    updateDashboard();

    // --- Add this logic ---
    // Check if the logged-in user is the admin
    const adminNavBtn = document.getElementById('admin-nav-btn');
    if (user.name.toLowerCase() === 'ghazimalik1997@gmail.com') {
        // If they are, show the admin button in the navigation
        adminNavBtn.style.display = 'inline-block';
        console.log("Admin access granted.");
    } else {
        // Otherwise, make sure it's hidden
        adminNavBtn.style.display = 'none';
    }
    // --- End of new logic ---
}
