const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug mode
const DEBUG = true;

// Debug logging function
function debugLog(...args) {
    if (DEBUG) {
        console.log(new Date().toISOString(), ...args);
    }
}

// Error logging function
function errorLog(...args) {
    console.error(new Date().toISOString(), 'ERROR:', ...args);
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
    errorLog('Uncaught Exception:', err);
    // Keep the process running
});

process.on('unhandledRejection', (err) => {
    errorLog('Unhandled Rejection:', err);
    // Keep the process running
});

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = {
    data: null,
    timestamp: 0
};

// Helper function to check cache validity
function isCacheValid() {
    return cache.data && (Date.now() - cache.timestamp) < CACHE_DURATION;
}

// Helper function to parse severity from title
function parseSeverity(title) {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('critical') || lowercaseTitle.includes('urgent')) return 'CRITICAL';
    if (lowercaseTitle.includes('high')) return 'HIGH';
    if (lowercaseTitle.includes('medium')) return 'MEDIUM';
    if (lowercaseTitle.includes('low')) return 'LOW';
    return 'INFO';
}

// Helper function to parse date
function parseDate(dateStr) {
    try {
        return new Date(dateStr).toISOString().split('T')[0];
    } catch (e) {
        errorLog('Date parsing error:', e);
        return dateStr;
    }
}

// Helper function to categorize alert
function categorizeAlert(title) {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('vulnerability') || lowercaseTitle.includes('cve')) return 'VULNERABILITY';
    if (lowercaseTitle.includes('malware') || lowercaseTitle.includes('ransomware')) return 'MALWARE';
    if (lowercaseTitle.includes('phishing')) return 'PHISHING';
    if (lowercaseTitle.includes('advisory')) return 'ADVISORY';
    if (lowercaseTitle.includes('patch') || lowercaseTitle.includes('update')) return 'PATCH';
    return 'GENERAL';
}

// Helper function to clean HTML content
function cleanHtml(html) {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Helper function to fetch with retry
async function fetchWithRetry(url, options = {}, retries = 3) {
    const timeout = options.timeout || 10000;
    let lastError;

    for (let i = 0; i < retries; i++) {
        try {
            debugLog(`Attempting to fetch ${url} (attempt ${i + 1}/${retries})`);
            const response = await axios({
                url,
                timeout,
                ...options
            });
            debugLog(`Successfully fetched ${url}`);
            return response;
        } catch (error) {
            lastError = error;
            errorLog(`Failed to fetch ${url} (attempt ${i + 1}/${retries}):`, error.message);
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000;
                debugLog(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}

// CSA Alerts endpoint
app.get('/api/alerts', async (req, res) => {
    debugLog('Received request for /api/alerts');
    try {
        // Check cache first
        if (isCacheValid()) {
            debugLog('Returning cached data');
            return res.json({
                success: true,
                data: cache.data,
                fromCache: true,
                lastUpdated: new Date(cache.timestamp).toISOString()
            });
        }

        debugLog('Cache invalid or empty, fetching new data');
        
        // Fetch the main alerts page
        const mainPageResponse = await fetchWithRetry('https://www.csa.gov.sg/alerts-and-advisories/alerts', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(mainPageResponse.data);
        const alerts = [];

        // Find and process alert items
        $('.content-listing-item').each((i, element) => {
            const $element = $(element);
            const title = $element.find('h2, h3, h4, .title').first().text().trim();
            const date = $element.find('.date, time, .meta').first().text().trim();
            const description = $element.find('.description, .excerpt, .summary').first().text().trim();
            const link = $element.find('a').first().attr('href');

            if (title) {
                alerts.push({
                    title,
                    date: parseDate(date),
                    description: description || '',
                    severity: parseSeverity(title),
                    category: categorizeAlert(title),
                    link: link ? new URL(link, 'https://www.csa.gov.sg').href : null
                });
            }
        });

        debugLog(`Found ${alerts.length} alerts`);

        // If no alerts found with first selector, try alternative selectors
        if (alerts.length === 0) {
            debugLog('Trying alternative selectors');
            $('article, .card, .news-item').each((i, element) => {
                const $element = $(element);
                const title = $element.find('h2, h3, h4, .title').first().text().trim();
                const date = $element.find('.date, time, .meta').first().text().trim();
                const description = $element.find('p, .description, .content').first().text().trim();
                const link = $element.find('a').first().attr('href');

                if (title) {
                    alerts.push({
                        title,
                        date: parseDate(date),
                        description: description || '',
                        severity: parseSeverity(title),
                        category: categorizeAlert(title),
                        link: link ? new URL(link, 'https://www.csa.gov.sg').href : null
                    });
                }
            });
        }

        // Sort by date
        alerts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update cache if we got alerts
        if (alerts.length > 0) {
            cache = {
                data: alerts,
                timestamp: Date.now()
            };
            debugLog('Cache updated');
        }

        const response = {
            success: true,
            data: alerts,
            fromCache: false,
            lastUpdated: new Date().toISOString(),
            debug: {
                alertsFound: alerts.length,
                pageTitle: $('title').text().trim()
            }
        };

        debugLog('Sending response');
        res.json(response);

    } catch (error) {
        errorLog('Error in /api/alerts:', error);
        
        if (cache.data) {
            debugLog('Using cached data as fallback');
            return res.json({
                success: true,
                data: cache.data,
                fromCache: true,
                fallback: true,
                lastUpdated: new Date(cache.timestamp).toISOString()
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to fetch CSA alerts',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    debugLog('Health check requested');
    res.json({ 
        status: 'ok',
        cache: {
            valid: isCacheValid(),
            age: Date.now() - cache.timestamp,
            lastUpdated: cache.timestamp ? new Date(cache.timestamp).toISOString() : null
        },
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Start the server
const server = app.listen(PORT, () => {
    debugLog(`Server is running on port ${PORT}`);
    debugLog(`
Available endpoints:
- GET /api/alerts   : CSA Singapore cybersecurity alerts (with severity and categorization)
- GET /health      : Health check (includes cache status)
    `);
});

// Handle server errors
server.on('error', (err) => {
    errorLog('Server error:', err);
});

// Handle server shutdown
process.on('SIGINT', () => {
    debugLog('Received SIGINT. Shutting down gracefully...');
    server.close(() => {
        debugLog('Server closed');
        process.exit(0);
    });
});
