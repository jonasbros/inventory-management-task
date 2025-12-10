import fs from 'fs';
import path from 'path';

const transfersFilePath = path.join(process.cwd(), 'data', 'transfers.json');

function ensureTransfersFile() {
  if (!fs.existsSync(transfersFilePath)) {
    const initialData = [];
    fs.writeFileSync(transfersFilePath, JSON.stringify(initialData, null, 2));
  }
}

function readTransfers() {
  ensureTransfersFile();
  const data = fs.readFileSync(transfersFilePath, 'utf8');
  return JSON.parse(data);
}

function writeTransfers(transfers) {
  ensureTransfersFile();
  fs.writeFileSync(transfersFilePath, JSON.stringify(transfers, null, 2));
}

function readStock() {
  const stockFilePath = path.join(process.cwd(), 'data', 'stock.json');
  const data = fs.readFileSync(stockFilePath, 'utf8');
  return JSON.parse(data);
}

function writeStock(stock) {
  const stockFilePath = path.join(process.cwd(), 'data', 'stock.json');
  fs.writeFileSync(stockFilePath, JSON.stringify(stock, null, 2));
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const transfers = readTransfers();
      res.status(200).json(transfers);
    } catch (error) {
      console.error('Error reading transfers:', error);
      res.status(500).json({ error: 'Failed to read transfers' });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = req.body;

      if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (fromWarehouseId === toWarehouseId) {
        return res.status(400).json({ error: 'Source and destination warehouses cannot be the same' });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than 0' });
      }

      const stock = readStock();
      
      const fromStockRecord = stock.find(s => 
        s.productId === productId && s.warehouseId === fromWarehouseId
      );

      if (!fromStockRecord) {
        return res.status(404).json({ error: 'Product not found in source warehouse' });
      }

      if (fromStockRecord.quantity < quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${fromStockRecord.quantity}, Requested: ${quantity}` 
        });
      }

      const toStockRecord = stock.find(s => 
        s.productId === productId && s.warehouseId === toWarehouseId
      );

      fromStockRecord.quantity -= quantity;

      if (toStockRecord) {
        toStockRecord.quantity += quantity;
      } else {
        stock.push({
          id: generateId(),
          productId,
          warehouseId: toWarehouseId,
          quantity,
          minThreshold: 10,
          maxThreshold: 1000
        });
      }

      writeStock(stock);

      const transfers = readTransfers();
      const newTransfer = {
        id: generateId(),
        productId,
        fromWarehouseId,
        toWarehouseId,
        quantity,
        notes: notes || '',
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      transfers.push(newTransfer);
      writeTransfers(transfers);

      res.status(201).json(newTransfer);
    } catch (error) {
      console.error('Error creating transfer:', error);
      res.status(500).json({ error: 'Failed to create transfer' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}