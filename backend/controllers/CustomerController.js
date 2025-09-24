// CustomerController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const multer = require('multer');

// at top
const LOCK_TIME = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
// Registration controller with detailed logging
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Construct the address object
    const address = {
      line1: req.body['address.line1'],
      line2: req.body['address.line2'],
      city: req.body['address.city'],
      state: req.body['address.state'],
      postalCode: req.body['address.postalCode']
    };



    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer instance
    const customer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      nicIdImage: req.files.nicIdImage[0].path.replace(/\\/g, '/'), // Replace backslashes
      addressVerificationDoc: req.files.addressVerificationDoc[0].path.replace(/\\/g, '/'), // Replace backslashes
      status: 'Pending Approval'
    });

    // Save to the database
    await customer.save();
    console.log("Customer saved:", customer); // Add this log to confirm saving

    res.status(201).json({ message: 'Registration successful, pending approval' });
  } catch (error) {
    console.error("Error saving customer:", error);
    res.status(500).json({ error: 'Registration failed due to server error' });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch the customer from the database
    const customer = await Customer.findOne({ email });
    if (!customer) {
      // User not found
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    if (customer.lockUntil && customer.lockUntil > Date.now()) {
      const remainingMs = customer.lockUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        error: 'Account locked due to multiple failed attempts.',
        lockExpiresInMinutes: remainingMinutes
      });
    }


    // Compare provided password with hashed password in the database
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      customer.failedLoginAttempts = (customer.failedLoginAttempts || 0) + 1;
      if (customer.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        customer.lockUntil = Date.now() + LOCK_TIME;
      }
      await customer.save();

      if (customer.lockUntil && customer.lockUntil > Date.now()) {
        return res.status(423).json({ error: `Account locked due to ${MAX_FAILED_ATTEMPTS} failed attempts. Try again later.` });
      }

      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Reset on success
    customer.failedLoginAttempts = 0;
    customer.lockUntil = null;
    await customer.save();

    if (customer.status !== 'Approved') {
      return res.status(403).json({ error: `Account is ${customer.status}` });
    }
    // Check if the user's status is approved
    if (customer.status !== 'Approved') {
      return res.status(403).json({ error: `Account is ${customer.status}` });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Login successful', 
      token, 
      customerId: customer._id 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Function to get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    // Fetch all customers from the database
    const customers = await Customer.find();

    // Return the list of customers
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the customer by ID and delete it
    const customer = await Customer.findByIdAndDelete(id);

    // If no customer found with the given ID
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Send success response
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// CustomerController.js

// Fetch pending customers
exports.getPendingCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ status: 'Pending Approval' });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching pending customers:", error);
    res.status(500).json({ error: 'Failed to fetch pending customers' });
  }
};

// Approve customer
exports.approveCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
    res.status(200).json({ message: 'Customer approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve customer' });
  }
};

// Reject customer
exports.rejectCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });
    res.status(200).json({ message: 'Customer rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject customer' });
  }
};

