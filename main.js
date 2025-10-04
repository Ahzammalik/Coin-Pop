/**
 * CoinMaster Pro - Main Application Controller
 * Enhanced with modern JavaScript, animations, and professional error handling
 */

class CoinMasterApp {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.CONSTANTS = {
            REWARD_AMOUNT: 50,
            COOLDOWN_PERIOD: 24 * 60 * 60 * 1000, // 24 hours
            CONVERSION_RATE: 1000,
            MIN_WITHDRAWAL: 10
        };
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.handleRouting();
            this.setupGlobalEventListeners();
        });
    }

    handleRouting() {
        const loginForm = document.getElementById('login-form');
        
        if (loginForm) {
            this.handleLoginPage(loginForm);
        } else {
            this.handleAuthenticatedPages();
        }
    }

    setupGlobalEventListeners() {
        // Global click handler for ripple effects
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, button, .nav-link')) {
                this.createRippleEffect(e);
            }
        });

        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An unexpected error occurred', 'error');
        });
    }

    createRippleEffect(event) {
        const button = event.target;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 600ms linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // ========== AUTHENTICATION MANAGEMENT ==========

    handleLoginPage(form) {
        // Redirect if already logged in
        if (this.getCurrentUser()) {
            this.redirectTo('dashboard.html');
            return;
        }

        this.setupLoginForm(form);
        this.setupSignupHandler();
    }

    setupLoginForm(form) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginError = document.getElementById('login-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            loginError.textContent = '';
            this.showLoadingState(form, true);

            try {
                const email = emailInput.value.trim();
                const password = passwordInput.value;

                await this.authenticateUser(email, password);
                this.redirectTo('dashboard.html');
            } catch (error) {
                loginError.textContent = error.message;
                this.shakeElement(form);
            } finally {
                this.showLoadingState(form, false);
            }
        });
    }

    async authenticateUser(email, password) {
        // Simulate API call delay
        await this.delay(800);

        if (!email || !password) {
            throw new Error('Please enter both email and password');
        }

        const storedUser = localStorage.getItem(`user_${email}`);
        
        if (!storedUser) {
            throw new Error('No account found with this email address');
        }

        const userData = JSON.parse(storedUser);
        
        if (userData.password !== password) {
            throw new Error('Incorrect password. Please try again.');
        }

        localStorage.setItem('currentUser', email);
        this.currentUser = email;
        return userData;
    }

    setupSignupHandler() {
        const signupLink = document.getElementById('signup-link');
        const emailInput = document.getElementById('email');

        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupModal(emailInput);
        });
    }

    showSignupModal(emailInput) {
        const modal = this.createModal(`
            <div class="modal-content">
                <h3 class="text-xl font-bold mb-4">Create New Account</h3>
                <form id="signup-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Email Address</label>
                        <input type="email" id="signup-email" 
                               class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="your@email.com" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Password</label>
                        <input type="password" id="signup-password" 
                               class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="Minimum 6 characters" minlength="6" required>
                    </div>
                    <button type="submit" 
                            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                        Create Account
                    </button>
                </form>
            </div>
        `);

        modal.querySelector('#signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(modal, emailInput);
        });
    }

    handleSignup(modal, emailInput) {
        const signupEmail = document.getElementById('signup-email').value.trim();
        const signupPassword = document.getElementById('signup-password').value;

        if (localStorage.getItem(`user_${signupEmail}`)) {
            this.showNotification('This email is already registered', 'error');
            return;
        }

        const newUser = {
            email: signupEmail,
            password: signupPassword,
            coins: 100, // Starting bonus
            isAdmin: false,
            lastClaimTime: null,
            joinDate: new Date().toISOString()
        };

        localStorage.setItem(`user_${signupEmail}`, JSON.stringify(newUser));
        modal.remove();
        
        this.showNotification('Account created successfully! Welcome to CoinMaster!', 'success');
        emailInput.value = signupEmail;
    }

    // ========== AUTHENTICATED PAGES HANDLER ==========

    handleAuthenticatedPages() {
        this.currentUser = this.getCurrentUser();
        
        if (!this.currentUser) {
            this.redirectToLogin();
            return;
        }

        this.userData = this.getUserData(this.currentUser);
        this.initializeApplication();
    }

    initializeApplication() {
        this.initializeDummyUser();
        this.setupNavigation();
        this.updateUI();
        this.initializePageSpecificHandlers();
    }

    setupNavigation() {
        this.setActiveNavLink();
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    setActiveNavLink() {
        const path = window.location.pathname.split('/').pop();
        const currentPage = path || 'dashboard.html';
        
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active', 'bg-blue-50', 'text-blue-600', 'border-blue-500');
            
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active', 'bg-blue-50', 'text-blue-600', 'border-blue-500');
            }
        });
    }

    handleLogout() {
        this.showNotification('Logging out...', 'info');
        
        setTimeout(() => {
            localStorage.removeItem('currentUser');
            this.redirectTo('signin.html');
        }, 1000);
    }

    updateUI() {
        this.updateUserInfo();
        this.updateAdminFeatures();
    }

    updateUserInfo() {
        const userEmailDisplay = document.getElementById('user-email-display');
        const coinBalanceDisplay = document.getElementById('coin-balance-display');

        if (userEmailDisplay) {
            userEmailDisplay.textContent = this.userData.email;
            userEmailDisplay.title = this.userData.email;
        }

        if (coinBalanceDisplay) {
            this.animateValue(coinBalanceDisplay, parseInt(coinBalanceDisplay.textContent) || 0, this.userData.coins, 1000);
        }
    }

    updateAdminFeatures() {
        const adminNavLink = document.getElementById('admin-nav-link');
        if (adminNavLink && this.userData.isAdmin) {
            adminNavLink.style.display = 'flex';
            adminNavLink.classList.add('bg-purple-50', 'text-purple-700');
        }
    }

    // ========== PAGE SPECIFIC HANDLERS ==========

    initializePageSpecificHandlers() {
        const pageHandlers = {
            'dashboard.html': () => this.handleDashboardPage(),
            'rewards.html': () => this.handleRewardsPage(),
            'play.html': () => this.handlePlayPage(),
            'leaderboard.html': () => this.handleLeaderboardPage(),
            'withdraw.html': () => this.handleWithdrawPage(),
            'admin.html': () => this.handleAdminPage()
        };

        const currentPage = window.location.pathname.split('/').pop();
        const handler = pageHandlers[currentPage];

        if (handler) {
            handler();
        }
    }

    handleDashboardPage() {
        this.updateDashboardStats();
        this.setupDashboardRewardTimer();
    }

    updateDashboardStats() {
        const welcomeMessage = document.getElementById('welcome-message');
        const dashboardCoins = document.getElementById('dashboard-coins');
        const dashboardRank = document.getElementById('dashboard-rank');

        if (welcomeMessage) {
            const username = this.userData.email.split('@')[0];
            welcomeMessage.textContent = `Welcome back, ${username}!`;
            welcomeMessage.innerHTML = `Welcome back, <span class="text-blue-600">${username}</span>!`;
        }

        if (dashboardCoins) {
            this.animateValue(dashboardCoins, 0, this.userData.coins, 1500);
        }

        if (dashboardRank) {
            const rank = this.calculateUserRank();
            dashboardRank.textContent = `#${rank}`;
            dashboardRank.className = `text-lg font-bold ${rank <= 3 ? 'text-yellow-500' : 'text-gray-700'}`;
        }
    }

    handleRewardsPage() {
        const claimButton = document.getElementById('claim-reward-btn');
        if (!claimButton) return;

        this.setupRewardSystem(claimButton);
    }

    setupRewardSystem(claimButton) {
        const rewardMessage = document.getElementById('reward-message');
        const timerMessage = document.getElementById('timer-message');
        let countdownInterval;

        const updateRewardUI = () => {
            const rewardStatus = this.getRewardStatus();
            
            if (rewardStatus.claimable) {
                this.enableClaimButton(claimButton, rewardMessage, timerMessage);
            } else {
                this.disableClaimButton(claimButton, rewardMessage, timerMessage, rewardStatus.remainingTime);
            }
        };

        claimButton.addEventListener('click', () => {
            if (claimButton.disabled) return;
            
            this.claimReward();
            this.pulseAnimation(claimButton, 'bg-green-500');
            this.showNotification(`🎉 ${this.CONSTANTS.REWARD_AMOUNT} coins claimed!`, 'success');
            updateRewardUI();
        });

        updateRewardUI();
    }

    // ========== UTILITY METHODS ==========

    getCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    getUserData(email) {
        const data = localStorage.getItem(`user_${email}`);
        return data ? JSON.parse(data) : null;
    }

    updateUserData(updates) {
        this.userData = { ...this.userData, ...updates };
        localStorage.setItem(`user_${this.currentUser}`, JSON.stringify(this.userData));
        this.updateUI();
    }

    redirectTo(url) {
        window.location.href = url;
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('signin.html')) {
            this.redirectTo('signin.html');
        }
    }

    showLoadingState(element, isLoading) {
        const buttons = element.querySelectorAll('button[type="submit"]');
        
        buttons.forEach(button => {
            if (isLoading) {
                button.disabled = true;
                button.innerHTML = '<div class="spinner"></div> Loading...';
                button.classList.add('opacity-50');
            } else {
                button.disabled = false;
                button.textContent = button.getAttribute('data-original-text') || 'Sign In';
                button.classList.remove('opacity-50');
            }
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.custom-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        const typeStyles = {
            success: 'bg-green-500 border-green-600',
            error: 'bg-red-500 border-red-600',
            warning: 'bg-yellow-500 border-yellow-600',
            info: 'bg-blue-500 border-blue-600'
        };

        notification.className = `custom-notification fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${typeStyles[type]}`;
        notification.textContent = message;
        notification.style.zIndex = '1000';

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('transform', '-translate-y-2', 'opacity-0');
            notification.classList.add('translate-y-0', 'opacity-100');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('opacity-0', 'transform', '-translate-y-2');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(start + (end - start) * progress);
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = end.toLocaleString();
            }
        };
        requestAnimationFrame(step);
    }

    pulseAnimation(element, pulseClass) {
        element.classList.add('animate-pulse', pulseClass);
        setTimeout(() => {
            element.classList.remove('animate-pulse', pulseClass);
        }, 600);
    }

    shakeElement(element) {
        element.classList.add('animate-shake');
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, 600);
    }

    createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = content;
        document.body.appendChild(modal);
        return modal;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========== REWARD SYSTEM ==========

    getRewardStatus() {
        const lastClaim = this.userData.lastClaimTime;
        const now = Date.now();
        
        if (!lastClaim || (now - lastClaim >= this.CONSTANTS.COOLDOWN_PERIOD)) {
            return { claimable: true, remainingTime: 0 };
        } else {
            return {
                claimable: false,
                remainingTime: this.CONSTANTS.COOLDOWN_PERIOD - (now - lastClaim)
            };
        }
    }

    enableClaimButton(button, rewardMessage, timerMessage) {
        button.disabled = false;
        button.innerHTML = `🎁 Claim ${this.CONSTANTS.REWARD_AMOUNT} Coins`;
        button.className = 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105';
        rewardMessage.textContent = 'Your daily reward is ready!';
        rewardMessage.className = 'text-green-600 font-semibold';
        
        if (timerMessage) {
            timerMessage.style.display = 'none';
        }
    }

    disableClaimButton(button, rewardMessage, timerMessage, remainingTime) {
        button.disabled = true;
        button.textContent = 'Reward Claimed';
        button.className = 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed';
        rewardMessage.textContent = 'Come back tomorrow for more rewards!';
        rewardMessage.className = 'text-gray-600';
        
        if (timerMessage) {
            timerMessage.style.display = 'block';
            this.startCountdown(timerMessage, remainingTime);
        }
    }

    claimReward() {
        this.updateUserData({
            coins: this.userData.coins + this.CONSTANTS.REWARD_AMOUNT,
            lastClaimTime: Date.now()
        });
    }

    startCountdown(timerElement, duration) {
        let remaining = duration;
        
        const updateTimer = () => {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            
            timerElement.textContent = `Next reward in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (remaining <= 0) {
                clearInterval(interval);
                location.reload();
            }
            
            remaining -= 1000;
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
    }

    calculateUserRank() {
        const allUsers = this.getAllUsers();
        allUsers.sort((a, b) => b.coins - a.coins);
        return allUsers.findIndex(user => user.email === this.userData.email) + 1;
    }

    getAllUsers() {
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                users.push(JSON.parse(localStorage.getItem(key)));
            }
        }
        return users;
    }

    initializeDummyUser() {
        if (!localStorage.getItem('user_test@example.com')) {
            const dummyUser = {
                email: 'test@example.com',
                password: 'password123',
                coins: 1000,
                isAdmin: true,
                lastClaimTime: null,
                joinDate: new Date().toISOString()
            };
            localStorage.setItem('user_test@example.com', JSON.stringify(dummyUser));
        }
    }

    // ========== EXISTING FUNCTIONALITY (simplified for brevity) ==========

    handlePlayPage() {
        const popButton = document.getElementById('pop-coin-btn');
        if (!popButton) return;

        popButton.addEventListener('click', () => {
            const coinsWon = Math.floor(Math.random() * 5) + 1;
            this.updateUserData({ coins: this.userData.coins + coinsWon });
            
            document.getElementById('pop-result-message').textContent = `🎉 You won ${coinsWon} coins!`;
            this.pulseAnimation(popButton, 'bg-yellow-500');
        });
    }

    handleLeaderboardPage() {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (!leaderboardBody) return;

        const allUsers = this.getAllUsers();
        allUsers.sort((a, b) => b.coins - a.coins);
        
        leaderboardBody.innerHTML = allUsers.map((user, index) => {
            const isCurrentUser = user.email === this.userData.email;
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank} font-bold` : '';
            
            return `
                <tr class="${isCurrentUser ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} transition-colors hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap ${rankClass}">
                        ${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${user.email.split('@')[0]}${isCurrentUser ? ' <span class="text-blue-600 font-semibold">(You)</span>' : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                        ${user.coins.toLocaleString()} 🪙
                    </td>
                </tr>
            `;
        }).join('');
    }

    handleWithdrawPage() {
        const form = document.getElementById('withdraw-form');
        if (!form) return;

        const amountInput = document.getElementById('withdraw-amount');
        const cashValueDisplay = document.getElementById('cash-value');

        amountInput.addEventListener('input', () => {
            const amount = parseInt(amountInput.value) || 0;
            const cashValue = (amount / this.CONSTANTS.CONVERSION_RATE).toFixed(2);
            cashValueDisplay.textContent = `$${cashValue}`;
            cashValueDisplay.className = amount >= this.CONSTANTS.MIN_WITHDRAWAL ? 'text-green-600 font-bold' : 'text-red-600';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processWithdrawal(form, amountInput);
        });
    }

    processWithdrawal(form, amountInput) {
        const amount = parseInt(amountInput.value);
        const messageDisplay = document.getElementById('withdraw-message');

        if (amount < this.CONSTANTS.MIN_WITHDRAWAL) {
            this.showNotification(`Minimum withdrawal is ${this.CONSTANTS.MIN_WITHDRAWAL} coins`, 'error');
            return;
        }

        if (amount > this.userData.coins) {
            this.showNotification('Insufficient coins', 'error');
            return;
        }

        this.updateUserData({ coins: this.userData.coins - amount });
        this.showNotification(`Withdrawal request processed! $${(amount / this.CONSTANTS.CONVERSION_RATE).toFixed(2)} will be sent to your account.`, 'success');
        form.reset();
        document.getElementById('cash-value').textContent = '$0.00';
    }

    handleAdminPage() {
        if (!this.userData.isAdmin) {
            this.redirectTo('dashboard.html');
            return;
        }
        this.renderAdminUserTable();
    }

    renderAdminUserTable() {
        const userListBody = document.getElementById('admin-user-list');
        if (!userListBody) return;

        const allUsers = this.getAllUsers();
        userListBody.innerHTML = allUsers.map(user => `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-medium">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="font-bold text-blue-600">${user.coins}</span> 🪙
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="app.toggleAdmin('${user.email}')" 
                            class="toggle-admin-btn px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                user.isAdmin ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }">
                        ${user.isAdmin ? '👑 Admin' : '👤 User'}
                    </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                        <input type="number" id="coins-${user.email}" 
                               class="w-20 px-2 py-1 border rounded text-sm" 
                               placeholder="± coins">
                        <button onclick="app.updateUserCoins('${user.email}')" 
                                class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                            Update
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    toggleAdmin(userEmail) {
        const user = JSON.parse(localStorage.getItem(`user_${userEmail}`));
        user.isAdmin = !user.isAdmin;
        localStorage.setItem(`user_${userEmail}`, JSON.stringify(user));
        this.renderAdminUserTable();
        this.showNotification(`${user.email} is now ${user.isAdmin ? 'admin' : 'user'}`, 'success');
    }

    updateUserCoins(userEmail) {
        const input = document.getElementById(`coins-${userEmail}`);
        const amount = parseInt(input.value);

        if (isNaN(amount)) {
            this.showNotification('Please enter a valid number', 'error');
            return;
        }

        const user = JSON.parse(localStorage.getItem(`user_${userEmail}`));
        user.coins += amount;
        localStorage.setItem(`user_${userEmail}`, JSON.stringify(user));

        if (userEmail === this.currentUser) {
            this.userData.coins = user.coins;
            this.updateUI();
        }

        this.renderAdminUserTable();
        this.showNotification(`Updated ${user.email}'s coins by ${amount}`, 'success');
        input.value = '';
    }
}

// Initialize the application
const app = new CoinMasterApp();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .animate-shake {
        animation: shake 0.5s ease-in-out;
    }
    
    .spinner {
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 8px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .rank-1 { color: #FFD700; }
    .rank-2 { color: #C0C0C0; }
    .rank-3 { color: #CD7F32; }
    
    .custom-notification {
        backdrop-filter: blur(10px);
        border: 1px solid;
    }
`;
document.head.appendChild(style);
