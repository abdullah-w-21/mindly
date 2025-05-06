/**
 * Mindly - Diagnostic Script
 * Helps troubleshoot issues with authentication and API connectivity
 * Add to both index.html and login.html right before other scripts
 */

(function() {
    // Get current page
    const currentPage = window.location.pathname;
    const isLogin = currentPage.includes('login.html');
    const pageType = isLogin ? 'LOGIN PAGE' : 'MAIN APP';
    
    console.log(`=== MINDLY DIAGNOSTIC (${pageType}) ===`);
    console.log("Current URL:", window.location.href);
    
    // Check authentication state
    const token = localStorage.getItem('mindly_token');
    const userData = localStorage.getItem('mindly_user_data');
    
    console.log("Auth token exists:", !!token);
    console.log("User data exists:", !!userData);
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log("User ID:", user.id);
            console.log("Username:", user.username);
        } catch (e) {
            console.log("Error parsing user data:", e);
        }
    }
    
    // On login page, log redirect status
    if (isLogin) {
        if (token) {
            console.log("User appears to be logged in but is on login page");
            console.log("Expected behavior: Should redirect to index.html");
        } else {
            console.log("User is not logged in and is on login page (correct)");
        }
    }
    
    // On main app page, log redirect status
    if (!isLogin) {
        if (!token) {
            console.log("User is not logged in but is on main app page");
            console.log("Expected behavior: Should redirect to login.html");
        } else {
            console.log("User is logged in and is on main app page (correct)");
        }
    }
    
    // Check API connectivity
    fetch('https://api.zyphh.com/health')
        .then(response => {
            console.log("API health check status:", response.status);
            return response.text();
        })
        .then(data => {
            console.log("API health check response:", data);
        })
        .catch(error => {
            console.error("API connection error:", error);
        });
    
    console.log("=== END DIAGNOSTIC ===");
})();
