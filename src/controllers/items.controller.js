const itemsService = require('../services/items.service');

class ItemsController {
  async createItem(req, res) {
    try {
      const { companyId, name, description } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      const item = await itemsService.createItem(companyId, name, description);
      res.status(201).json({
        item,
        qrUrl: `https://yourdomain.com/scan/${item.serialNumber}`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createBulkItems(req, res) {
    try {
      const { companyId, count } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      if (!count || count < 1 || count > 100) {
        return res.status(400).json({ error: 'Count must be between 1 and 100' });
      }

      const serialNumbers = await itemsService.createBulkItems(companyId, count);
      res.status(201).json({
        serialNumbers,
        qrUrls: serialNumbers.map(serial => `https://yourdomain.com/scan/${serial}`),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getItemsByCompany(req, res) {
    try {
      const { companyId } = req.params;
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }
      const items = await itemsService.getItemsByCompany(companyId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getItemBySerial(req, res) {
    try {
      const { serial } = req.params;
      const item = await itemsService.getItemBySerial(serial);
      res.json(item);
    } catch (error) {
      if (error.message === 'Item not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getMyItems(req, res) {
    try {
      const ownerId = req.user.userId;
      const items = await itemsService.getItemsByOwner(ownerId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async assignItem(req, res) {
    try {
      const { serialNumber } = req.body;
      const ownerId = req.user.userId;

      if (!serialNumber) {
        return res.status(400).json({ error: 'Serial number is required' });
      }

      const item = await itemsService.assignItemToOwner(serialNumber, ownerId);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async scanItem(req, res) {
    try {
      const { serial } = req.params;
      const scannedBy = req.user ? req.user.userId : null;
      const location = req.body && req.body.location ? req.body.location : null;

      const scanResult = await itemsService.scanItem(serial, scannedBy, location);
      res.json(scanResult);
    } catch (error) {
      if (error.message === 'Item not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const notifications = await itemsService.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async markNotificationRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      const notification = await itemsService.markNotificationAsRead(notificationId, userId);
      res.json(notification);
    } catch (error) {
      if (error.message === 'Notification not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ItemsController();