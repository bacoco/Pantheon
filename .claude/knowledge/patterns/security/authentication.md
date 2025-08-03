---
title: Authentication Patterns
category: Security Patterns
tags: [security, authentication, jwt, oauth, sessions]
created: 2024-01-15
updated: 2024-01-15
confidence: high
---

# Authentication Patterns

## Overview

Authentication verifies the identity of users accessing your system. This knowledge base entry covers modern authentication patterns, their implementations, and security considerations.

## Authentication Methods

### 1. JWT (JSON Web Tokens)

**When to Use**: Stateless microservices, mobile apps, SPAs

```javascript
// JWT Structure
// Header.Payload.Signature

// Implementation Example
const jwt = require('jsonwebtoken');

// Token Generation
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'your-app',
    audience: 'your-app-users'
  });
}

// Token Verification Middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'your-app',
      audience: 'your-app-users'
    });
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

**Security Considerations**:
- Store tokens securely (httpOnly cookies for web)
- Use short expiration times
- Implement refresh token rotation
- Never store sensitive data in payload

### 2. Session-Based Authentication

**When to Use**: Traditional web applications, when you need server-side control

```javascript
// Express Session Implementation
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true,
    maxAge: 1000 * 60 * 60, // 1 hour
    sameSite: 'strict'
  }
}));

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  req.session.userId = user.id;
  req.session.role = user.role;
  
  res.json({ message: 'Logged in successfully' });
});

// Auth Middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
```

### 3. OAuth 2.0 / Social Login

**When to Use**: Third-party integration, reducing password management

```javascript
// OAuth 2.0 with Passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT or create session
    const token = generateToken(req.user);
    res.redirect(`/dashboard?token=${token}`);
  }
);
```

### 4. Multi-Factor Authentication (MFA)

**When to Use**: High-security applications, compliance requirements

```javascript
// TOTP (Time-based One-Time Password) Implementation
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Setup MFA for User
async function setupMFA(userId) {
  const secret = speakeasy.generateSecret({
    name: `YourApp (${user.email})`,
    length: 32
  });
  
  // Save secret to user (encrypted)
  await User.updateOne(
    { _id: userId },
    { 
      $set: { 
        mfaSecret: encrypt(secret.base32),
        mfaEnabled: false
      }
    }
  );
  
  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode: qrCodeUrl
  };
}

// Verify MFA Token
function verifyMFAToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps for clock drift
  });
}

// Login with MFA
app.post('/login', async (req, res) => {
  const { email, password, mfaToken } = req.body;
  
  // First, verify password
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // If MFA is enabled, verify token
  if (user.mfaEnabled) {
    if (!mfaToken) {
      return res.status(200).json({ 
        requiresMFA: true,
        message: 'Please provide MFA token' 
      });
    }
    
    const secret = decrypt(user.mfaSecret);
    if (!verifyMFAToken(secret, mfaToken)) {
      return res.status(401).json({ error: 'Invalid MFA token' });
    }
  }
  
  // Generate session/token
  const token = generateToken(user);
  res.json({ token });
});
```

## Security Best Practices

### 1. Password Security

```javascript
const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');

// Password Hashing
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Password Strength Validation
function validatePasswordStrength(password) {
  const result = zxcvbn(password);
  
  if (result.score < 3) {
    return {
      valid: false,
      message: 'Password is too weak',
      suggestions: result.feedback.suggestions
    };
  }
  
  return { valid: true };
}

// Password Reset Flow
async function initiatePasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return { message: 'If account exists, reset email sent' };
  }
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = Date.now() + 3600000; // 1 hour
  
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        resetPasswordToken: hashToken(resetToken),
        resetPasswordExpires: resetExpires
      }
    }
  );
  
  await sendResetEmail(user.email, resetToken);
  return { message: 'If account exists, reset email sent' };
}
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Login rate limiting
const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'login_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Key generator based on IP + email
  keyGenerator: (req) => {
    return req.ip + ':' + req.body.email;
  }
});

app.post('/login', loginLimiter, loginHandler);
```

### 3. CSRF Protection

```javascript
const csrf = require('csurf');

// CSRF middleware
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// Apply to state-changing routes
app.use('/api', csrfProtection);

// Provide token to frontend
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### 4. Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Common Vulnerabilities

### 1. Session Fixation
**Prevention**: Regenerate session ID on login
```javascript
app.post('/login', (req, res) => {
  // ... validate credentials ...
  
  req.session.regenerate((err) => {
    if (err) return next(err);
    
    req.session.userId = user.id;
    res.json({ success: true });
  });
});
```

### 2. Timing Attacks
**Prevention**: Use constant-time comparison
```javascript
const crypto = require('crypto');

function secureCompare(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
```

### 3. Account Enumeration
**Prevention**: Same response for existing/non-existing accounts
```javascript
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Always perform password hashing even if user doesn't exist
  const user = await User.findOne({ email });
  const validPassword = user ? 
    await bcrypt.compare(password, user.password) : 
    await bcrypt.compare(password, '$2b$12$dummy.hash.to.prevent.timing');
  
  if (!user || !validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // ... proceed with login ...
});
```

## Testing Authentication

```javascript
// Jest test example
describe('Authentication', () => {
  test('successful login returns token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'validPassword' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.headers['set-cookie']).toBeDefined();
  });
  
  test('rate limiting blocks after 5 attempts', async () => {
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrong' });
      
      if (i < 5) {
        expect(response.status).toBe(401);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

## Compliance Considerations

- **GDPR**: Right to erasure, data portability
- **SOC2**: Audit logging, access controls
- **HIPAA**: Encryption at rest and in transit
- **PCI DSS**: No storage of sensitive auth data

## Related Knowledge

- [Authorization Patterns](./authorization.md)
- [API Security](./api-security.md)
- [Cryptography Basics](./cryptography.md)
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)