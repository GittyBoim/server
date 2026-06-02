const express = require('express');
const companyController = require('../controllers/company.controller');
const { verifyTokenMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// SUPER_ADMIN only: Create a company
router.post('/', verifyTokenMiddleware, requireRole('SUPER_ADMIN'), companyController.createCompany);

// SUPER_ADMIN only: Get all companies
router.get('/', verifyTokenMiddleware, requireRole('SUPER_ADMIN'), companyController.getAllCompanies);

// SUPER_ADMIN or COMPANY user: Get specific company
router.get('/:id', verifyTokenMiddleware, requireRole('COMPANY', 'SUPER_ADMIN'), companyController.getCompanyById);

// SUPER_ADMIN only: Create a company user
router.post('/:id/users', verifyTokenMiddleware, requireRole('SUPER_ADMIN'), companyController.createCompanyUser);

module.exports = router;
