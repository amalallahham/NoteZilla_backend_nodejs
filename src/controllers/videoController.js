const axios = require("axios");
const FormData = require("form-data");
const Video = require("../models/Video");
const { uploadToAzure } = require("../middleware/upload");
const ApiResponse = require("../utils/response");
const deepSeek = require("../service/deepseekService");

const WHISPER_URL = process.env.WHISPER_URL;

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user?.id;

    const title = (
      req.body.title ||
      req.file.originalname ||
      "Untitled"
    ).trim();

    // Upload to Azure
    const { blobName, url } = await uploadToAzure(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Send to Whisper
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

    // Summarize with DeepSeek
    const summaryResult = await deepSeek.summarizeTranscript(transcript);
    console.log("Summary result:", summaryResult);

    // If DeepSeek failed, return error (or you can choose to still save the transcript only)
    if (summaryResult.error) {
      return res
        .status(summaryResult.status || 500)
        .json(
          ApiResponse.error(summaryResult.error, summaryResult.status || 500)
        );
    }

    const summary = summaryResult.summary;
    console.log("Generated summary:", summary);
    const result = await Video.create({
      title,
      videoUrl: url,
      transcript,
      userId,
      summary: JSON.stringify(summary),
    });

    return res.status(201).json(
      ApiResponse.success(
        {
          id: result.id,
          title,
          videoUrl: url,
          transcriptSummary: summary,
          transcript,
        },
        "Upload & transcription successful"
      )
    );
  } catch (err) {
    console.error("Video upload error:", err);
    return res.status(500).json(ApiResponse.error("Upload failed", 500, err));
  }
};

const getUserSummaries = async (req, res) => {
  try {
    const userId = req.user.id;

    const videos = await Video.findByUser(userId);

    return res
      .status(200)
      .json(
        ApiResponse.success({ videos }, "Fetched user summaries successfully")
      );
  } catch (err) {
    return res
      .status(500)
      .json(ApiResponse.error("Failed to fetch summaries", 500, err));
  }
};


const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id); 

    if (!video) {
      return res
        .status(404)
        .json(ApiResponse.error("Video not found", 404));
    }


    const plain = video.toJSON ? video.toJSON() : { ...video };


    return res
      .status(200)
      .json(
        ApiResponse.success(
          { video: plain },
          "Fetched video summary successfully"
        )
      );
  } catch (err) {
    console.error("Get video by ID error:", err);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to fetch video summary", 500, err));
  }
};


const updateVideoTitle = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json(ApiResponse.error("Title is required", 400));
    }

    const video = await Video.findById(id);

    if (!video) {
      return res
        .status(404)
        .json(ApiResponse.error("Video not found", 404));
    }

    if (userId && video.userId && video.userId !== userId) {
      return res
        .status(403)
        .json(ApiResponse.error("Not authorized to edit this video", 403));
    }

    video.title = title.trim();
    await (video.save ? video.save() : Video.updateById(id, { title: video.title }));

    const plain = video.toJSON ? video.toJSON() : { ...video };

    return res
      .status(200)
      .json(
        ApiResponse.success(
          { video: plain },
          "Title updated successfully"
        )
      );
  } catch (err) {
    console.error("Update video title error:", err);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to update title", 500, err));
  }
};


module.exports = { uploadVideo, getUserSummaries, getVideoById , updateVideoTitle};