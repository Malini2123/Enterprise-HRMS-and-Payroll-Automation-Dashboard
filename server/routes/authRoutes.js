const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many login attempts, please try again later.' }
});

router.post('/register', register);
router.post('/login', loginLimiter, login);

module.exports = router;