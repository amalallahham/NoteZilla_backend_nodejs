const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { apiUsage } = require("../middleware/apiUsage");
const { upload } = require("../middleware/upload");
const { uploadVideo } = require("../controllers/videoController");

router.post("/upload", requireAuth, apiUsage, upload.single("file"), uploadVideo);

module.exports = router;
