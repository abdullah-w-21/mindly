/**
 * Mindly - Chart Visualizations
 * Creates stunning and interactive data visualizations
 */

/**
 * MindlyCharts class manages the creation and updating of visualizations
 */
class MindlyCharts {
    constructor() {
        // Store chart instances for later updates
        this.charts = {
            moodLine: null,
            sentimentPie: null,
            weeklyBar: null
        };
        
        // Chart colors
        this.colors = {
            positive: 'rgba(64, 192, 87, 0.8)', // green
            positiveBorder: 'rgba(64, 192, 87, 1)',
            positiveGradientStart: 'rgba(64, 192, 87, 0.8)',
            positiveGradientEnd: 'rgba(64, 192, 87, 0.1)',
            
            neutral: 'rgba(173, 181, 189, 0.8)', // gray
            neutralBorder: 'rgba(173, 181, 189, 1)',
            neutralGradientStart: 'rgba(173, 181, 189, 0.8)',
            neutralGradientEnd: 'rgba(173, 181, 189, 0.1)',
            
            negative: 'rgba(250, 82, 82, 0.8)', // red
            negativeBorder: 'rgba(250, 82, 82, 1)',
            negativeGradientStart: 'rgba(250, 82, 82, 0.8)',
            negativeGradientEnd: 'rgba(250, 82, 82, 0.1)',
            
            accent: 'rgba(66, 99, 235, 0.7)', // primary blue
            accentBorder: 'rgba(66, 99, 235, 1)',
            accentGradientStart: 'rgba(66, 99, 235, 0.7)',
            accentGradientEnd: 'rgba(66, 99, 235, 0.1)',
            
            gridLines: 'rgba(0, 0, 0, 0.05)',
            text: 'rgba(108, 117, 125, 1)'
        };
        
        // Chart fonts
        this.fonts = {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        };
        
        // Time filter settings
        this.timeFilter = {
            days: 30
        };
        
        // Check if dark mode and adjust colors if needed
        this.updateColorTheme();
        
        // Bind events
        this.bindEvents();
    }
    
    /**
     * Bind event listeners for charts
     */
    bindEvents() {
        // Time filter buttons
        document.querySelectorAll('.time-filter-button').forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                document.querySelectorAll('.time-filter-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Update time filter and refresh charts
                this.timeFilter.days = parseInt(button.dataset.days);
                this.updateCharts();
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.tab-button').forEach(t => {
                    t.classList.remove('active');
                });
                tab.classList.add('active');
                
                // Update active content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const tabId = `${tab.dataset.tab}-tab`;
                document.getElementById(tabId).classList.add('active');
                
                // Resize charts when tab becomes visible
                window.setTimeout(() => {
                    this.resizeCharts();
                }, 10);
            });
        });
        
        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.updateColorTheme();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCharts();
        });
    }
    
    /**
     * Update all chart dimensions when resized
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }
    
    /**
     * Update color theme based on dark/light mode
     */
    updateColorTheme() {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDarkMode) {
            this.colors.gridLines = 'rgba(255, 255, 255, 0.1)';
            this.colors.text = 'rgba(173, 181, 189, 1)';
        } else {
            this.colors.gridLines = 'rgba(0, 0, 0, 0.05)';
            this.colors.text = 'rgba(108, 117, 125, 1)';
        }
        
        // Update existing charts if they exist
        this.updateChartsForTheme();
    }
    
    /**
     * Update existing charts for the current theme
     */
    updateChartsForTheme() {
        // Update grid lines and other theme-specific options
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                // Update grid color
                if (chart.options.scales && chart.options.scales.x) {
                    chart.options.scales.x.grid.color = this.colors.gridLines;
                    chart.options.scales.x.ticks.color = this.colors.text;
                }
                
                if (chart.options.scales && chart.options.scales.y) {
                    chart.options.scales.y.grid.color = this.colors.gridLines;
                    chart.options.scales.y.ticks.color = this.colors.text;
                }
                
                // Update legend text color
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels = {
                        ...chart.options.plugins.legend.labels,
                        color: this.colors.text
                    };
                }
                
                chart.update();
            }
        });
    }
    
    /**
     * Initialize all charts
     */
    async initCharts() {
        try {
            // Register Chart.js plugins globally (if not already registered)
            if (Chart.registry.plugins.get('gradient') === undefined && window.ChartGradient) {
                Chart.register(window.ChartGradient);
            }
            
            if (Chart.registry.plugins.get('datalabels') === undefined && window.ChartDataLabels) {
                Chart.register(window.ChartDataLabels);
            }
            
            // Configure global chart defaults
            Chart.defaults.font.family = this.fonts.family;
            Chart.defaults.color = this.colors.text;
            Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold', size: 13 };
            Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
            Chart.defaults.plugins.tooltip.padding = 10;
            Chart.defaults.plugins.tooltip.cornerRadius = 6;
            Chart.defaults.plugins.tooltip.displayColors = true;
            Chart.defaults.plugins.tooltip.usePointStyle = true;
            Chart.defaults.plugins.tooltip.boxPadding = 4;
            
            // Get data for charts
            const moodTrends = await MindlyAPI.getMoodTrends(this.timeFilter.days);
            const sentimentDistribution = await MindlyAPI.getSentimentDistribution(this.timeFilter.days);
            const weeklySummary = await MindlyAPI.getWeeklySummary();
            
            // Create charts
            this.createMoodLineChart(moodTrends.mood_trends);
            this.createSentimentPieChart(sentimentDistribution.sentiment_distribution);
            this.createWeeklyBarChart(weeklySummary.weekly_summary);
            
            // Update sentiment summary cards
            this.updateSentimentSummary(sentimentDistribution.sentiment_distribution);
            
        } catch (error) {
            console.error('Error initializing charts:', error);
            // Show a user-friendly error in the UI
            this.showChartError();
        }
    }
    
    /**
     * Create mood line chart with advanced styling
     * 
     * @param {Array} moodData - Array of mood data points
     */
    createMoodLineChart(moodData) {
        // Get canvas context
        const canvas = document.getElementById('mood-line-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Prepare data
        const dates = moodData.map(item => {
            // Format date to be more readable
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const scores = moodData.map(item => item.score);
        const sentiments = moodData.map(item => item.sentiment);
        
        // Create point styles based on sentiment
        const pointBackgroundColors = sentiments.map(sentiment => {
            if (sentiment === 'positive') return this.colors.positive;
            if (sentiment === 'negative') return this.colors.negative;
            return this.colors.neutral;
        });
        
        const pointBorderColors = sentiments.map(sentiment => {
            if (sentiment === 'positive') return this.colors.positiveBorder;
            if (sentiment === 'negative') return this.colors.negativeBorder;
            return this.colors.neutralBorder;
        });
        
        // Add gradient fill area below the line
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, this.colors.accentGradientStart);
        gradient.addColorStop(1, this.colors.accentGradientEnd);
        
        // Create annotations for the mood zones
        const annotations = {
            positiveZone: {
                type: 'box',
                drawTime: 'beforeDatasetsDraw',
                xScaleID: 'x',
                yScaleID: 'y',
                yMin: 0.2,
                yMax: 1,
                backgroundColor: 'rgba(64, 192, 87, 0.05)',
                borderWidth: 0
            },
            negativeZone: {
                type: 'box',
                drawTime: 'beforeDatasetsDraw',
                xScaleID: 'x',
                yScaleID: 'y',
                yMin: -1,
                yMax: -0.2,
                backgroundColor: 'rgba(250, 82, 82, 0.05)',
                borderWidth: 0
            },
            neutralLine: {
                type: 'line',
                drawTime: 'beforeDatasetsDraw',
                xScaleID: 'x',
                yScaleID: 'y',
                yMin: 0,
                yMax: 0,
                borderColor: 'rgba(173, 181, 189, 0.5)',
                borderWidth: 1,
                borderDash: [5, 5]
            }
        };
        
        // Create chart
        this.charts.moodLine = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Mood Score',
                    data: scores,
                    borderColor: this.colors.accent,
                    borderWidth: 3,
                    pointBackgroundColor: pointBackgroundColors,
                    pointBorderColor: pointBorderColors,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBorderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    backgroundColor: gradient,
                    // Add dropshadow to line
                    shadowColor: 'rgba(66, 99, 235, 0.2)',
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowOffsetY: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    annotation: {
                        annotations: annotations
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const sentiment = sentiments[index];
                                const score = scores[index].toFixed(2);
                                return `Mood: ${score} (${sentiment})`;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        grid: {
                            color: this.colors.gridLines,
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: this.colors.gridLines
                        },
                        min: -1,
                        max: 1,
                        ticks: {
                            callback: (value) => {
                                if (value === 1) return 'Positive';
                                if (value === 0) return 'Neutral';
                                if (value === -1) return 'Negative';
                                return '';
                            },
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Create sentiment pie chart with enhanced styling
     * 
     * @param {Object} distributionData - Sentiment distribution data
     */
    createSentimentPieChart(distributionData) {
        // Get canvas context
        const canvas = document.getElementById('sentiment-pie-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Prepare data
        const data = [
            distributionData.positive, 
            distributionData.neutral, 
            distributionData.negative
        ];
        
        const total = data.reduce((sum, val) => sum + val, 0);
        
        // Create chart with enhanced styling
        this.charts.sentimentPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: data,
                    backgroundColor: [
                        this.colors.positive,
                        this.colors.neutral,
                        this.colors.negative
                    ],
                    borderColor: [
                        this.colors.positiveBorder,
                        this.colors.neutralBorder,
                        this.colors.negativeBorder
                    ],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    },
                    // Add data labels to show percentages
                    datalabels: {
                        formatter: (value) => {
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return percentage > 8 ? `${percentage}%` : '';
                        },
                        color: 'white',
                        font: {
                            weight: 'bold',
                            size: 12
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Create weekly bar chart with enhanced styling
     * 
     * @param {Array} weeklyData - Weekly sentiment data
     */
    createWeeklyBarChart(weeklyData) {
        // Get canvas context
        const canvas = document.getElementById('weekly-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Prepare data
        const labels = weeklyData.map(item => item.week_label);
        const positiveData = weeklyData.map(item => item.positive);
        const neutralData = weeklyData.map(item => item.neutral);
        const negativeData = weeklyData.map(item => item.negative);
        
        // Create chart with enhanced styling
        this.charts.weeklyBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Positive',
                        data: positiveData,
                        backgroundColor: this.colors.positive,
                        borderColor: this.colors.positiveBorder,
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.8,
                        categoryPercentage: 0.9
                    },
                    {
                        label: 'Neutral',
                        data: neutralData,
                        backgroundColor: this.colors.neutral,
                        borderColor: this.colors.neutralBorder,
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.8,
                        categoryPercentage: 0.9
                    },
                    {
                        label: 'Negative',
                        data: negativeData,
                        backgroundColor: this.colors.negative,
                        borderColor: this.colors.negativeBorder,
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.8,
                        categoryPercentage: 0.9
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.colors.gridLines,
                            display: false
                        },
                        stacked: true,
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: this.colors.gridLines
                        },
                        stacked: true,
                        ticks: {
                            precision: 0,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update sentiment summary cards with data
     * 
     * @param {Object} distributionData - Sentiment distribution data
     */
    updateSentimentSummary(distributionData) {
        // Update count displays
        document.getElementById('positive-count').textContent = distributionData.positive;
        document.getElementById('neutral-count').textContent = distributionData.neutral;
        document.getElementById('negative-count').textContent = distributionData.negative;
    }
    
    /**
     * Update all charts with new data
     */
    async updateCharts() {
        try {
            // Get updated data
            const moodTrends = await MindlyAPI.getMoodTrends(this.timeFilter.days);
            const sentimentDistribution = await MindlyAPI.getSentimentDistribution(this.timeFilter.days);
            const weeklySummary = await MindlyAPI.getWeeklySummary();
            
            // Update mood line chart
            if (this.charts.moodLine) {
                this.updateMoodLineChart(moodTrends.mood_trends);
            } else {
                this.createMoodLineChart(moodTrends.mood_trends);
            }
            
            // Update sentiment pie chart
            if (this.charts.sentimentPie) {
                this.updateSentimentPieChart(sentimentDistribution.sentiment_distribution);
            } else {
                this.createSentimentPieChart(sentimentDistribution.sentiment_distribution);
            }
            
            // Update weekly bar chart
            if (this.charts.weeklyBar) {
                this.updateWeeklyBarChart(weeklySummary.weekly_summary);
            } else {
                this.createWeeklyBarChart(weeklySummary.weekly_summary);
            }
            
            // Update sentiment summary cards
            this.updateSentimentSummary(sentimentDistribution.sentiment_distribution);
            
        } catch (error) {
            console.error('Error updating charts:', error);
            MindlyAPI.showToast('Error updating charts. Please try again later.', 'error');
        }
    }
    
    /**
     * Update mood line chart with new data
     * 
     * @param {Array} moodData - Array of mood data points
     */
    updateMoodLineChart(moodData) {
        // Prepare data
        const dates = moodData.map(item => {
            // Format date to be more readable
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const scores = moodData.map(item => item.score);
        const sentiments = moodData.map(item => item.sentiment);
        
        // Create point styles based on sentiment
        const pointBackgroundColors = sentiments.map(sentiment => {
            if (sentiment === 'positive') return this.colors.positive;
            if (sentiment === 'negative') return this.colors.negative;
            return this.colors.neutral;
        });
        
        const pointBorderColors = sentiments.map(sentiment => {
            if (sentiment === 'positive') return this.colors.positiveBorder;
            if (sentiment === 'negative') return this.colors.negativeBorder;
            return this.colors.neutralBorder;
        });
        
        // Update chart data
        this.charts.moodLine.data.labels = dates;
        this.charts.moodLine.data.datasets[0].data = scores;
        this.charts.moodLine.data.datasets[0].pointBackgroundColor = pointBackgroundColors;
        this.charts.moodLine.data.datasets[0].pointBorderColor = pointBorderColors;
        
        // Update chart
        this.charts.moodLine.update();
    }
    
    /**
     * Update sentiment pie chart with new data
     * 
     * @param {Object} distributionData - Sentiment distribution data
     */
    updateSentimentPieChart(distributionData) {
        // Prepare data
        const data = [
            distributionData.positive, 
            distributionData.neutral, 
            distributionData.negative
        ];
        
        // Update chart data
        this.charts.sentimentPie.data.datasets[0].data = data;
        
        // Update chart
        this.charts.sentimentPie.update();
    }
    
    /**
     * Update weekly bar chart with new data
     * 
     * @param {Array} weeklyData - Weekly sentiment data
     */
    updateWeeklyBarChart(weeklyData) {
        // Prepare data
        const labels = weeklyData.map(item => item.week_label);
        const positiveData = weeklyData.map(item => item.positive);
        const neutralData = weeklyData.map(item => item.neutral);
        const negativeData = weeklyData.map(item => item.negative);
        
        // Update chart data
        this.charts.weeklyBar.data.labels = labels;
        this.charts.weeklyBar.data.datasets[0].data = positiveData;
        this.charts.weeklyBar.data.datasets[1].data = neutralData;
        this.charts.weeklyBar.data.datasets[2].data = negativeData;
        
        // Update chart
        this.charts.weeklyBar.update();
    }
    
    /**
     * Display error message when charts fail to load
     */
    showChartError() {
        const chartContainers = document.querySelectorAll('.chart-container');
        
        chartContainers.forEach(container => {
            container.innerHTML = `
                <div class="chart-error">
                    <p>Unable to load visualization data. Please try again later.</p>
                </div>
            `;
        });
    }
}