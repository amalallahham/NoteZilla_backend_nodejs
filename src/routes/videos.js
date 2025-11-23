const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { apiUsage } = require("../middleware/apiUsage");
const { upload } = require("../middleware/upload");
const { uploadVideo, getUserSummaries, getVideoById } = require("../controllers/videoController");

router.post("/upload", requireAuth, apiUsage, upload.single("file"), uploadVideo);

router.get("/summaries", requireAuth, getUserSummaries);

router.get("/summary/:id", requireAuth, getVideoById);


module.exports = router;
