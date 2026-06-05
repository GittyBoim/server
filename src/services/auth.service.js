require('dotenv').config();
const prisma = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registerUser(userData) {
  const { name, email, password, phone } = userData;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Public registration only allows USER role
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'USER',
    },
  });
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  const { password: _, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, token };
}

async function createUserAsAdmin(userData) {
  const { name, email, password, phone, role = 'USER', companyId } = userData;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Validate that COMPANY role users have a company assigned
  if (role === 'COMPANY' && !companyId) {
    throw new Error('Company users must be assigned to a company');
  }
  
  // Validate company exists if companyId is provided
  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('Company not found');
    }
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user with specified role and company
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      companyId: companyId || null,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  const { password: _, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, token };
}

async function loginUser(credentials) {
  const { email, password } = credentials;
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, token };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  return userWithoutPassword;
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      companyId: true,
      createdAt: true,
    },
  });
  
  return users;
}

module.exports = {
  registerUser,
  createUserAsAdmin,
  loginUser,
  getCurrentUser,
  getAllUsers,
};
