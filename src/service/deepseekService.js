// services/deepSeekService.js
const axios = require("axios");

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.warn("[DeepSeek] DEEPSEEK_API_KEY is not set in environment variables.");
}

function extractJson(text) {
  try {
    JSON.parse(text);
    return text;
  } catch {

  }

  const fenced = text.match(/```json([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("No JSON block found in DeepSeek response");
}

async function summarizeTranscript(text) {
  console.log("DeepSeek API Key:", DEEPSEEK_API_KEY ? "Loaded" : "Not Loaded");

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1",
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content:
              "You convert lecture transcripts into clean, structured JSON study notes. " +
              "ALWAYS return valid JSON. NEVER return HTML, markdown, or explanations. " +
              "Do NOT wrap the JSON in code fences. Do NOT add any text before or after the JSON."
          },
          {
            role: "user",
            content:
              "Convert the following transcript into structured JSON with this exact format:\n\n" +
              "{\n" +
              '  "title": "string",\n' +
              '  "sections": [\n' +
              "    {\n" +
              '      "heading": "string",\n' +
              '      "points": ["string", "string"]\n' +
              "    }\n" +
              "  ]\n" +
              "}\n\n" +
              "If there is not enough info for a field, use an empty string or empty array.\n\n" +
              "Transcript:\n\n" +
              text
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 180000
      }
    );

    let raw = response.data?.choices?.[0]?.message?.content || "";
    raw = raw.trim();
    console.log("DeepSeek raw response:", raw);

    if (!raw) {
      console.error("[DeepSeek] Empty response content:", response.data);
      return {
        error: "DeepSeek returned an empty response.",
        status: 502
      };
    }

    let jsonText;
    try {
      jsonText = extractJson(raw);
    } catch (e) {
      console.error("[DeepSeek] Failed to extract JSON:", e.message);
      console.error("[DeepSeek] Raw content:", raw);
      return {
        error: "DeepSeek did not return valid JSON.",
        status: 500
      };
    }

    let summaryJson;
    try {
      summaryJson = JSON.parse(jsonText);
    } catch (err) {
      console.error("[DeepSeek] JSON parsing error. JSON text:", jsonText);
      return {
        error: "DeepSeek did not return valid JSON.",
        status: 500
      };
    }

    return {
      summary: summaryJson,
      model: response.data?.model,
      usage: response.data?.usage
    };
  } catch (err) {
    console.error(
      "[DeepSeek] HTTP error:",
      err.response?.data || err.message || err
    );

    return {
      error: err.response?.data || err.message,
      status: err.response?.status || 500
    };
  }
}

module.exports = { summarizeTranscript };
