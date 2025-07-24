---
id: "jwt-auth-express"
name: "JWT Authentication for Express"
description: "Complete JWT authentication implementation with refresh tokens"
category: "auth"
frameworks: ["express", "nodejs"]
dependencies: 
  - package: "jsonwebtoken"
    version: "^9.0.0"
  - package: "bcryptjs"
    version: "^2.4.3"
  - package: "express-validator"
    version: "^7.0.0"
  - package: "dotenv"
    version: "^16.0.0"
tags: ["jwt", "authentication", "security", "express", "refresh-token", "middleware"]
testTemplate: "jwt-auth-testing"
conflicts: ["basic-auth-express", "oauth-express"]
mergeStrategy: "merge"
targetFiles:
  - path: "src/middleware/auth.js"
    type: "new"
  - path: "src/controllers/authController.js"
    type: "new"
  - path: "src/routes/auth.js"
    type: "new"
  - path: "src/app.js"
    type: "modify"
    section: "middleware"
  - path: ".env"
    type: "modify"
    section: "auth"
---

## Overview

This template provides a complete JWT authentication system with:
- User registration and login
- Access tokens and refresh tokens
- Password hashing with bcrypt
- Input validation
- Protected route middleware
- Token refresh endpoint

## Code

### Environment Variables (.env)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
BCRYPT_ROUNDS=10
```

### Auth Middleware (middleware/auth.js)
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authMiddleware;
```

### Auth Controller (controllers/authController.js)
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email); // Implement this based on your DB
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

    // Create user in database
    const user = await createUser({
      email,
      password: hashedPassword,
      name
    }); // Implement this based on your DB

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in database
    await storeRefreshToken(user.id, refreshToken); // Implement this

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user from database
    const user = await getUserByEmail(email); // Implement this
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken); // Implement this

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in database
    const storedToken = await getRefreshToken(decoded.userId, refreshToken); // Implement this
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId);

    // Update refresh token in database
    await updateRefreshToken(decoded.userId, refreshToken, tokens.refreshToken); // Implement this

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      await removeRefreshToken(req.userId, refreshToken); // Implement this
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
```

### Auth Routes (routes/auth.js)
```javascript
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

// Protected route example
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.userId); // Implement this
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
```

### Main App Integration (app.js)
```javascript
const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Usage

1. Install dependencies:
   ```bash
   npm install express jsonwebtoken bcryptjs express-validator dotenv
   ```

2. Create `.env` file with your secret keys

3. Implement the database functions mentioned in comments:
   - `getUserByEmail(email)`
   - `getUserById(id)`
   - `createUser(userData)`
   - `storeRefreshToken(userId, token)`
   - `getRefreshToken(userId, token)`
   - `updateRefreshToken(userId, oldToken, newToken)`
   - `removeRefreshToken(userId, token)`

4. Add the auth routes to your Express app

5. Use `authMiddleware` to protect routes that require authentication

## Configuration

### Security Best Practices
- Use strong, unique JWT secrets
- Store secrets in environment variables
- Set appropriate token expiration times
- Implement rate limiting for auth endpoints
- Use HTTPS in production
- Consider implementing account lockout after failed attempts

### Token Storage (Client-side)
- Store access token in memory or secure storage
- Store refresh token in httpOnly cookie or secure storage
- Never store tokens in localStorage for sensitive applications

## Example

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "Prometheus Doe"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Access protected route:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh token:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```