const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { apiUsage } = require("../middleware/apiUsage");
const { upload } = require("../middleware/upload");
const {
  uploadVideo,
  getUserSummaries,
  getVideoById,
  updateVideoTitle,
  deleteVideo,
} = require("../controllers/videoController");

/**
 * @swagger
 * /videos/upload:
 *   post:
 *     summary: Upload a video for transcription and summarization
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Video or audio file (mp4, mp3, mpeg)
 *               title:
 *                 type: string
 *                 description: Optional title for the video
 *     responses:
 *       201:
 *         description: Video uploaded and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     videoUrl:
 *                       type: string
 *                     transcript:
 *                       type: string
 *                     transcriptSummary:
 *                       type: object
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Upload or processing failed
 */
router.post(
  "/upload",
  requireAuth,
  apiUsage,
  upload.single("file"),
  uploadVideo
);

/**
 * @swagger
 * /videos/summaries:
 *   get:
 *     summary: Get all video summaries for the authenticated user
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's video summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           videoUrl:
 *                             type: string
 *                           transcript:
 *                             type: string
 *                           summary:
 *                             type: string
 *                           userId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get("/summaries", requireAuth, getUserSummaries);

/**
 * @swagger
 * /videos/summary/{id}:
 *   get:
 *     summary: Get a specific video summary by ID
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     video:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         title:
 *                           type: string
 *                         videoUrl:
 *                           type: string
 *                         transcript:
 *                           type: string
 *                         summary:
 *                           type: string
 *                         userId:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Video not found
 */
router.get("/summary/:id", requireAuth, getVideoById);


router.put("/summary/:id", requireAuth, updateVideoTitle);

/**
 * @swagger
 * /videos/summary/{id}:
 *   delete:
 *     summary: Delete a video summary by ID
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Not authorized to delete this video
 *       404:
 *         description: Video not found
 */
router.delete("/summary/:id", requireAuth, deleteVideo);


module.exports = router;
