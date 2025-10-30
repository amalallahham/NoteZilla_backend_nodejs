const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { migrate } = require('./db/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

// 🧠 Routes
const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);


app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message,
  });
});

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
