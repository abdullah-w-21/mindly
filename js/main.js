/**
 * Mindly - Main Application
 * Initializes and coordinates the application's components
 */

/**
 * Main application class
 */
class MindlyApp {
    constructor() {
        // Components
        this.journalUI = null;
        this.charts = null;
        
        // DOM elements
        this.usernameDisplay = document.getElementById('username-display');
        this.themeToggle = document.getElementById('theme-toggle');
        this.logoutButton = document.getElementById('logout-button');
        this.refreshInsights = document.getElementById('refresh-insights');
        this.insightsContainer = document.getElementById('insights-container');
        this.insightTemplate = document.getElementById('insight-template');
        
        // Check authentication first
        if (!this.checkAuth()) {
            return; // Stop initialization if not authenticated
        }
        
        // Initialize UI
        this.initUI();
        
        // Bind events
        this.bindEvents();
    }
    
    /**
     * Check if user is authenticated
     * 
     * @returns {boolean} Whether authentication passed
     */
    checkAuth() {
        const token = localStorage.getItem('mindly_token');
        
        // If no token exists, redirect to login
        if (!token) {
            console.log("No authentication token found, redirecting to login");
            window.location.href = 'login.html';
            return false;
        }
        
        console.log("Authentication token found, proceeding to app");
        return true;
    }
    
    /**
     * Initialize UI components
     */
    async initUI() {
        try {
            // Display username
            this.displayUsername();
            
            // Check and apply theme preference
            this.applyTheme();
            
            // Initialize journal UI
            this.journalUI = new JournalUI();
            await this.journalUI.init();
            
            // Initialize charts
            this.charts = new MindlyCharts();
            // Make it globally available for updates from journal UI
            window.mindlyCharts = this.charts;
            await this.charts.initCharts();
            
            // Load insights
            await this.loadInsights();
            
            // Load streaks
            await this.loadStreaks();
        } catch (error) {
            console.error('Error initializing UI:', error);
            MindlyAPI.showToast('Error initializing application. Please refresh the page.', 'error');
        }
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
        
        // Logout button
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', this.logout.bind(this));
        }
        
        // User dropdown
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', this.toggleDropdown);
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', event => {
            const dropdown = document.querySelector('.dropdown');
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            
            if (dropdown && !dropdown.contains(event.target) && !dropdownToggle.contains(event.target)) {
                document.querySelector('.dropdown-menu').classList.remove('active');
            }
        });
        
        // Refresh insights button
        if (this.refreshInsights) {
            this.refreshInsights.addEventListener('click', this.loadInsights.bind(this));
        }
        
        // Make loadInsights globally available for updates from journal UI
        window.mindlyApp = this;
    }
    
    /**
     * Toggle user dropdown menu
     * 
     * @param {Event} event - Click event
     */
    toggleDropdown(event) {
        event.preventDefault();
        const dropdownMenu = document.querySelector('.dropdown-menu');
        dropdownMenu.classList.toggle('active');
    }
    
    /**
     * Display username from stored data
     */
    displayUsername() {
        if (!this.usernameDisplay) return;
        
        const userData = localStorage.getItem('mindly_user_data');
        if (userData) {
            const user = JSON.parse(userData);
            this.usernameDisplay.textContent = user.username;
        }
    }
    
    /**
     * Check and apply theme preference (dark/light)
     */
    applyTheme() {
        const theme = localStorage.getItem('mindly_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update DOM
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Store preference
        localStorage.setItem('mindly_theme', newTheme);
        
        // Update chart colors
        if (this.charts) {
            this.charts.updateColorTheme();
        }
    }
    
    /**
     * Log out the current user
     */
    logout() {
        localStorage.removeItem('mindly_token');
        localStorage.removeItem('mindly_user_data');
        window.location.href = 'login.html';
    }
    
    /**
     * Load and display insights
     */
    async loadInsights() {
        try {
            if (!this.insightsContainer || !this.insightTemplate) return;
            
            // Display loading state
            this.insightsContainer.innerHTML = '<div class="loading">Loading insights...</div>';
            
            // Fetch insights
            const data = await MindlyAPI.getInsights();
            
            // Clear container
            this.insightsContainer.innerHTML = '';
            
            if (!data || !data.insights || data.insights.length === 0) {
                this.insightsContainer.innerHTML = `
                    <div class="empty-state">
                        <p>Keep journaling to receive personalized insights about your emotional patterns.</p>
                    </div>
                `;
                return;
            }
            
            // Render insights
            data.insights.forEach(insight => {
                const insightElement = document.importNode(this.insightTemplate.content, true);
                const insightText = insightElement.querySelector('.insight-text');
                insightText.textContent = insight;
                this.insightsContainer.appendChild(insightElement);
            });
            
        } catch (error) {
            console.error('Error loading insights:', error);
            this.insightsContainer.innerHTML = `
                <div class="error-state">
                    <p>Error loading insights. Please try again later.</p>
                </div>
            `;
        }
    }
    
    /**
     * Load and display streak information
     */
    async loadStreaks() {
        try {
            // Fetch streak data
            const streakData = await MindlyAPI.getStreaks();
            
            // Update streak displays
            const streakElements = document.querySelectorAll('.streak-count');
            streakElements.forEach(element => {
                element.textContent = streakData.current_streak;
            });
            
            // Add animations or highlight if streak increased
            if (streakData.current_streak > 0) {
                streakElements.forEach(element => {
                    element.classList.add('highlight');
                    setTimeout(() => {
                        element.classList.remove('highlight');
                    }, 2000);
                });
            }
            
        } catch (error) {
            console.error('Error loading streaks:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set default theme
    const theme = localStorage.getItem('mindly_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Initialize app
    const app = new MindlyApp();
});
