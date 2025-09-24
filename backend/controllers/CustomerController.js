// CustomerController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const validator = require('validator');

// ---------------------- REGISTER ----------------------
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 🔐 Validate input
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!validator.isMobilePhone(phone, 'any')) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Check duplicates
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Construct sanitized address
    const address = {
      line1: validator.escape(req.body['address.line1'] || ''),
      line2: validator.escape(req.body['address.line2'] || ''),
      city: validator.escape(req.body['address.city'] || ''),
      state: validator.escape(req.body['address.state'] || ''),
      postalCode: validator.escape(req.body['address.postalCode'] || '')
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure required files are uploaded
    if (!req.files?.nicIdImage || !req.files?.addressVerificationDoc) {
      return res.status(400).json({ error: 'NIC and Address documents are required' });
    }

    // Create customer
    const customer = new Customer({
      name: validator.escape(name),
      email,
      phone,
      password: hashedPassword,
      address,
      nicIdImage: req.files.nicIdImage[0].path.replace(/\\/g, '/'),
      addressVerificationDoc: req.files.addressVerificationDoc[0].path.replace(/\\/g, '/'),
      status: 'Pending Approval'
    });

    await customer.save();
    console.log("Customer registered:", customer._id);

    res.status(201).json({ message: 'Registration successful, pending approval' });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: 'Registration failed due to server error' });
  }
};

// ---------------------- LOGIN ----------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (customer.status !== 'Approved') {
      return res.status(403).json({ error: `Account is ${customer.status}` });
    }

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

// ---------------------- FETCH ALL CUSTOMERS ----------------------
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password -nicIdImage -addressVerificationDoc');
    res.status(200).json(customers);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
};

// ---------------------- DELETE CUSTOMER ----------------------
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// ---------------------- PENDING CUSTOMERS ----------------------
exports.getPendingCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ status: 'Pending Approval' }).select('-password -nicIdImage -addressVerificationDoc');
    res.status(200).json(customers);
  } catch (error) {
    console.error("Fetch pending customers error:", error);
    res.status(500).json({ error: 'Failed to fetch pending customers' });
  }
};

// ---------------------- APPROVE CUSTOMER ----------------------
exports.approveCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await Customer.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
    console.log(`Customer ${id} approved`);
    res.status(200).json({ message: 'Customer approved successfully' });
  } catch (error) {
    console.error("Approve customer error:", error);
    res.status(500).json({ error: 'Failed to approve customer' });
  }
};

// ---------------------- REJECT CUSTOMER ----------------------
exports.rejectCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await Customer.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });
    console.log(`Customer ${id} rejected`);
    res.status(200).json({ message: 'Customer rejected successfully' });
  } catch (error) {
    console.error("Reject customer error:", error);
    res.status(500).json({ error: 'Failed to reject customer' });
  }
};
