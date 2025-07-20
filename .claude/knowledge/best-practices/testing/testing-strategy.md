---
title: Comprehensive Testing Strategy
category: Testing Best Practices
tags: [testing, quality, tdd, bdd, automation]
created: 2024-01-15
updated: 2024-01-15
confidence: high
---

# Comprehensive Testing Strategy

## Testing Pyramid

The testing pyramid guides the distribution of test types:

```
         /\
        /  \  E2E Tests (5-10%)
       /----\
      /      \  Integration Tests (20-30%)
     /--------\
    /          \  Unit Tests (60-70%)
   /____________\
```

## Test Types and When to Use Them

### 1. Unit Tests

**Purpose**: Test individual functions, methods, or components in isolation

**Characteristics**:
- Fast execution (milliseconds)
- No external dependencies
- High code coverage
- Easy to maintain

```javascript
// Example: Testing a utility function
describe('calculateDiscount', () => {
  test('applies percentage discount correctly', () => {
    expect(calculateDiscount(100, 0.2)).toBe(80);
  });
  
  test('handles zero discount', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });
  
  test('throws error for negative prices', () => {
    expect(() => calculateDiscount(-100, 0.2)).toThrow('Invalid price');
  });
  
  test('caps discount at 100%', () => {
    expect(calculateDiscount(100, 1.5)).toBe(0);
  });
});

// Example: Testing a React component
describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Integration Tests

**Purpose**: Test interaction between multiple components or modules

**Characteristics**:
- Moderate execution time
- May use test doubles for external services
- Tests data flow and contracts
- Catches interface issues

```javascript
// Example: Testing API endpoint with database
describe('POST /api/users', () => {
  beforeEach(async () => {
    await db.clear();
    await db.seed();
  });
  
  test('creates user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePass123!'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: userData.email,
      name: userData.name
    });
    expect(response.body).not.toHaveProperty('password');
    
    // Verify database state
    const user = await db.users.findOne({ email: userData.email });
    expect(user).toBeTruthy();
    expect(user.password).not.toBe(userData.password); // Should be hashed
  });
  
  test('rejects duplicate emails', async () => {
    await db.users.create({ email: 'existing@example.com' });
    
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'existing@example.com',
        name: 'Another User',
        password: 'Password123!'
      });
    
    expect(response.status).toBe(409);
    expect(response.body.error).toContain('already exists');
  });
});

// Example: Testing service integration
describe('EmailService', () => {
  let emailService;
  let mockSmtpClient;
  
  beforeEach(() => {
    mockSmtpClient = {
      send: jest.fn().mockResolvedValue({ messageId: '123' })
    };
    emailService = new EmailService(mockSmtpClient);
  });
  
  test('sends welcome email with correct template', async () => {
    const user = { email: 'new@example.com', name: 'New User' };
    
    await emailService.sendWelcomeEmail(user);
    
    expect(mockSmtpClient.send).toHaveBeenCalledWith({
      to: user.email,
      subject: 'Welcome to Our App',
      template: 'welcome',
      data: { name: user.name }
    });
  });
  
  test('retries on temporary failure', async () => {
    mockSmtpClient.send
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({ messageId: '123' });
    
    const result = await emailService.sendWelcomeEmail({
      email: 'retry@example.com',
      name: 'Retry User'
    });
    
    expect(mockSmtpClient.send).toHaveBeenCalledTimes(2);
    expect(result.messageId).toBe('123');
  });
});
```

### 3. End-to-End (E2E) Tests

**Purpose**: Test complete user workflows through the entire system

**Characteristics**:
- Slow execution (seconds to minutes)
- Tests real user scenarios
- Uses real browsers and services
- Catches system-wide issues

```javascript
// Example: E2E test with Playwright
describe('User Registration Flow', () => {
  test('new user can register and access dashboard', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[name="email"]', 'e2e-test@example.com');
    await page.fill('[name="name"]', 'E2E Test User');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.fill('[name="confirmPassword"]', 'SecurePassword123!');
    
    // Accept terms
    await page.check('[name="acceptTerms"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Verify welcome message
    await expect(page.locator('h1')).toContainText('Welcome, E2E Test User');
    
    // Verify email verification notice
    await expect(page.locator('.alert-info')).toContainText(
      'Please verify your email'
    );
    
    // Can access profile
    await page.click('a[href="/profile"]');
    await expect(page.locator('[name="email"]')).toHaveValue(
      'e2e-test@example.com'
    );
  });
  
  test('prevents access to protected routes when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login?redirect=/dashboard');
    
    // Should show message
    await expect(page.locator('.alert-warning')).toContainText(
      'Please log in to continue'
    );
  });
});
```

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

```javascript
// Step 1: Red - Write failing test
describe('ShoppingCart', () => {
  test('calculates total with tax', () => {
    const cart = new ShoppingCart();
    cart.addItem({ price: 100, quantity: 2 });
    cart.addItem({ price: 50, quantity: 1 });
    
    expect(cart.getTotalWithTax(0.08)).toBe(270); // 250 + 20 tax
  });
});

// Step 2: Green - Minimal implementation
class ShoppingCart {
  constructor() {
    this.items = [];
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  getTotalWithTax(taxRate) {
    const subtotal = this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    return subtotal + (subtotal * taxRate);
  }
}

// Step 3: Refactor - Improve design
class ShoppingCart {
  constructor() {
    this.items = [];
  }
  
  addItem(item) {
    this.items.push(new CartItem(item));
  }
  
  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.getTotal(), 0);
  }
  
  getTax(rate) {
    return this.getSubtotal() * rate;
  }
  
  getTotalWithTax(taxRate) {
    return this.getSubtotal() + this.getTax(taxRate);
  }
}

class CartItem {
  constructor({ price, quantity }) {
    this.price = price;
    this.quantity = quantity;
  }
  
  getTotal() {
    return this.price * this.quantity;
  }
}
```

## Testing Best Practices

### 1. Test Naming Conventions

```javascript
// Good test names are descriptive and follow a pattern
describe('UserService', () => {
  describe('createUser', () => {
    test('successfully creates user with valid data', () => {});
    test('throws ValidationError when email is invalid', () => {});
    test('throws DuplicateError when email already exists', () => {});
    test('hashes password before storing', () => {});
    test('sends welcome email after creation', () => {});
  });
});

// Use "should" pattern for BDD style
describe('ShoppingCart', () => {
  it('should calculate correct total for multiple items', () => {});
  it('should apply discount codes correctly', () => {});
  it('should handle empty cart gracefully', () => {});
});
```

### 2. Test Organization

```javascript
// Arrange-Act-Assert (AAA) Pattern
test('applies discount to cart total', () => {
  // Arrange
  const cart = new ShoppingCart();
  cart.addItem({ id: 1, price: 100 });
  cart.addItem({ id: 2, price: 50 });
  const discountCode = new DiscountCode('SAVE20', 0.2);
  
  // Act
  const total = cart.getTotalWithDiscount(discountCode);
  
  // Assert
  expect(total).toBe(120); // 150 - 30 (20% discount)
});

// Given-When-Then Pattern (BDD)
test('user login flow', () => {
  // Given a registered user
  const user = createTestUser({ email: 'test@example.com' });
  
  // When they attempt to login with correct credentials
  const result = authService.login('test@example.com', 'password123');
  
  // Then they should receive a valid token
  expect(result.token).toBeDefined();
  expect(result.expiresIn).toBe(3600);
});
```

### 3. Test Data Management

```javascript
// Test Data Builders
class UserBuilder {
  constructor() {
    this.user = {
      id: uuid(),
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      role: 'user',
      createdAt: new Date()
    };
  }
  
  withEmail(email) {
    this.user.email = email;
    return this;
  }
  
  withRole(role) {
    this.user.role = role;
    return this;
  }
  
  asAdmin() {
    this.user.role = 'admin';
    return this;
  }
  
  build() {
    return { ...this.user };
  }
}

// Usage
test('admin can delete users', () => {
  const admin = new UserBuilder().asAdmin().build();
  const targetUser = new UserBuilder().build();
  
  const result = userService.deleteUser(targetUser.id, admin);
  expect(result.success).toBe(true);
});

// Fixtures
const fixtures = {
  users: {
    admin: {
      id: '1',
      email: 'admin@example.com',
      role: 'admin'
    },
    regular: {
      id: '2',
      email: 'user@example.com',
      role: 'user'
    }
  },
  products: {
    laptop: {
      id: '101',
      name: 'Laptop',
      price: 999.99,
      category: 'electronics'
    }
  }
};
```

### 4. Mocking Strategies

```javascript
// Mock External Services
jest.mock('../services/EmailService');

test('sends notification on order completion', async () => {
  const mockSend = jest.fn().mockResolvedValue(true);
  EmailService.prototype.send = mockSend;
  
  await orderService.completeOrder(orderId);
  
  expect(mockSend).toHaveBeenCalledWith({
    to: expect.any(String),
    template: 'order-confirmation',
    data: expect.objectContaining({
      orderId,
      total: expect.any(Number)
    })
  });
});

// Spy on Methods
test('caches user data after fetch', async () => {
  const cacheSpy = jest.spyOn(cache, 'set');
  
  await userService.getUser(userId);
  await userService.getUser(userId); // Second call
  
  expect(cacheSpy).toHaveBeenCalledTimes(1);
  expect(fetchUserFromDB).toHaveBeenCalledTimes(1);
});

// Mock Time
test('token expires after 1 hour', () => {
  jest.useFakeTimers();
  const token = authService.generateToken(user);
  
  expect(authService.isValidToken(token)).toBe(true);
  
  jest.advanceTimersByTime(3600001); // 1 hour + 1ms
  
  expect(authService.isValidToken(token)).toBe(false);
  jest.useRealTimers();
});
```

### 5. Continuous Integration Testing

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost/testdb
          
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Performance Testing

```javascript
// Performance benchmarks
describe('Performance', () => {
  test('processes 1000 orders in under 1 second', async () => {
    const orders = generateOrders(1000);
    
    const start = performance.now();
    await orderProcessor.processBatch(orders);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });
  
  test('maintains sub-100ms response time under load', async () => {
    const responses = await Promise.all(
      Array(100).fill(null).map(() => 
        measureResponseTime(() => api.get('/products'))
      )
    );
    
    const avgResponseTime = average(responses);
    expect(avgResponseTime).toBeLessThan(100);
  });
});
```

## Testing Anti-Patterns to Avoid

1. **Testing Implementation Details**: Test behavior, not implementation
2. **Excessive Mocking**: Can lead to false confidence
3. **Ignoring Test Failures**: Never skip or disable failing tests
4. **Not Testing Error Cases**: Happy path only is insufficient
5. **Shared Test State**: Tests should be independent

## Related Knowledge

- [Test Automation Frameworks](./test-frameworks.md)
- [CI/CD Best Practices](../deployment/ci-cd.md)
- [Performance Testing Guide](./performance-testing.md)
- [Security Testing](../../patterns/security/security-testing.md)