// customerRoutes.js
const express = require('express');
const customerController = require('../controllers/CustomerController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer with custom storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // keep outside static serving
  },
  filename: (req, file, cb) => {
    // Extract the file extension from the original file name
    const extension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Save the file with its original extension
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 2 }, // 5MB per file, max 2 files
  fileFilter: (req, file, cb) => {
    const allowedMime = ["image/jpeg", "image/png"]; // accept only jpeg/png
    const allowedExt = [".jpeg", ".jpg", ".png"]; // enforced by storage name
    const isMimeOk = allowedMime.includes(file.mimetype);
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isExtOk = allowedExt.includes(ext);
    if (isMimeOk && isExtOk) {
      return cb(null, true);
    }
    return cb(new Error('Invalid file type. Only JPEG/PNG are allowed'), false);
  }
});

/**
 * Secure download route
 * - Requires authentication
 * - Sanitizes filename
 * - Ensures file exists
 * - Optionally enforce owner or admin
 */
router.get('/download/:filename', authMiddleware, async (req, res) => {
  try {
    const raw = req.params.filename || '';
    const filename = path.basename(req.params.filename); // sanitize
    const filename2 = path.basename(raw); // prevent path traversal
    const filePath = path.join(__dirname, '../uploads', filename);
    const uploadsDir = path.join(__dirname, '../uploads');
    const file = path.join(uploadsDir, filename2);

    if (!file.startsWith(uploadsDir)) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Optional: Only allow admin or owner
    // Example: check if the logged-in customer has this file
    // (assuming you store file references in the DB when uploaded)
    if (req.customer.role !== 'admin') {
      const ownsFile = req.customer.nicIdImage?.includes(filename) ||
                       req.customer.addressVerificationDoc?.includes(filename);
      if (!ownsFile) {
        return res.status(403).json({ error: 'Access denied: not your document' });
      }
    }

    res.download(file, filename2, (err) => {
      if (err) {
        console.error("File download error:", err);
        return res.status(404).send("File not found.");
     }
    });

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("File download error:", err);
        res.status(500).json({ error: 'Download failed' });
      }
    });
  } catch (err) {
    console.error("Download route error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Define routes
router.post('/register', upload.fields([
  { name: 'nicIdImage', maxCount: 1 },
  { name: 'addressVerificationDoc', maxCount: 1 }
]), customerController.register);

router.post('/login', customerController.login);

router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome to your dashboard, ${req.customer.name}` });
});

router.get('/customers', customerController.getAllCustomers);
router.delete('/delete/:id', customerController.deleteCustomer);
router.get('/pending', customerController.getPendingCustomers);
router.put('/approve/:id', customerController.approveCustomer);
router.put('/reject/:id', customerController.rejectCustomer);

module.exports = router;
