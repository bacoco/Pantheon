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

## Advanced Animation Support

Transform complex animations and interactions across frameworks:

### 1. Hover & Interactive States

```javascript
// Input: CSS hover effect
<div class="card hover-grow">Hover me</div>

// React with state
const InteractiveCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        cursor: 'pointer'
      }}
    >
      Hover me
    </div>
  );
};

// React with Framer Motion
<motion.div 
  className="card"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  Hover me
</motion.div>

// Vue equivalent
<template>
  <div 
    class="card"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :style="{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }"
  >
    Hover me
  </div>
</template>
```

### 2. Scroll-Triggered Animations

```javascript
// Input: Fade in on scroll
<div class="fade-in-scroll">Content appears on scroll</div>

// React with Intersection Observer
const ScrollReveal = ({ children, className }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);
  
  return (
    <div
      ref={domRef}
      className={`${className} ${isVisible ? 'visible' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
      }}
    >
      {children}
    </div>
  );
};
```

### 3. Staggered List Animations

```javascript
// Input: List with stagger effect
<ul class="stagger-list">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

// React with CSS delays
const StaggerList = ({ items }) => (
  <ul className="stagger-list">
    {items.map((item, index) => (
      <li 
        key={index}
        style={{
          animation: 'fadeInUp 0.5s ease-out forwards',
          animationDelay: `${index * 0.1}s`,
          opacity: 0
        }}
      >
        {item}
      </li>
    ))}
  </ul>
);

// Framer Motion version
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((text, i) => (
    <motion.li key={i} variants={item}>{text}</motion.li>
  ))}
</motion.ul>
```

### 4. Loading & Progress Animations

```javascript
// Input: Loading spinner
<div class="loading-spinner"></div>

// React component with keyframes
const Spinner = ({ size = 40, color = '#3498db' }) => (
  <div 
    className="spinner"
    style={{
      width: size,
      height: size,
      border: `3px solid #f3f3f3`,
      borderTop: `3px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}
  />
);

// CSS keyframes
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Progress bar with animation
const ProgressBar = ({ progress }) => (
  <div className="progress-container">
    <div 
      className="progress-bar"
      style={{
        width: `${progress}%`,
        transition: 'width 0.3s ease-out'
      }}
    />
  </div>
);
```

### 5. Page & Route Transitions

```javascript
// Input: Page with transition
<div class="page-content fade-page">Content</div>

// React Router with transitions
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        timeout={300}
        classNames="page"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

// CSS for transitions
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}
.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms ease-out;
}
.page-exit {
  opacity: 1;
  transform: translateX(0);
}
.page-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: all 300ms ease-out;
}
```

### 6. Gesture-Based Animations

```javascript
// Input: Swipeable card
<div class="swipe-card">Swipe me</div>

// React with touch handling
const SwipeCard = ({ onSwipe }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState(null);
  
  const handleTouchStart = (e) => {
    setStartPos({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };
  
  const handleTouchMove = (e) => {
    if (!startPos) return;
    
    const deltaX = e.touches[0].clientX - startPos.x;
    const deltaY = e.touches[0].clientY - startPos.y;
    
    setPosition({ x: deltaX, y: deltaY });
  };
  
  const handleTouchEnd = () => {
    if (Math.abs(position.x) > 100) {
      onSwipe(position.x > 0 ? 'right' : 'left');
    }
    setPosition({ x: 0, y: 0 });
    setStartPos(null);
  };
  
  return (
    <div
      className="swipe-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${position.x * 0.1}deg)`,
        transition: startPos ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      Swipe me
    </div>
  );
};
```

### 7. SVG Animations

```javascript
// Input: Animated SVG icon
<svg class="animated-icon">
  <path d="M10 20 L30 5 L50 20" />
</svg>

// React with animated SVG
const AnimatedIcon = ({ isActive }) => (
  <svg className="animated-icon" viewBox="0 0 60 40">
    <motion.path
      d={isActive ? "M10 20 L30 20 L50 20" : "M10 20 L30 5 L50 20"}
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      transition={{ duration: 0.3 }}
    />
  </svg>
);
```

### Animation Performance Tips

1. **Use CSS transforms** instead of position properties
2. **Leverage GPU acceleration** with `will-change` or `transform: translateZ(0)`
3. **Debounce scroll events** for scroll-triggered animations
4. **Use `requestAnimationFrame`** for smooth JS animations
5. **Lazy load** heavy animation libraries
6. **Reduce paint areas** by animating composite layers

### Animation Library Support

The transformer supports integration with:
- **Framer Motion** - Declarative React animations
- **React Spring** - Physics-based animations
- **GSAP** - Complex timeline animations
- **Lottie** - After Effects animations
- **AOS** - Animate on scroll
- **Anime.js** - Lightweight animation library
- **CSS Transitions** - Native browser animations

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