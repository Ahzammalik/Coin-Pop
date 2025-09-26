document.addEventListener('DOMContentLoaded', () => {
    // STATE MANAGEMENT
    let user = {
        name: '',
        coins: 0
    };
    const MIN_WITHDRAWAL_PKR = 250;
    const COINS_PER_PKR = 100;

    // DOM ELEMENTS
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');
    const screens = document.querySelectorAll('#app-container .screen');
    const navButtons = document.querySelectorAll('.nav-btn');
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
        if (user.name) {
            showApp();
        } else {
            loginScreen.classList.add('active');
        }
        
        loginButton.addEventListener('click', handleLogin);
        navButtons.forEach(btn => btn.addEventListener('click', handleNav));
        playNowBtn.addEventListener('click', () => showScreen('play-screen'));
        document.getElementById('start-level-btn').addEventListener('click', startGame);
        nextLevelBtn.addEventListener('click', handleNextLevel);
        withdrawForm.addEventListener('submit', handleWithdrawal);
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
    function handleLogin() {
        const username = usernameInput.value.trim();
        if (username) {
            user.name = username;
            saveData();
            showApp();
        } else {
            alert('Please enter your name.');
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
    }

    function handleNav(event) {
        const screenId = event.target.dataset.screen;
        showScreen(screenId);
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

    // --- GAME LOGIC ---
    function startGame() {
        document.getElementById('game-intro').style.display = 'none';
        const gameArea = document.getElementById('game-area');
        gameArea.style.display = 'block';
        gameArea.innerHTML = `<div id="game-hud">Score: <span id="current-score">0</span> / <span id="hud-target-score">20</span></div>`; // Reset area

        currentScore = 0;
        updateScoreDisplay();
        gameInterval = setInterval(spawnBalloon, 1000);
    }
    
    function updateScoreDisplay() {
        document.getElementById('current-score').textContent = currentScore;
        document.getElementById('hud-target-score').textContent = targetScore;
    }

    function spawnBalloon() {
        const gameArea = document.getElementById('game-area');
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502'];
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = `${Math.random() * (gameArea.clientWidth - 50)}px`;
        balloon.style.top = `${Math.random() * (gameArea.clientHeight - 65)}px`;

        balloon.addEventListener('click', () => {
            popBalloon(balloon);
        });

        gameArea.appendChild(balloon);
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
        // This is where we will ask the Android App to show an ad.
        if (window.Android && typeof window.Android.showInterstitialAd === 'function') {
            window.Android.showInterstitialAd();
        } else {
            // If not in the app, just start the next level immediately.
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
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('game-intro').style.display = 'block';
        showScreen('play-screen');
    }

    // --- WITHDRAWAL LOGIC ---
    function handleWithdrawal(event) {
        event.preventDefault();
        const amount = document.getElementById('withdraw-amount').value;
        const method = document.getElementById('payment-method').value;
        const accountNumber = document.getElementById('account-number').value;

        if(amount && method && accountNumber) {
            alert(`Withdrawal Request Submitted:\nAmount: PKR ${amount}\nMethod: ${method}\nAccount: ${accountNumber}\n\nThis is a demo. In a real app, this request would be sent to a server for processing.`);
            withdrawForm.reset();
        } else {
            alert('Please fill out all fields.');
        }
    }

    init();
});
