// API Statistics tracking middleware
// AI Assistant: Middleware logic generated with assistance from GitHub Copilot

const { run, get } = require('../db/db');

const trackEndpoint = async (req, res, next) => {
    // Call next immediately, then track async
    next();

    // Track after response is sent
    res.on('finish', async () => {
        try {
            // Only track successful API calls (not 404s)
            if (res.statusCode === 404) return;

            const method = req.method;
            const endpoint = req.route ? req.baseUrl + req.route.path : req.path;

            // Skip tracking for static files, documentation, and OPTIONS
            if (method === 'OPTIONS' ||
                endpoint.includes('/api-docs') ||
                endpoint.includes('/doc') ||
                !endpoint.startsWith('/api/v1')) {
                return;
            }

            // Check if this method+endpoint combo exists
            const existing = await get(
                'SELECT id, count FROM ApiStats WHERE method = ? AND endpoint = ?',
                [method, endpoint]
            );

            if (existing) {
                // Increment count
                await run(
                    `UPDATE ApiStats SET count = count + 1, lastCalled = datetime('now') WHERE id = ?`,
                    [existing.id]
                );
            } else {
                // Create new entry
                await run(
                    `INSERT INTO ApiStats (method, endpoint, count) VALUES (?, ?, 1)`,
                    [method, endpoint]
                );
            }
        } catch (err) {
            console.error('Error tracking API stats:', err);
        }
    });
};

module.exports = { trackEndpoint };
