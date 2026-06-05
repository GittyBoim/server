require('dotenv').config();
const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function generateSerialNumber() {
  // Generate a UUID and take first 8 characters for a shorter, unique serial
  return 'QR-' + uuidv4().substring(0, 8).toUpperCase();
}

async function createItem(companyId, name, description) {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  const serialNumber = generateSerialNumber();
  
  const item = await prisma.item.create({
    data: {
      serialNumber,
      companyId,
      name,
      description,
    },
  });
  
  return item;
}

async function createBulkItems(companyId, count, name, description) {
  
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  const items = [];
  for (let i = 0; i < count; i++) {
    const serialNumber = generateSerialNumber();
    items.push({
      serialNumber,
      companyId,
      name,
      description,
      status: 'UNASSIGNED',
    });
  }

  await prisma.item.createMany({
    data: items,
  });

  return items.map(item => item.serialNumber);
}

async function getItemBySerial(serialNumber) {
  console.log('Items service: getItemBySerial called with:', serialNumber);
  console.log('Items service: About to query database...');
  try {
    const item = await prisma.item.findUnique({
      where: { serialNumber },
    });
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    return item;
  } catch (error) {
    throw error;
  }
}

async function getItemsByOwner(ownerId) {
  return await prisma.item.findMany({
    where: { ownerId },
  });
}

async function getItemsByCompany(companyId) {
  return await prisma.item.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  });
}

async function assignItemToOwner(serialNumber, ownerId) {
  const item = await prisma.item.findUnique({
    where: { serialNumber },
  });
  
  if (!item) {
    throw new Error('Item not found');
  }
  
  if (item.ownerId) {
    throw new Error('Item already has an owner');
  }
  
  return await prisma.item.update({
    where: { serialNumber },
    data: { ownerId, status: 'ASSIGNED' },
  });
}

async function scanItem(serialNumber, scannedBy = null, location = null) {
  // Find the item
  const item = await prisma.item.findUnique({
    where: { serialNumber },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  
  if (!item) {
    throw new Error('Item not found');
  }
  
  // Create scan record
  const scan = await prisma.scan.create({
    data: {
      itemId: item.id,
      scannedBy,
      location,
    },
  });
  
  // Create notification for the owner if item has one
  if (item.owner) {
    await prisma.notification.create({
      data: {
        userId: item.owner.id,
        itemId: item.id,
        type: 'ITEM_FOUND',
        message: `Your item (Serial: ${item.serialNumber}) was scanned${location ? ` at ${location}` : ''}. Someone may have found it!`,
      },
    });
  }
  
  // Return scan result with item and owner info
  return {
    item: {
      id: item.id,
      serialNumber: item.serialNumber,
      name: item.name,
      description: item.description,
      status: item.status,
    },
    owner: item.owner ? {
      id: item.owner.id,
      name: item.owner.name,
      email: item.owner.email,
      phone: item.owner.phone,
    } : null,
    scan: {
      id: scan.id,
      scannedAt: scan.scannedAt,
      location: scan.location,
    },
    message: item.owner 
      ? `This item belongs to ${item.owner.name}. Contact them to return it.`
      : 'This item is not assigned to anyone yet.',
  };
}

async function getNotificationsByUser(userId) {
  return await prisma.notification.findMany({
    where: { userId },
    include: {
      item: {
        select: {
          id: true,
          serialNumber: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function markNotificationAsRead(notificationId, userId) {
  const notification = await prisma.notification.findFirst({
    where: { 
      id: notificationId,
      userId: userId,
    },
  });
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

module.exports = {
  createItem,
  createBulkItems,
  getItemBySerial,
  getItemsByOwner,
  assignItemToOwner,
  scanItem,
  getNotificationsByUser,
  markNotificationAsRead,
  getItemsByCompany,
};
