:root {
    --primary-color: #3b82f6;
    --primary-dark: #2563eb;
    --secondary-color: #8b5cf6;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --bg-color: #f8fafc;
    --card-color: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
}

.dark-theme {
    --primary-color: #60a5fa;
    --primary-dark: #3b82f6;
    --secondary-color: #a78bfa;
    --success-color: #34d399;
    --warning-color: #fbbf24;
    --danger-color: #f87171;
    --bg-color: #0f172a;
    --card-color: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --border-color: #334155;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-primary);
    transition: all 0.3s ease;
    line-height: 1.6;
    overflow-x: hidden;
}

.auth-container {
    background-color: var(--card-color);
    border: 1px solid var(--border-color);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.dark-theme .auth-container {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-primary:hover {
    background-color: var(--primary-dark);
}

.btn-secondary {
    background-color: var(--card-color);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background-color: var(--border-color);
}

.btn-danger {
    background-color: var(--danger-color);
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-danger:hover {
    background-color: #dc2626;
}

.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.floating-coin {
    position: absolute;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle at 30% 30%, #FFD700, #FFA500);
    border-radius: 50%;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    animation: float 3s ease-in-out infinite;
    z-index: -1;
}

@keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
}

.coin-1 {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.coin-2 {
    top: 60%;
    right: 15%;
    animation-delay: 1s;
}

.coin-3 {
    bottom: 20%;
    left: 20%;
    animation-delay: 2s;
}

.input-field {
    background-color: var(--card-color);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    transition: all 0.3s;
}

.input-field:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    outline: none;
}

.password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
}

.password-container {
    position: relative;
}

.tab {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-weight: 500;
    color: var(--text-secondary);
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.settings-panel {
    position: fixed;
    top: 20px;
    left: 20px;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    padding: 1rem;
    width: 300px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 100;
    display: none;
}

.dark-theme .settings-panel {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.settings-toggle {
    position: fixed;
    top: 20px;
    left: 20px;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 90;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    display: none;
}

.modal-content {
    background: var(--card-color);
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.dark-theme .modal-content {
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
}

@media (max-width: 640px) {
    .auth-container {
        margin: 1rem;
        padding: 1.5rem;
    }

    .theme-toggle, .settings-toggle {
        width: 40px;
        height: 40px;
        top: 10px;
    }

    .theme-toggle {
        right: 10px;
    }

    .settings-toggle {
        left: 10px;
    }

    .settings-panel {
        width: calc(100% - 40px);
        left: 20px;
        right: 20px;
    }
}

/* Remove specific floating coins */
.coin-1,
.coin-2,
.coin-3 {
    display: none !important;
}
