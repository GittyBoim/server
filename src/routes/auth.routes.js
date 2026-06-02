const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyTokenMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyTokenMiddleware, authController.getMe);
router.get('/users', verifyTokenMiddleware, requireRole('SUPER_ADMIN', 'COMPANY'), authController.getUsers);

module.exports = router;