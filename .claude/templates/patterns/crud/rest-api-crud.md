---
name: "REST API CRUD Operations"
description: "Complete CRUD implementation with validation, error handling, and pagination"
category: "crud"
frameworks: ["express", "nodejs"]
dependencies: 
  - package: "express"
    version: "^4.18.0"
  - package: "express-validator"
    version: "^7.0.0"
  - package: "mongoose"
    version: "^7.0.0"
tags: ["crud", "rest", "api", "mongoose", "validation", "pagination"]
---

## Overview

This template provides a complete CRUD (Create, Read, Update, Delete) implementation with:
- RESTful API endpoints
- Input validation
- Error handling
- Pagination and filtering
- Soft delete option
- Bulk operations
- Search functionality

## Code

### Model Example (models/Item.js)
```javascript
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'food', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ deleted: 1 });

// Virtual for formatted price
itemSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Pre-save middleware
itemSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

// Instance methods
itemSchema.methods.softDelete = function(userId) {
  this.deleted = true;
  this.deletedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

itemSchema.methods.restore = function(userId) {
  this.deleted = false;
  this.deletedAt = undefined;
  this.updatedBy = userId;
  return this.save();
};

// Static methods
itemSchema.statics.findActive = function() {
  return this.find({ deleted: false });
};

module.exports = mongoose.model('Item', itemSchema);
```

### Controller (controllers/itemController.js)
```javascript
const Item = require('../models/Item');
const { validationResult } = require('express-validator');

// Helper function for pagination
const getPaginationData = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

// CREATE - Create new item
const createItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const itemData = {
      ...req.body,
      createdBy: req.userId, // From auth middleware
      updatedBy: req.userId
    };

    const item = new Item(itemData);
    await item.save();

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create item'
    });
  }
};

// READ - Get all items with pagination and filtering
const getItems = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query.page, req.query.limit);
    const { category, status, search, sort = '-createdAt' } = req.query;

    // Build query
    const query = { deleted: false };
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const [items, total] = await Promise.all([
      Item.find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email'),
      Item.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items'
    });
  }
};

// READ - Get single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      deleted: false
    })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item'
    });
  }
};

// UPDATE - Update item
const updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        deleted: false
      },
      {
        ...req.body,
        updatedBy: req.userId
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update item'
    });
  }
};

// DELETE - Soft delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      deleted: false
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    await item.softDelete(req.userId);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete item'
    });
  }
};

// BULK - Bulk delete items
const bulkDeleteItems = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of IDs'
      });
    }

    const result = await Item.updateMany(
      {
        _id: { $in: ids },
        deleted: false
      },
      {
        deleted: true,
        deletedAt: new Date(),
        updatedBy: req.userId
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} items deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete items'
    });
  }
};

// RESTORE - Restore soft deleted item
const restoreItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      deleted: true
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Deleted item not found'
      });
    }

    await item.restore(req.userId);

    res.json({
      success: true,
      data: item,
      message: 'Item restored successfully'
    });
  } catch (error) {
    console.error('Restore item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore item'
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  bulkDeleteItems,
  restoreItem
};
```

### Routes (routes/items.js)
```javascript
const express = require('express');
const { body, param, query } = require('express-validator');
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateItem = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
  body('description').optional().trim()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['electronics', 'clothing', 'food', 'other'])
    .withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['active', 'inactive', 'draft'])
    .withMessage('Invalid status')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes
router.use(authMiddleware); // Protect all routes

router.get('/', validatePagination, itemController.getItems);
router.get('/:id', validateId, itemController.getItemById);
router.post('/', validateItem, itemController.createItem);
router.put('/:id', validateId, validateItem, itemController.updateItem);
router.delete('/:id', validateId, itemController.deleteItem);
router.post('/bulk-delete', itemController.bulkDeleteItems);
router.post('/:id/restore', validateId, itemController.restoreItem);

module.exports = router;
```

### Error Handler Middleware (middleware/errorHandler.js)
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
};

module.exports = errorHandler;
```

## Usage

1. Install dependencies:
   ```bash
   npm install express mongoose express-validator
   ```

2. Set up MongoDB connection:
   ```javascript
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI);
   ```

3. Add routes to your Express app:
   ```javascript
   const itemRoutes = require('./routes/items');
   app.use('/api/items', itemRoutes);
   ```

4. Add error handler middleware at the end:
   ```javascript
   app.use(errorHandler);
   ```

## Configuration

### Database Indexes
Create indexes for better performance:
```javascript
// In MongoDB shell or using Mongoose
db.items.createIndex({ name: "text", description: "text" });
db.items.createIndex({ category: 1, status: 1 });
db.items.createIndex({ deleted: 1 });
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/your-database
NODE_ENV=development
```

## Example

### Create item:
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "description": "16-inch laptop",
    "price": 2499.99,
    "category": "electronics",
    "tags": ["laptop", "apple", "professional"]
  }'
```

### Get items with pagination and filtering:
```bash
curl "http://localhost:3000/api/items?page=1&limit=10&category=electronics&sort=-price" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update item:
```bash
curl -X PUT http://localhost:3000/api/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2299.99,
    "status": "inactive"
  }'
```

### Bulk delete:
```bash
curl -X POST http://localhost:3000/api/items/bulk-delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["ID1", "ID2", "ID3"]
  }'
```