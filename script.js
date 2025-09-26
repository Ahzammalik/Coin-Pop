document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // STATE MANAGEMENT & CONFIGURATION
    // =================================================================
    let user = {
        name: '',
        coins: 0
    };
    const MIN_WITHDRAWAL_PKR = 250;
    const COINS_PER_PKR = 100;

    // Admin Credentials (NOTE: Not secure, for testing only)
    const ADMIN_EMAIL = 'ghazimalik1997@gmail.com';
    const ADMIN_PASSWORD = 'ABC123';

    // Game Variables
    let currentScore = 0;
    let targetScore = 20;
    let rewardCoins = 5;
    let gameInterval;

    // =================================================================
    // DOM ELEMENT SELECTION
    // =================================================================
    const loginScreen = document.getElementById('login-screen');
    const loginButton = document.getElementById('login-button');
    const appContainer = document.getElementById('app-container');
    const screens = document.querySelectorAll('#app-container .screen');
    const navButtons = document.querySelectorAll('.nav-btn');
    const playNowBtn = document.getElementById('play-now-btn');
    const levelCompleteModal = document.getElementById('level-complete-modal');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const withdrawForm = document.getElementById('withdraw-form');

    // =================================================================
    // INITIALIZATION
    // =================================================================
    function init() {
        loadData();
        if (user.name) {
            showApp();
        } else {
            loginScreen.style.display = 'flex'; // Use flex for centering
            appContainer.style.display = 'none';
        }

        // Attach all primary event listeners
        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }
        navButtons.forEach(btn => btn.addEventListener('click', handleNav));
        playNowBtn.addEventListener('click', () => showScreen('play-screen'));
        document.getElementById('start-level-btn').addEventListener('click', startGame);
        nextLevelBtn.addEventListener('click', handleNextLevel);
        withdrawForm.addEventListener('submit', handleWithdrawal);
    }

    // =================================================================
    // DATA & AUTHENTICATION
    // =================================================================
    function saveData() {
        localStorage.setItem('coinPopUser', JSON.stringify(user));
    }

    function loadData() {
        const savedUser = localStorage.getItem('coinPopUser');
        if (savedUser) {
            user = JSON.parse(savedUser);
        }
    }

    function handleLogin() {
        const emailInput = document.getElementById('email-input').value.trim();
        const passwordInput = document.getElementById('password-input').value.trim();

        if (emailInput.toLowerCase() === ADMIN_EMAIL && passwordInput === ADMIN_PASSWORD) {
            user.name = emailInput;
            saveData();
            showApp();
        } else {
            // In a real app, you'd check a database for any user.
            // For this simulation, we'll just show an error if it's not the admin.
            alert('Invalid email or password. Please try again.');
        }
    }

    // =================================================================
    // UI & NAVIGATION
    // =================================================================
    function showApp() {
        loginScreen.style.display = 'none';
        appContainer.style.display = 'block';
        showScreen('dashboard-screen');
        updateDashboard();

        // Check if the logged-in user is the admin to show the admin button
        const adminNavBtn = document.getElementById('admin-nav-btn');
        if (user.name.toLowerCase() === ADMIN_EMAIL) {
            adminNavBtn.style.display = 'inline-block';
        } else {
            adminNavBtn.style.display = 'none';
        }
    }

    function showScreen(screenId) {
        screens.forEach(screen => screen.style.display = 'none');
        document.getElementById(screenId).style.display = 'block';
    }

    function handleNav(event) {
        const screenId = event.target.dataset.screen;
        if (screenId) {
            showScreen(screenId);
        }
    }

    function updateDashboard() {
        const pkrValue = user.coins / COINS_PER_PKR;

        document.getElementById('coin-balance-display').textContent = `Coins: ${user.coins}`;
        document.getElementById('wallet-coin-balance').textContent = user.coins;
        document.getElementById('wallet-pkr-value').textContent = `PKR ${pkrValue.toFixed(2)}`;

        const progress = Math.min((pkrValue / MIN_WITHDRAWAL_PKR) * 100, 100);
        document.getElementById('withdrawal-progress').style.width = `${progress}%`;

        const withdrawNavBtn = document.getElementById('withdraw-nav-btn');
        if (pkrValue >= MIN_WITHDRAWAL_PKR) {
            withdrawNavBtn.disabled = false;
            document.getElementById('withdrawal-message').textContent = 'You can now withdraw your earnings!';
            document.getElementById('withdraw-pkr-balance').textContent = `PKR ${pkrValue.toFixed(2)}`;
        } else {
            withdrawNavBtn.disabled = true;
            document.getElementById('withdrawal-message').textContent = `You need to reach PKR ${MIN_WITHDRAWAL_PKR} to unlock withdrawals.`;
        }
    }

    // =================================================================
    // GAME LOGIC
    // =================================================================
    function startGame() {
        document.getElementById('game-intro').style.display = 'none';
        const gameArea = document.getElementById('game-area');
        gameArea.style.display = 'block';
        gameArea.innerHTML = `<div id="game-hud">Score: <span id="current-score">0</span> / <span id="hud-target-score">${targetScore}</span></div>`;

        currentScore = 0;
        updateScoreDisplay();
        gameInterval = setInterval(spawnBalloon, 1000);
    }

    function updateScoreDisplay() {
        document.getElementById('current-score').textContent = currentScore;
    }

    function spawnBalloon() {
        const gameArea = document.getElementById('game-area');
        if (!gameArea) return;
        const balloon = document.createElement('div');
        balloon.className = 'balloon';

        const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502'];
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = `${Math.random() * (gameArea.clientWidth - 50)}px`;
        balloon.style.top = `${Math.random() * (gameArea.clientHeight - 65)}px`;

        balloon.addEventListener('click', () => popBalloon(balloon), { once: true });
        gameArea.appendChild(balloon);
    }

    function popBalloon(balloon) {
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

    // =================================================================
    // ADS & WITHDRAWALS
    // =================================================================
    function handleNextLevel() {
        levelCompleteModal.style.display = 'none';

        // GOOGLE ADS INTEGRATION POINT
        if (window.Android && typeof window.Android.showInterstitialAd === 'function') {
            window.Android.showInterstitialAd();
        } else {
            console.log("Not in Android app or function not available, skipping ad.");
            prepareNextLevel();
        }
    }

    window.adClosed = function() {
        console.log("Ad closed, preparing next level.");
        prepareNextLevel();
    }

    function prepareNextLevel() {
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('game-intro').style.display = 'block';
        showScreen('play-screen');
    }

    function handleWithdrawal(event) {
        event.preventDefault();
        const amount = document.getElementById('withdraw-amount').value;
        const method = document.getElementById('payment-method').value;
        const accountNumber = document.getElementById('account-number').value;

        if (amount && method && accountNumber) {
            alert(`Withdrawal Request Submitted:\nAmount: PKR ${amount}\nMethod: ${method}\nAccount: ${accountNumber}\n\nThis is a demo. A real app would send this to a server.`);
            withdrawForm.reset();
        } else {
            alert('Please fill out all fields.');
        }
    }

    // =================================================================
    // SCRIPT EXECUTION START
    // =================================================================
    init();
});
