// backend/middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

// 8 login attempts per minute per IP
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 8, // limit each IP to 8 requests per windowMs
    message: { error: "Too many login attempts from this IP, please try again after a minute." },
    standardHeaders: true,
    legacyHeaders: false
});

// 3 registrations per minute per IP
const registerLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 8,
    message: { error: "Too many registration attempts from this IP, please try again after a minute." },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { loginLimiter, registerLimiter };
