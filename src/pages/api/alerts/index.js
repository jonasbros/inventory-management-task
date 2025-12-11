import fs from 'fs';
import path from 'path';

const alertsFilePath = path.join(process.cwd(), 'data', 'alerts.json');

function ensureAlertsFile() {
  if (!fs.existsSync(alertsFilePath)) {
    const initialData = [];
    fs.writeFileSync(alertsFilePath, JSON.stringify(initialData, null, 2));
  }
}

function readAlerts() {
  ensureAlertsFile();
  const data = fs.readFileSync(alertsFilePath, 'utf8');
  return JSON.parse(data);
}

function writeAlerts(alerts) {
  ensureAlertsFile();
  fs.writeFileSync(alertsFilePath, JSON.stringify(alerts, null, 2));
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const alerts = readAlerts();
      res.status(200).json(alerts);
    } catch (error) {
      console.error('Error reading alerts:', error);
      res.status(500).json({ error: 'Failed to read alerts' });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, alertType, action, notes, dismissedUntil } = req.body;

      // Validate required fields
      if (!productId || !alertType || !action) {
        return res.status(400).json({ 
          error: 'Missing required fields: productId, alertType, action' 
        });
      }

      // Validate action type
      const validActions = ['acknowledged', 'resolved', 'dismissed'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ 
          error: 'Invalid action. Must be: acknowledged, resolved, or dismissed' 
        });
      }

      const alerts = readAlerts();
      
      // Check if alert action already exists for this product/type combination
      const existingIndex = alerts.findIndex(a => 
        a.productId === productId && a.alertType === alertType && a.status !== 'resolved'
      );

      const alertAction = {
        id: generateId(),
        productId,
        alertType,
        status: action,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add dismissedUntil for dismissed alerts
      if (action === 'dismissed' && dismissedUntil) {
        alertAction.dismissedUntil = dismissedUntil;
      }

      if (existingIndex >= 0) {
        // Update existing alert action
        alerts[existingIndex] = {
          ...alerts[existingIndex],
          ...alertAction,
          id: alerts[existingIndex].id, // Keep original ID
          createdAt: alerts[existingIndex].createdAt // Keep original creation date
        };
      } else {
        // Add new alert action
        alerts.push(alertAction);
      }

      writeAlerts(alerts);
      res.status(201).json(alertAction);
    } catch (error) {
      console.error('Error creating alert action:', error);
      res.status(500).json({ error: 'Failed to create alert action' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { productId, alertType } = req.query;

      if (!productId || !alertType) {
        return res.status(400).json({ 
          error: 'Missing required query parameters: productId, alertType' 
        });
      }

      const alerts = readAlerts();
      const filteredAlerts = alerts.filter(a => 
        !(a.productId === parseInt(productId) && a.alertType === alertType)
      );

      writeAlerts(filteredAlerts);
      res.status(200).json({ message: 'Alert action deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert action:', error);
      res.status(500).json({ error: 'Failed to delete alert action' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}