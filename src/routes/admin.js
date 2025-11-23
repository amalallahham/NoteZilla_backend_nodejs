const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const dash = require("../controllers/admin/dashboardController");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with API usage statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       apiCalls:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 totalUsers:
 *                   type: integer
 *                 totalApiCalls:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get("/users", dash.getAllUsers);

module.exports = router;
