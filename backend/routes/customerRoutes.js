// customerRoutes.js
const express = require('express');
const customerController = require('../controllers/CustomerController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiters');
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
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType) {
      cb(null, true);
    } else {
      cb(new Error('File format should be JPEG, JPG, or PNG'), false);
    }
  }
});

// Download route
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const file = path.join(__dirname, '../uploads', filename); // Adjust path if necessary

  res.download(file, filename, (err) => {
    if (err) {
      console.error("File download error:", err);
      res.status(404).send("File not found.");
    }
  });
});

// Define routes
router.post('/register', registerLimiter, upload.fields([
  { name: 'nicIdImage', maxCount: 1 },
  { name: 'addressVerificationDoc', maxCount: 1 }
]), customerController.register);

router.post('/login',loginLimiter, customerController.login);

router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome to your dashboard, ${req.customer.name}` });
});

router.get('/customers', customerController.getAllCustomers);
router.delete('/delete/:id', customerController.deleteCustomer);
router.get('/pending', customerController.getPendingCustomers);
router.put('/approve/:id', customerController.approveCustomer);
router.put('/reject/:id', customerController.rejectCustomer);

module.exports = router;
