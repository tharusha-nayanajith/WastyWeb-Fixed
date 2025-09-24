// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');

/**
 * Authentication middleware
 * - Verifies JWT using HS256 only
 * - Ensures customer exists and is approved
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'Access denied: No token provided' });
    }

    // Verify JWT safely (restrict algorithm)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch customer securely
    const customer = await Customer.findById(decoded.id).select('-password -__v');
    if (!customer) {
      return res.status(401).json({ error: 'Invalid token: User does not exist' });
    }

    // Check if account is approved
    if (customer.status !== 'Approved') {
      return res.status(403).json({ error: 'Access denied: Account not approved' });
    }

    // Attach to request
    req.customer = customer;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Role-based middleware
 * Usage: router.get('/admin', authMiddleware, roleRequired('admin'), handler)
 */
exports.roleRequired = (role) => {
  return (req, res, next) => {
    if (!req.customer || req.customer.role !== role) {
      return res.status(403).json({ error: `${role} privileges required` });
    }
    next();
  };
};
