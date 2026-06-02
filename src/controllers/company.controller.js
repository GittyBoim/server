const companyService = require('../services/company.service');

class CompanyController {
  async createCompany(req, res) {
    try {
      const { name, type, address, phone, email } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Company name is required' });
      }

      const company = await companyService.createCompany({
        name,
        type,
        address,
        phone,
        email,
      });

      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllCompanies(req, res) {
    try {
      const companies = await companyService.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCompanyById(req, res) {
    try {
      const companyId = req.params.id;
      const userId = req.user.userId;
      const userRole = req.user.role;
      const company = await companyService.getCompanyById(companyId, userId, userRole);
      res.json(company);
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createCompanyUser(req, res) {
    try {
      const companyId = req.params.id;
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const result = await companyService.createCompanyUser(companyId, {
        name,
        email,
        password,
        phone,
      });

      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'User already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CompanyController();
