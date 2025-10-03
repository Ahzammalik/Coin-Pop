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

    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const resetModal = document.getElementById('reset-modal');
    const confirmReset = document.getElementById('confirm-reset');
    const cancelReset = document.getElementById('cancel-reset');
    const lightThemeBtn = document.getElementById('light-theme-btn');
    const darkThemeBtn = document.getElementById('dark-theme-btn');
    const autoThemeBtn = document.getElementById('auto-theme-btn');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const loginPasswordToggle = document.getElementById('login-password-toggle');
    const signupPasswordToggle = document.getElementById('signup-password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');

    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (savedTheme === 'auto' && prefersDark)) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Toggle theme
    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    // Theme buttons
    lightThemeBtn.addEventListener('click', function() {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    });

    darkThemeBtn.addEventListener('click', function() {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    });

    autoThemeBtn.addEventListener('click', function() {
        localStorage.setItem('theme', 'auto');
        initTheme();
    });

    // Toggle settings panel
    settingsToggle.addEventListener('click', function() {
        settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
    });

    // Close settings panel when clicking outside
    document.addEventListener('click', function(event) {
        if (!settingsToggle.contains(event.target) && !settingsPanel.contains(event.target)) {
            settingsPanel.style.display = 'none';
        }
    });

    // Reset data modal
    resetDataBtn.addEventListener('click', function() {
        resetModal.style.display = 'flex';
    });

    confirmReset.addEventListener('click', function() {
        localStorage.clear();
        alert('All data has been reset successfully!');
        resetModal.style.display = 'none';
        window.location.reload();
    });

    cancelReset.addEventListener('click', function() {
        resetModal.style.display = 'none';
    });

    // Tab functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Password toggle functionality
    function setupPasswordToggle(toggleBtn, passwordField) {
        if (toggleBtn && passwordField) {
            toggleBtn.addEventListener('click', function() {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
        }
    }

    // Initialize password toggles
    if (loginPasswordToggle) {
        setupPasswordToggle(loginPasswordToggle, document.getElementById('login-password'));
    }
    if (signupPasswordToggle) {
        setupPasswordToggle(signupPasswordToggle, document.getElementById('signup-password'));
    }
    if (confirmPasswordToggle) {
        setupPasswordToggle(confirmPasswordToggle, document.getElementById('confirm-password'));
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

    // Initialize on page load
    initTheme();
}

function handleLoginForm(form) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

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

// Make functions available globally for other scripts
window.updateUserData = updateUserData;
window.refreshUserData = refreshUserData;
window.showNotification = showNotification;
