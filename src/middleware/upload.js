// middleware/upload.js
const multer = require("multer");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
require("dotenv").config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter: (_req, file, cb) => {
    const allowed = ["video/mp4", "audio/mpeg", "audio/mp3"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey  = process.env.AZURE_STORAGE_KEY;
const container   = process.env.AZURE_BLOB_CONTAINER;

if (!accountName || !accountKey) {
  throw new Error("Missing AZURE_STORAGE_ACCOUNT or AZURE_STORAGE_KEY");
}

const sharedKeyCred = new StorageSharedKeyCredential(accountName, accountKey);
const serviceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCred
);

async function uploadToAzure(fileBuffer, originalName, mimeType) {
  const containerClient = serviceClient.getContainerClient(container);
  await containerClient.createIfNotExists();

  const ext = (originalName?.split(".").pop() || "bin").toLowerCase();
  const blobName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const blockBlob = containerClient.getBlockBlobClient(blobName);

  await blockBlob.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType || "application/octet-stream" },
  });

  return { blobName, url: blockBlob.url }; // Note: private if the container is private
}

module.exports = { upload, uploadToAzure };
