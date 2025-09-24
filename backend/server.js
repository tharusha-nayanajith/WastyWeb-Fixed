const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const cloudinary = require('cloudinary').v2;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9500;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
const URL = process.env.MONGODB_URL;
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection success");
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "20mb" }));
// Do NOT expose raw uploads publicly; use authorized download route instead
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/user", require("./routes/userRoutes.js"));
app.use("/customer", require("./routes/customerRoutes.js"));
app.use("/route", require("./routes/routeRoutes.js"));
app.use("/waste", require("./routes/wasteCollectionRoutes.js"));
app.use("/special-collections", require("./routes/specialCollectionRoutes"));



// Cloudinary Upload Route
app.post("/upload", async (req, res) => {
  try {
    const { image_url } = req.body;
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
