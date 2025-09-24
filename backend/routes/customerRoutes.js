// customerRoutes.js
const express = require('express');
const customerController = require('../controllers/CustomerController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer with custom storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

// Download route
router.get('/download/:filename', authMiddleware, (req, res) => {
  const raw = req.params.filename || '';
  const filename = path.basename(raw); // prevent path traversal
  const uploadsDir = path.join(__dirname, '../uploads');
  const file = path.join(uploadsDir, filename);

  if (!file.startsWith(uploadsDir)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  res.download(file, filename, (err) => {
    if (err) {
      console.error("File download error:", err);
      return res.status(404).send("File not found.");
    }
  });
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
