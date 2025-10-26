// userRoutes.js
const express = require("express");
const router = express.Router();
const {
  customerLogin,
  adminAndCollectorLogin,
  logoutUser,
  updateCustomer,
  updateAdmin,
  updateCollector,
  deleteUser,
  getAllUsers,
  getAllCustomers,
  getAllCollectors,
  getAllAdmins,
  getUserById,
  customerRegister,
  adminRegister,
  collectorRegister,
  changePassword,
  countCustomers,
  countCollectors,
  countAdmins,
  countCustomersRegisteredToday,
  loginWithGoogle,
} = require("../controllers/userController");
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiters');
// const { protect } = require("../middleware/authMiddleware");
// const { customerAuthentication } = require("../middleware/authentication");

// Register a new customer
router.post("/register-customer",  registerLimiter,customerRegister);

// Register a new admin
router.post("/register-admin", registerLimiter, adminRegister);

// Register a new manager
router.post("/register-collecter",  registerLimiter,collectorRegister);

// Login a user
router.post("/login-customer", registerLimiter, customerLogin);

// Login a user
router.post("/login-adminAndManger", registerLimiter, adminAndCollectorLogin);

// Login with Google ID token
router.post("/login-google", loginWithGoogle);

// Logout a user
router.post("/logout", logoutUser);

// Get all users
router.get("/", getAllUsers);

// Get all custoemrs
router.get("/allcustomers", getAllCustomers);

// Get all managers
router.get("/allCollectors", getAllCollectors);

// Get all admins
router.get("/allAdmins", getAllAdmins);

// Get user by ID
router.get("/get/:id", getUserById);

// Update user
router.put("/update-customer/:Id", updateCustomer);

// Update admin
router.put("/update-admin/:Id", updateAdmin);

// Update manager
router.put("/update-manager/:Id", updateCollector);

// Delete user
router.delete("/delete/:id", deleteUser);

//changepassword
router.put("/change-password/:id", changePassword);

//counts
router.get("/customers/count", countCustomers);
router.get("/managers/count", countCollectors);
router.get("/admins/count", countAdmins);

//new customers registered today
router.get("/customers/count/today", countCustomersRegisteredToday);

module.exports = router;
