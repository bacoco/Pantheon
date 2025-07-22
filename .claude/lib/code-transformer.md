# Code Transformer Library

You are working with BACO's Code Transformer, which converts HTML mockups into framework-specific components.

## ACTIVATION

When this library is invoked, you transform visual mockups into production-ready code.

## Core Purpose

The Code Transformer bridges the gap between design and implementation by:
1. Converting static HTML mockups into dynamic components
2. Adapting to different framework conventions
3. Maintaining design fidelity while adding functionality
4. Applying best practices for the target framework

## Transformation Patterns

### HTML to React

```javascript
// Input: Static HTML
<div class="card shadow-lg p-6">
  <h2 class="text-2xl font-bold mb-4">Welcome</h2>
  <p class="text-gray-600">Hello, user!</p>
  <button class="btn btn-primary mt-4">Get Started</button>
</div>

// Output: React Component
import React from 'react';

const WelcomeCard = ({ userName, onGetStarted }) => {
  return (
    <div className="card shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome</h2>
      <p className="text-gray-600">Hello, {userName}!</p>
      <button 
        className="btn btn-primary mt-4"
        onClick={onGetStarted}
      >
        Get Started
      </button>
    </div>
  );
};

export default WelcomeCard;
```

### HTML to Vue

```javascript
// Input: Same HTML

// Output: Vue Component
<template>
  <div class="card shadow-lg p-6">
    <h2 class="text-2xl font-bold mb-4">Welcome</h2>
    <p class="text-gray-600">Hello, {{ userName }}!</p>
    <button 
      class="btn btn-primary mt-4"
      @click="handleGetStarted"
    >
      Get Started
    </button>
  </div>
</template>

<script>
export default {
  name: 'WelcomeCard',
  props: {
    userName: {
      type: String,
      required: true
    }
  },
  methods: {
    handleGetStarted() {
      this.$emit('get-started');
    }
  }
}
</script>
```

### HTML to Angular

```typescript
// Input: Same HTML

// Output: Angular Component
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-welcome-card',
  template: `
    <div class="card shadow-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Welcome</h2>
      <p class="text-gray-600">Hello, {{ userName }}!</p>
      <button 
        class="btn btn-primary mt-4"
        (click)="onGetStarted.emit()"
      >
        Get Started
      </button>
    </div>
  `
})
export class WelcomeCardComponent {
  @Input() userName: string;
  @Output() onGetStarted = new EventEmitter<void>();
}
```

## Component Library Integration

### shadcn-ui Transformation

When transforming to use shadcn-ui components:

```javascript
// Input: Generic HTML
<button class="btn btn-primary">Click me</button>
<div class="card">Content</div>
<input type="text" class="input" placeholder="Enter text">

// Output: With shadcn-ui
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// In component:
<Button variant="default">Click me</Button>
<Card>
  <CardContent>Content</CardContent>
</Card>
<Input type="text" placeholder="Enter text" />
```

### Material-UI Transformation

```javascript
// Input: Same generic HTML

// Output: With Material-UI
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';

// In component:
<Button variant="contained" color="primary">Click me</Button>
<Card>Content</Card>
<TextField placeholder="Enter text" />
```

## Transformation Rules

### 1. State Identification

Analyze HTML for interactive elements and infer state needs:

```javascript
// Static elements → Props
<h1>Title</h1> → <h1>{title}</h1>

// Forms → State
<input type="text"> → const [value, setValue] = useState('');

// Repeated elements → Map over data
<li>Item 1</li>
<li>Item 2</li> → items.map(item => <li key={item.id}>{item.text}</li>)
```

### 2. Event Handler Detection

Convert onclick and other handlers to framework conventions:

```javascript
// HTML
<button onclick="doSomething()">Click</button>

// React
<button onClick={handleClick}>Click</button>

// Vue
<button @click="handleClick">Click</button>

// Angular
<button (click)="handleClick()">Click</button>
```

### 3. Class to ClassName (React)

```javascript
// Input
<div class="container flex">

// React Output
<div className="container flex">
```

### 4. Style Preservation

Maintain all styling while adapting syntax:

```javascript
// Input
<div style="color: red; margin-top: 20px;">

// React Output
<div style={{ color: 'red', marginTop: '20px' }}>

// Vue/Angular Output (unchanged)
<div style="color: red; margin-top: 20px;">
```

## Advanced Transformations

### Form Handling

```javascript
// Input: Static form
<form>
  <input type="text" name="email" placeholder="Email">
  <input type="password" name="password" placeholder="Password">
  <button type="submit">Login</button>
</form>

// React Output with hooks
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        name="email" 
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### List Rendering

```javascript
// Input: Static list
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Orange</li>
</ul>

// React Output
const FruitList = ({ fruits = ['Apple', 'Banana', 'Orange'] }) => {
  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
};
```

### Conditional Rendering

```javascript
// Detect patterns like hidden elements
// Input
<div class="error-message hidden">Error!</div>
<div class="success-message">Success!</div>

// React Output
{showError && (
  <div className="error-message">Error!</div>
)}
{showSuccess && (
  <div className="success-message">Success!</div>
)}
```

## Animation Support

### Adding Framer Motion (React)

```javascript
// Input: Static element
<div class="card fade-in">Content</div>

// Output: With Framer Motion
import { motion } from "framer-motion";

<motion.div 
  className="card"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### CSS Animations

Preserve and enhance CSS animations:

```javascript
// Input with CSS class
<div class="slide-up">Content</div>

// Ensure CSS is included
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}
```

## Framework Detection

Automatically detect target framework from context:

```javascript
function detectFramework(projectContext) {
  const { packageJson, files } = projectContext;
  
  if (packageJson.dependencies?.react) return 'react';
  if (packageJson.dependencies?.vue) return 'vue';
  if (packageJson.dependencies?.['@angular/core']) return 'angular';
  if (files.some(f => f.endsWith('.svelte'))) return 'svelte';
  
  return 'react'; // Default
}
```

## Accessibility Enhancement

Add accessibility attributes during transformation:

```javascript
// Input
<img src="logo.png">
<button>X</button>
<div onclick="...">Click me</div>

// Output
<img src="logo.png" alt="Company logo" />
<button aria-label="Close">X</button>
<button onClick={...}>Click me</button> // Convert div to semantic button
```

## TypeScript Support

Add type safety when target uses TypeScript:

```javascript
// Detect TypeScript usage
const useTypeScript = projectContext.files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'));

// Add interfaces
interface WelcomeCardProps {
  userName: string;
  onGetStarted: () => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, onGetStarted }) => {
  // Component implementation
};
```

## Usage Example

```javascript
// Transform mockup to React component
const transformed = await transformToComponent({
  html: mockupHTML,
  framework: 'react',
  componentName: 'HeroSection',
  useTypeScript: true,
  componentLibrary: 'shadcn-ui',
  addAnimations: true
});

// Result includes:
// - Component code
// - Required imports
// - CSS/styled components
// - Usage example
```

## Best Practices

1. **Preserve Design Intent**: Maintain visual fidelity
2. **Add Semantic HTML**: Improve accessibility
3. **Extract Reusable Parts**: Create sub-components
4. **Handle Edge Cases**: Empty states, loading, errors
5. **Document Props**: Add PropTypes or TypeScript interfaces
6. **Optimize Performance**: Use memoization where appropriate
7. **Follow Conventions**: Match project's coding style

## Error Handling

Always include error boundaries and fallbacks:

```javascript
// Add error handling to transformed components
try {
  return <TransformedComponent {...props} />;
} catch (error) {
  return <ErrorFallback error={error} />;
}
```

This transformer enables seamless transition from design to code while maintaining quality and best practices.