const User = require("../models/User");
const messages = require("../lang/messages");

const apiUsage = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: messages.auth.unauthorized });
    }

    // Check if user has remaining API calls
    const hasCallsRemaining = await User.hasApiCallsRemaining(userId);

    if (!hasCallsRemaining) {
      const currentCalls = await User.getApiCallsCount(userId);
      return res.status(403).json({
        error: messages.api.limitExceeded,
        message: messages.api.limitMessage,
        currentCalls,
        maxCalls: 20,
      });
    }

    // Increment count
    await User.incrementApiCalls(userId);
    const updatedCalls = await User.getApiCallsCount(userId);

    // Attach the info to the request for downstream handlers
    req.apiUsage = {
      total: updatedCalls,
      remaining: 20 - updatedCalls,
    };

    next();
  } catch (err) {
    console.error("API usage middleware error:", err);
    res.status(500).json({ error: messages.api.failedToTrack });
  }
};

module.exports = { apiUsage };
