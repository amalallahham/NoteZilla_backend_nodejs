// User routes for profile management
// AI Assistant: Code structure generated with assistance from GitHub Copilot

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const ApiResponse = require('../utils/response');
const messages = require('../lang/messages');

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json(ApiResponse.error(messages.user.notFound, 404));
    }

    const apiCallsRemaining = Math.max(0, 20 - (user.apiCalls || 0));

    res.json(ApiResponse.success({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      apiCalls: user.apiCalls || 0,
      apiCallsRemaining,
      createdAt: user.createdAt
    }, messages.user.profileRetrieved));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
