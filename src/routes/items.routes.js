const express = require('express');
const itemsController = require('../controllers/items.controller');
const { verifyTokenMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes (must come before public parameterized routes)
router.post('/create', verifyTokenMiddleware, requireRole('COMPANY', 'SUPER_ADMIN'), itemsController.createItem);
router.post('/bulk', verifyTokenMiddleware, requireRole('COMPANY'), itemsController.createBulkItems);
router.get('/my/items', verifyTokenMiddleware, itemsController.getMyItems);
// Company-level items
router.get('/company/:companyId', verifyTokenMiddleware, requireRole('COMPANY','SUPER_ADMIN'), itemsController.getItemsByCompany);
router.post('/assign', verifyTokenMiddleware, requireRole('USER'), itemsController.assignItem);
router.get('/notifications', verifyTokenMiddleware, itemsController.getNotifications);
router.put('/notifications/:notificationId/read', verifyTokenMiddleware, itemsController.markNotificationRead);

// Public routes
router.get('/scan/:serial', itemsController.scanItem);
router.get('/:serial', itemsController.getItemBySerial);

module.exports = router;