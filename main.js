// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Update theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === savedTheme) {
            btn.classList.add('active');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Language Management
function initLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    // Update language select
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
}

function setLanguage(language) {
    localStorage.setItem('language', language);
    // In a real app, you would load translations here
    console.log('Language changed to:', language);
}

// Auth Tab Functionality
function initAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    if (authTabs.length === 0) return;
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            const tabId = tab.getAttribute('data-tab');
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            document.getElementById(`${tabId}-form`).classList.add('active');
        });
    });
}

// Form Handling
function initForms() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Simulate API call
            simulateAPICall('/api/login', { email, password })
                .then(response => {
                    showNotification('Login successful! Redirecting...', 'success');
                    // In a real app, you would redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                })
                .catch(error => {
                    showNotification('Invalid email or password', 'error');
                });
        });
    }
    
    // Signup Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullname').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // Validation
            if (!fullName || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (!terms) {
                showNotification('Please agree to the Terms and Conditions', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Password must be at least 6 characters long', 'error');
                return;
            }
            
            // Simulate API call
            simulateAPICall('/api/signup', { fullName, email, password })
                .then(response => {
                    showNotification('Account created successfully!', 'success');
                    // Switch to login tab
                    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                    document.querySelector('[data-tab="login"]').classList.add('active');
                    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                    document.getElementById('login-form').classList.add('active');
                    
                    // Pre-fill email
                    document.getElementById('email').value = email;
                })
                .catch(error => {
                    showNotification('Email already exists or server error', 'error');
                });
        });
    }
}

// Reset Data Modal
function initResetModal() {
    const resetModal = document.getElementById('reset-modal');
    const resetBtn = document.getElementById('reset-data-btn');
    const cancelReset = document.getElementById('cancel-reset');
    const confirmReset = document.getElementById('confirm-reset');
    
    if (!resetModal) return;
    
    resetBtn.addEventListener('click', () => {
        resetModal.classList.add('active');
    });
    
    cancelReset.addEventListener('click', () => {
        resetModal.classList.remove('active');
    });
    
    confirmReset.addEventListener('click', () => {
        // Simulate reset
        simulateAPICall('/api/reset-data', {})
            .then(response => {
                showNotification('All data has been reset successfully', 'success');
                resetModal.classList.remove('active');
            })
            .catch(error => {
                showNotification('Failed to reset data', 'error');
            });
    });
}

// Theme Switching
function initThemeSwitcher() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
            
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Language Switching
function initLanguageSwitcher() {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#ff4757',
        warning: '#ffc107',
        info: '#4a6cf7'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Simulate API Calls
function simulateAPICall(endpoint, data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // For demo purposes, accept any login with password length >= 6
            if (endpoint === '/api/login') {
                if (data.password.length >= 6) {
                    resolve({ success: true, token: 'demo-token', user: { name: data.email.split('@')[0] } });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            } 
            // For demo purposes, accept any signup
            else if (endpoint === '/api/signup') {
                if (data.email && data.password) {
                    resolve({ success: true, message: 'User created' });
                } else {
                    reject(new Error('Signup failed'));
                }
            }
            // Reset data always succeeds in demo
            else if (endpoint === '/api/reset-data') {
                resolve({ success: true, message: 'Data reset' });
            }
            // Default reject for unknown endpoints
            else {
                reject(new Error('Unknown endpoint'));
            }
        }, 1000);
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initLanguage();
    initAuthTabs();
    initForms();
    initResetModal();
    initThemeSwitcher();
    initLanguageSwitcher();
    initSmoothScrolling();
    
    console.log('Coin Pop application initialized');
});
