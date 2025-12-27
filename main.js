// --- CONFIGURATION ---
const ADMIN_EMAIL = "ghazimalik1997@gmail.com";

// --- LOGIN FUNCTIONALITY ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const pass = document.getElementById('password').value;

        // User ka data LocalStorage se nikalna
        const userData = localStorage.getItem(`user_${email}`);
        
        if (userData) {
            const user = JSON.parse(userData);
            
            // Password Check
            if (user.password === pass) {
                // Session Save Karna
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                showToast("Login Successful! Redirecting...", "bg-green-500");

                // --- REDIRECT LOGIC ---
                setTimeout(() => {
                    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                        // Agar Admin hai toh admin.html par bhejo
                        window.location.href = 'admin.html';
                    } else {
                        // Agar Normal User hai toh dashboard par bhejo
                        window.location.href = 'dashboard.html';
                    }
                }, 1500);

            } else {
                showToast("Ghalat Password! Dobara koshish karein.", "bg-red-500");
            }
        } else {
            showToast("Account nahi mila. Pehle Register karein.", "bg-orange-500");
        }
    };
}

// --- LOGOUT FUNCTIONALITY ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };
}

// --- TOAST NOTIFICATION UTILITY ---
function showToast(message, bgColor) {
    const toast = document.createElement('div');
    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg fixed top-5 right-5 z-50 transition-all duration-500`;
    toast.style.opacity = '0';
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    // Animation
    setTimeout(() => { toast.style.opacity = '1'; }, 100);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.remove(); }, 500);
    }, 3000);
}

// --- PROTECTION: Unauthorized Access Block ---
// Is code ko har page ke shuru mein hona chahiye taake koi direct link se na ghuse
function checkAccess() {
    const path = window.location.pathname;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (path.includes('admin.html')) {
        if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
            window.location.href = 'index.html';
        }
    }
}

// Page load par access check karein
window.onload = checkAccess;
