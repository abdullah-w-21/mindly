/**
 * Mindly - Journal UI
 * Handles all journal entry interface functionality
 */

/**
 * Journal UI handler class
 */
class JournalUI {
    constructor() {
        // DOM elements
        this.journalForm = document.getElementById('journal-form');
        this.journalDate = document.getElementById('journal-date');
        this.journalText = document.getElementById('journal-text');
        this.submitButton = document.getElementById('submit-entry');
        this.promptElement = document.getElementById('journal-prompt');
        this.generatePromptBtn = document.getElementById('generate-prompt');
        this.entriesList = document.getElementById('entries-list');
        
        // Templates
        this.entryTemplate = document.getElementById('entry-template');
        this.tagTemplate = document.getElementById('tag-template');
        
        // Entry being edited (if any)
        this.editingEntryId = null;
        
        // Bind event handlers
        this.bindEvents();
        
        // Set default date to today
        this.setDefaultDate();
    }
    
    /**
     * Bind UI event handlers
     */
    bindEvents() {
        // Form submission
        if (this.journalForm) {
            this.journalForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // Generate prompt button
        if (this.generatePromptBtn) {
            this.generatePromptBtn.addEventListener('click', this.generatePrompt.bind(this));
        }
        
        // Delegate events for entry actions (edit, delete)
        if (this.entriesList) {
            this.entriesList.addEventListener('click', this.handleEntryActions.bind(this));
        }
    }
    
    /**
     * Set default date to today
     */
    setDefaultDate() {
        if (this.journalDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            this.journalDate.value = `${year}-${month}-${day}`;
        }
    }
    
    /**
     * Initialize the journal UI
     */
    async init() {
        try {
            // Generate a random prompt
            await this.generatePrompt();
            
            // Load recent entries
            await this.loadEntries();
        } catch (error) {
            console.error('Error initializing journal UI:', error);
            MindlyAPI.showToast('Error initializing journal. Please refresh the page.', 'error');
        }
    }
    
    /**
     * Generate a random journal prompt
     */
    async generatePrompt() {
        try {
            if (!this.promptElement) return;
            
            this.promptElement.textContent = 'Loading prompt...';
            const data = await MindlyAPI.getRandomPrompt();
            
            if (data && data.prompt) {
                this.promptElement.textContent = data.prompt;
            } else {
                this.promptElement.textContent = 'What\'s on your mind today?';
            }
        } catch (error) {
            console.error('Error generating prompt:', error);
            this.promptElement.textContent = 'What\'s on your mind today?';
        }
    }
    
    /**
     * Handle journal form submission
     * 
     * @param {Event} event - Form submission event
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        // Validate form
        if (!this.journalText.value.trim()) {
            MindlyAPI.showToast('Please enter some text for your journal entry.', 'error');
            return;
        }
        
        try {
            // Show loading state
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = `
                <div class="loading-spinner"></div>
                <span>Saving...</span>
            `;
            
            // Prepare entry data
            const entryData = {
                text: this.journalText.value.trim(),
                date: new Date(this.journalDate.value).toISOString()
            };
            
            let response;
            
            // Create new entry or update existing one
            if (this.editingEntryId) {
                response = await MindlyAPI.updateJournalEntry(this.editingEntryId, entryData);
                MindlyAPI.showToast('Journal entry updated successfully!', 'success');
            } else {
                response = await MindlyAPI.createJournalEntry(entryData);
                MindlyAPI.showToast('Journal entry saved successfully!', 'success');
            }
            
            // Reset form
            this.journalForm.reset();
            this.setDefaultDate();
            this.editingEntryId = null;
            this.submitButton.textContent = 'Save Entry';
            
            // Update UI
            await this.loadEntries();
            await this.generatePrompt();
            
            // Update streaks display
            const streaksData = await MindlyAPI.getStreaks();
            this.updateStreaksDisplay(streaksData);
            
            // Signal to charts that data has changed
            if (window.mindlyCharts) {
                window.mindlyCharts.updateCharts();
            }
            
            // Signal to insights that data has changed
            if (window.mindlyApp && window.mindlyApp.loadInsights) {
                window.mindlyApp.loadInsights();
            }
            
        } catch (error) {
            console.error('Error saving journal entry:', error);
            MindlyAPI.showToast('Error saving journal entry. Please try again.', 'error');
        } finally {
            // Reset button state
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Entry
            `;
        }
    }
    
    /**
     * Load recent journal entries
     */
    async loadEntries() {
        try {
            if (!this.entriesList) return;
            
            // Add loading state
            this.entriesList.innerHTML = '<div class="loading">Loading entries...</div>';
            
            // Fetch entries
            const entries = await MindlyAPI.getJournalEntries();
            
            // Clear list
            this.entriesList.innerHTML = '';
            
            // Check if there are any entries
            if (!entries || entries.length === 0) {
                this.entriesList.innerHTML = `
                    <div class="empty-state">
                        <p>No journal entries yet. Start journaling to see your entries here.</p>
                    </div>
                `;
                return;
            }
            
            // Display entries
            entries.forEach(entry => {
                this.renderEntry(entry);
            });
            
        } catch (error) {
            console.error('Error loading entries:', error);
            this.entriesList.innerHTML = `
                <div class="error-state">
                    <p>Error loading entries. Please refresh the page to try again.</p>
                </div>
            `;
        }
    }
    
    /**
     * Render a single journal entry
     * 
     * @param {Object} entry - Journal entry data
     */
    renderEntry(entry) {
        if (!this.entryTemplate || !this.entriesList) return;
        
        // Clone template
        const entryElement = document.importNode(this.entryTemplate.content, true);
        const entryCard = entryElement.querySelector('.entry-card');
        
        // Add sentiment class
        entryCard.classList.add(entry.sentiment || 'neutral');
        
        // Set date
        const dateElement = entryCard.querySelector('.entry-date');
        const entryDate = new Date(entry.date);
        dateElement.textContent = entryDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        // Set sentiment
        const sentimentElement = entryCard.querySelector('.entry-sentiment');
        sentimentElement.textContent = entry.sentiment ? entry.sentiment.charAt(0).toUpperCase() + entry.sentiment.slice(1) : 'Neutral';
        sentimentElement.classList.add(entry.sentiment || 'neutral');
        
        // Set text
        const textElement = entryCard.querySelector('.entry-text');
        textElement.textContent = entry.text;
        
        // Add tags if available
        if (entry.tags && entry.tags.length > 0) {
            const tagsContainer = entryCard.querySelector('.entry-tags');
            
            entry.tags.forEach(tag => {
                const tagElement = document.importNode(this.tagTemplate.content, true);
                const tagSpan = tagElement.querySelector('.entry-tag');
                tagSpan.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
        
        // Set data attribute for entry ID
        entryCard.dataset.entryId = entry._id;
        
        // Add action handlers for edit/delete buttons
        const editButton = entryCard.querySelector('.entry-edit');
        editButton.dataset.entryId = entry._id;
        
        const deleteButton = entryCard.querySelector('.entry-delete');
        deleteButton.dataset.entryId = entry._id;
        
        // Add to list
        this.entriesList.appendChild(entryElement);
    }
    
    /**
     * Handle entry actions (edit, delete)
     * 
     * @param {Event} event - Click event
     */
    async handleEntryActions(event) {
        // Find closest button
        const button = event.target.closest('button');
        if (!button) return;
        
        const entryId = button.dataset.entryId;
        if (!entryId) return;
        
        // Handle edit
        if (button.classList.contains('entry-edit')) {
            await this.editEntry(entryId);
        }
        
        // Handle delete
        if (button.classList.contains('entry-delete')) {
            await this.deleteEntry(entryId);
        }
    }
    
    /**
     * Load entry data for editing
     * 
     * @param {string} entryId - Entry ID
     */
    async editEntry(entryId) {
        try {
            // Fetch entry
            const entry = await MindlyAPI.getJournalEntry(entryId);
            
            // Set form values
            this.journalText.value = entry.text;
            
            // Format date for input
            const entryDate = new Date(entry.date);
            const year = entryDate.getFullYear();
            const month = String(entryDate.getMonth() + 1).padStart(2, '0');
            const day = String(entryDate.getDate()).padStart(2, '0');
            this.journalDate.value = `${year}-${month}-${day}`;
            
            // Set editing state
            this.editingEntryId = entryId;
            
            // Update button text
            this.submitButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Update Entry
            `;
            
            // Scroll to form
            this.journalForm.scrollIntoView({ behavior: 'smooth' });
            
            // Focus on text area
            this.journalText.focus();
            
        } catch (error) {
            console.error('Error editing entry:', error);
            MindlyAPI.showToast('Error loading entry for editing. Please try again.', 'error');
        }
    }
    
    /**
     * Delete an entry after confirmation
     * 
     * @param {string} entryId - Entry ID
     */
    async deleteEntry(entryId) {
        try {
            // Confirm deletion
            if (!confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
                return;
            }
            
            // Delete entry
            await MindlyAPI.deleteJournalEntry(entryId);
            
            // Show success message
            MindlyAPI.showToast('Journal entry deleted successfully!', 'success');
            
            // Update UI
            await this.loadEntries();
            
            // Update streaks display
            const streaksData = await MindlyAPI.getStreaks();
            this.updateStreaksDisplay(streaksData);
            
            // Signal to charts that data has changed
            if (window.mindlyCharts) {
                window.mindlyCharts.updateCharts();
            }
            
            // Signal to insights that data has changed
            if (window.mindlyApp && window.mindlyApp.loadInsights) {
                window.mindlyApp.loadInsights();
            }
            
            // If deleting entry that's being edited, reset form
            if (this.editingEntryId === entryId) {
                this.journalForm.reset();
                this.setDefaultDate();
                this.editingEntryId = null;
                this.submitButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save Entry
                `;
            }
            
        } catch (error) {
            console.error('Error deleting entry:', error);
            MindlyAPI.showToast('Error deleting entry. Please try again.', 'error');
        }
    }
    
    /**
     * Update streak display
     * 
     * @param {Object} streaksData - Streak information
     */
    updateStreaksDisplay(streaksData) {
        // Update streak displays
        const streakElements = document.querySelectorAll('.streak-count');
        streakElements.forEach(element => {
            element.textContent = streaksData.current_streak;
        });
    }
}