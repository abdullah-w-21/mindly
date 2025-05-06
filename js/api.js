/**
 * Mindly - API Client
 * Handles all API communication with the backend
 */

// API configuration
const API_CONFIG = {
    // Production base URL
    baseUrl: 'https://api.zyphh.com',
    
    // Authentication endpoints
    authEndpoints: {
        login: '/auth/login',
        register: '/auth/register',
        me: '/auth/me'
    },
    
    // Journal endpoints
    journalEndpoints: {
        entries: '/journal',
        prompts: '/journal/prompts/random'
    },
    
    // Analysis endpoints
    analysisEndpoints: {
        moodTrends: '/analysis/mood-trends',
        sentimentDistribution: '/analysis/sentiment-distribution',
        weeklySummary: '/analysis/weekly-summary',
        streaks: '/analysis/streaks',
        insights: '/analysis/insights'
    }
};

// Local storage keys
const STORAGE_KEYS = {
    token: 'mindly_token',
    userData: 'mindly_user_data'
};

/**
 * API client for communicating with the backend
 */
class MindlyAPI {
    /**
     * Make an authenticated API request
     * 
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} - Response data
     */
    static async request(endpoint, options = {}) {
        try {
            const url = `${API_CONFIG.baseUrl}${endpoint}`;
            
            // Get token from storage
            const token = localStorage.getItem(STORAGE_KEYS.token);
            
            // Set up authentication header
            const headers = {
                ...options.headers,
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const requestOptions = {
                ...options,
                headers
            };
            
            // Log requests in development
            console.log(`API Request: ${url}`);
            
            // Make request
            const response = await fetch(url, requestOptions);
            
            // Check for 401 Unauthorized (token expired/invalid)
            if (response.status === 401) {
                // Don't redirect if we're already on the login page
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html')) {
                    // Clear auth data
                    localStorage.removeItem(STORAGE_KEYS.token);
                    localStorage.removeItem(STORAGE_KEYS.userData);
                    
                    // Redirect to login
                    window.location.href = 'login.html';
                    throw new Error('Authentication failed');
                }
            }
            
            // Handle other errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `API request failed: ${response.status}`);
            }
            
            // For 204 No Content responses
            if (response.status === 204) {
                return null;
            }
            
            // Parse and return response data
            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    
    /**
     * Create a new journal entry
     * 
     * @param {Object} entry - Journal entry data
     * @returns {Promise<Object>} - Created entry
     */
    static async createJournalEntry(entry) {
        return await this.request(API_CONFIG.journalEndpoints.entries, {
            method: 'POST',
            body: JSON.stringify(entry)
        });
    }
    
    /**
     * Get journal entries
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Journal entries
     */
    static async getJournalEntries(options = {}) {
        // Build query string
        const queryParams = new URLSearchParams(options);
        
        return await this.request(`${API_CONFIG.journalEndpoints.entries}?${queryParams}`);
    }
    
    /**
     * Get a single journal entry
     * 
     * @param {string} entryId - Journal entry ID
     * @returns {Promise<Object>} - Journal entry
     */
    static async getJournalEntry(entryId) {
        return await this.request(`${API_CONFIG.journalEndpoints.entries}/${entryId}`);
    }
    
    /**
     * Update a journal entry
     * 
     * @param {string} entryId - Journal entry ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated entry
     */
    static async updateJournalEntry(entryId, updateData) {
        return await this.request(`${API_CONFIG.journalEndpoints.entries}/${entryId}`, {
            method: 'PATCH',
            body: JSON.stringify(updateData)
        });
    }
    
    /**
     * Delete a journal entry
     * 
     * @param {string} entryId - Journal entry ID
     * @returns {Promise<null>} - No content
     */
    static async deleteJournalEntry(entryId) {
        return await this.request(`${API_CONFIG.journalEndpoints.entries}/${entryId}`, {
            method: 'DELETE'
        });
    }
    
    /**
     * Get a random journal prompt
     * 
     * @returns {Promise<Object>} - Journal prompt
     */
    static async getRandomPrompt() {
        return await this.request(API_CONFIG.journalEndpoints.prompts);
    }
    
    /**
     * Get mood trend data
     * 
     * @param {number} days - Number of days to include
     * @param {boolean} smooth - Whether to smooth the data
     * @returns {Promise<Object>} - Mood trend data
     */
    static async getMoodTrends(days = 30, smooth = false) {
        const queryParams = new URLSearchParams({
            days: days,
            smooth: smooth
        });
        
        return await this.request(`${API_CONFIG.analysisEndpoints.moodTrends}?${queryParams}`);
    }
    
    /**
     * Get sentiment distribution data
     * 
     * @param {number} days - Number of days to include
     * @returns {Promise<Object>} - Sentiment distribution data
     */
    static async getSentimentDistribution(days = 30) {
        const queryParams = new URLSearchParams({
            days: days
        });
        
        return await this.request(`${API_CONFIG.analysisEndpoints.sentimentDistribution}?${queryParams}`);
    }
    
    /**
     * Get weekly sentiment summary
     * 
     * @param {number} weeks - Number of weeks to include
     * @returns {Promise<Object>} - Weekly sentiment summary
     */
    static async getWeeklySummary(weeks = 4) {
        const queryParams = new URLSearchParams({
            weeks: weeks
        });
        
        return await this.request(`${API_CONFIG.analysisEndpoints.weeklySummary}?${queryParams}`);
    }
    
    /**
     * Get streak information
     * 
     * @returns {Promise<Object>} - Streak data
     */
    static async getStreaks() {
        return await this.request(API_CONFIG.analysisEndpoints.streaks);
    }
    
    /**
     * Get insights based on journal entries
     * 
     * @param {number} days - Number of days to analyze
     * @returns {Promise<Object>} - Insights data
     */
    static async getInsights(days = 30) {
        const queryParams = new URLSearchParams({
            days: days
        });
        
        return await this.request(`${API_CONFIG.analysisEndpoints.insights}?${queryParams}`);
    }
    
    /**
     * Show a toast notification
     * 
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success' or 'error')
     */
    static showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) return;
        
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
