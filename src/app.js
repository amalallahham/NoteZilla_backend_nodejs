// Main application file for NoteZilla backend
// AI Assistant: Application structure and middleware setup generated with assistance from GitHub Copilot

const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { migrate } = require("./db/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS headers
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 📚 Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Track API endpoint usage
const { trackEndpoint } = require("./middleware/apiStats");
app.use(trackEndpoint);

// 🧠 Routes
const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);

app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Server error",
    message: err.message,
  });
});

(async () => {
  try {

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // run migration AFTER we are already listening
    migrate()
      .then(() => console.log("Migration completed"))
      .catch(err => console.error("Migration error:", err));

  } catch (err) {
    console.error("Boot failure:", err);
    process.exit(1);
  }
})();
