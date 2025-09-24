// backend/server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require('path');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 9500;

/**
 * Validate required environment variables on startup
 * Exit the process with a helpful error message if any are missing.
 */
const requiredEnvs = [
  'MONGODB_URL',
  'JWT_SECRET', // if you use JWT (validate here to ensure it's set)
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  // add FRONTEND_URL if you want to enforce a frontend origin to be provided
];

const missing = requiredEnvs.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Exiting to prevent insecure startup. Please set the missing variables and restart.');
  process.exit(1);
}

// Basic security middlewares
app.use(helmet());

// CORS — Restrict to your frontend origin (set FRONTEND_URL in .env)
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
  origin: frontendOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Only enable credentials if you use cookie-based auth.
  // Toggle it by setting USE_COOKIES=true in your .env
  credentials: process.env.USE_COOKIES === 'true'
};
app.use(cors(corsOptions));

// Rate limiter — basic protection against brute-force/DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs (adjust to your needs)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsers with safe limits
app.use(express.json({ limit: "1mb" })); // reduced limit
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Do NOT serve uploads publicly from web root — remove insecure static serving
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // removed intentionally

// Configure Cloudinary (validated above)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB with improved error handling
const URL = process.env.MONGODB_URL;
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connection success"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // fail fast if DB connection fails
  });

// Routes — keep routes after middlewares
app.use("/user", require("./routes/userRoutes.js"));
app.use("/customer", require("./routes/customerRoutes.js"));
app.use("/route", require("./routes/routeRoutes.js"));
app.use("/waste", require("./routes/wasteCollectionRoutes.js"));
app.use("/special-collections", require("./routes/specialCollectionRoutes"));

// Cloudinary Upload Route (still allowed — stores to Cloudinary)
app.post("/upload", async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) return res.status(400).json({ error: "image_url is required" });

    const cloudinary_res = await cloudinary.uploader.upload(image_url, {
      folder: "/images",
    });

    const imageUrl = cloudinary_res.secure_url;
    res.status(200).json({ message: "Image uploaded successfully", url: imageUrl });
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is up and running on port: ${PORT}`);
});
