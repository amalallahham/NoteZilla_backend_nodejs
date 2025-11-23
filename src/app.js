const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { migrate } = require("./db/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
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

// 🧠 Routes
const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const adminRoutes = require("./routes/admin");

app.use("/auth", authRoutes);
app.use("/videos", videoRoutes);
app.use("/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Server error",
    message: err.message,
  });
});

(async () => {
  try {
    await migrate();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
