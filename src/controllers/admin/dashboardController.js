// Admin dashboard controller for user and endpoint statistics
// AI Assistant: Statistics aggregation logic generated with assistance from GitHub Copilot

const { all } = require('../../db/db');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await all(`
      SELECT id, firstName, lastName, email, role, apiCalls, createdAt 
      FROM Users 
      ORDER BY createdAt DESC
    `);

    res.json({
      users,
      totalUsers: users.length,
      totalApiCalls: users.reduce((sum, user) => sum + (user.apiCalls || 0), 0)
    });
  } catch (err) {
    next(err);
  }
};

const getEndpointStats = async (req, res, next) => {
  try {
    const stats = await all(`
      SELECT method, endpoint, count, lastCalled
      FROM ApiStats
      ORDER BY count DESC
    `);

    const totalRequests = stats.reduce((sum, stat) => sum + stat.count, 0);

    res.json({
      stats,
      totalEndpoints: stats.length,
      totalRequests
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getEndpointStats
};