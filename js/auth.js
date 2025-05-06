/**
 * Mindly - Authentication Module
 * Handles user registration, login, and session management
 */

// Local storage keys
const STORAGE_KEYS = {
    token: 'mindly_token',
    userData: 'mindly_user_data'
};

/**
 * Authentication class
 */
class Auth {
    /**
     * Initialize authentication
     */
    static init() {
        // Register event listeners
        this.bindEvents();
        
        // Check if already logged in, but ONLY redirect if we're on login.html
        const currentPath = window.location.pathname;
        if (this.isLoggedIn() && currentPath.endsWith('login.html')) {
            // If we're on login page and already logged in, redirect to app
            window.location.href = 'index.html';
        }
    }
    
    /**
     * Bind event listeners
     */
    static bindEvents() {
        // Tab switching
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs and forms
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form-container').forEach(f => f.classList.remove('active'));
                
                // Activate selected tab and form
                tab.classList.add('active');
                const formId = `${tab.dataset.tab}-form`;
                document.getElementById(formId).classList.add('active');
                
                // Clear messages
                document.querySelectorAll('.form-message').forEach(msg => {
                    msg.textContent = '';
                    msg.classList.remove('error', 'success');
                });
            });
        });
        
        // Login form submission
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
        
        // Register form submission
        const registerForm = document.getElementById('register-form-element');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegistration();
            });
        }
    }
    
    /**
     * Handle login form submission
     */
    static async handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const messageElement = document.getElementById('login-message');
        
        try {
            // Clear previous messages
            messageElement.textContent = '';
            messageElement.classList.remove('error', 'success');
            
            // Add loading state
            const submitButton = document.querySelector('#login-form-element .auth-button');
            submitButton.textContent = 'Logging in...';
            submitButton.disabled = true;
            
            // Create form data for OAuth2 password flow
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            // Make API request
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.authEndpoints.login}`, {
                method: 'POST',
                body: formData
            });
            
            // Handle response
            if (response.ok) {
                const data = await response.json();
                
                // Store authentication data
                localStorage.setItem(STORAGE_KEYS.token, data.access_token);
                localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify({
                    id: data.user_id,
                    username: data.username
                }));
                
                // Show success message
                messageElement.textContent = 'Login successful! Redirecting...';
                messageElement.classList.add('success');
                
                // Redirect to app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }
        } catch (error) {
            // Show error message
            messageElement.textContent = error.message || 'An error occurred during login';
            messageElement.classList.add('error');
            
            // Reset button
            const submitButton = document.querySelector('#login-form-element .auth-button');
            submitButton.textContent = 'Login';
            submitButton.disabled = false;
        }
    }
    
    /**
     * Handle registration form submission
     */
    static async handleRegistration() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const messageElement = document.getElementById('register-message');
        
        try {
            // Clear previous messages
            messageElement.textContent = '';
            messageElement.classList.remove('error', 'success');
            
            // Validate passwords match
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            // Add loading state
            const submitButton = document.querySelector('#register-form-element .auth-button');
            submitButton.textContent = 'Registering...';
            submitButton.disabled = true;
            
            // Prepare registration data
            const registrationData = {
                username,
                email,
                password
            };
            
            // Make API request
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.authEndpoints.register}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
            
            // Handle response
            if (response.ok) {
                // Show success message
                messageElement.textContent = 'Registration successful! You can now log in.';
                messageElement.classList.add('success');
                
                // Clear form
                document.getElementById('register-form-element').reset();
                
                // Switch to login tab after delay
                setTimeout(() => {
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                }, 2000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }
        } catch (error) {
            // Show error message
            messageElement.textContent = error.message || 'An error occurred during registration';
            messageElement.classList.add('error');
        } finally {
            // Reset button
            const submitButton = document.querySelector('#register-form-element .auth-button');
            submitButton.textContent = 'Register';
            submitButton.disabled = false;
        }
    }
    
    /**
     * Check if user is logged in
     * 
     * @returns {boolean} Whether the user is logged in
     */
    static isLoggedIn() {
        return !!localStorage.getItem(STORAGE_KEYS.token);
    }
    
    /**
     * Get authentication token
     * 
     * @returns {string|null} Authentication token or null if not logged in
     */
    static getToken() {
        return localStorage.getItem(STORAGE_KEYS.token);
    }
    
    /**
     * Get user data
     * 
     * @returns {Object|null} User data or null if not logged in
     */
    static getUserData() {
        const userData = localStorage.getItem(STORAGE_KEYS.userData);
        return userData ? JSON.parse(userData) : null;
    }
    
    /**
     * Log out the current user
     */
    static logout() {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.userData);
        window.location.href = 'login.html';
    }
    
    /**
     * Show a toast notification
     * 
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success' or 'error')
     */
    static showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<div class="toast-text">${message}</div>`;
        
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
