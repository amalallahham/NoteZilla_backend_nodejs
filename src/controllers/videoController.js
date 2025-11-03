// controllers/videoController.js
const axios = require("axios");
const FormData = require("form-data");
const Video = require("../models/Video");
const { uploadToAzure } = require("../middleware/upload");

const WHISPER_URL = process.env.WHISPER_URL;

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = req.user?.id;
    const title = (req.body.title || req.file.originalname || "Untitled").trim();

    // 1) Upload the bytes to Azure
    const { blobName, url } = await uploadToAzure(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 2) Send the same bytes to Whisper
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);
    form.append("response_format", "json");

    const whisperRes = await axios.post(WHISPER_URL, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 10 * 60 * 1000,
    });

    const data = whisperRes.data || {};
    const transcript =
      typeof data === "string"
        ? data
        : data.text || data.transcript || JSON.stringify(data);

    // 3) Save metadata (store blobName + url)
    const result = await Video.create({
      title,
      videoUrl: url,
      blobName,
      transcript,
      userId,
    });

    res.status(201).json({
      message: "Upload & transcription successful",
      videoId: result.lastID,
      title,
      videoUrl: url,             // private URL; use SAS for playback
      transcript: transcript,    // ✅ Include the actual transcript text
      transcriptLength: transcript.length,
      apiCalls: req.apiUsage?.total,
      remainingCalls: req.apiUsage?.remaining,
    });
  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = { uploadVideo };
