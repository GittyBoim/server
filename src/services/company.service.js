const prisma = require('../config/database');
const authService = require('./auth.service');

async function createCompany({ name, type = 'BUSINESS', address, phone, email }) {
  if (!name) {
    throw new Error('Company name is required');
  }

  const company = await prisma.company.create({
    data: {
      name,
      type,
      address,
      phone,
      email,
    },
  });

  return company;
}

async function getAllCompanies() {
  const companies = await prisma.company.findMany({
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      items: true,
      subscriptions: true,
    },
  });

  return companies;
}

async function getCompanyById(companyId, userId, userRole) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      items: true,
      subscriptions: true,
    },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  // SUPER_ADMIN can view any company
  if (userRole === 'SUPER_ADMIN') {
    return company;
  }

  // COMPANY users can only view their own company
  if (userRole === 'COMPANY') {
    const userCompany = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (userCompany?.companyId !== companyId) {
      throw new Error('Forbidden: not authorized to view this company');
    }

    return company;
  }

  throw new Error('Forbidden: not authorized to view this company');
}

async function createCompanyUser(companyId, userData) {
  // Verify company exists
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  // Use the admin user creation method with COMPANY role and companyId
  const result = await authService.createUserAsAdmin({
    ...userData,
    role: 'COMPANY',
    companyId,
  });

  return result;
}

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  createCompanyUser,
};
