# Style Guide

> Design system and visual standards for [Project Name]

## Brand Identity

### Brand Values
- **Primary Value**: [e.g., "Professional", "Playful", "Innovative"]
- **Secondary Value**: [e.g., "Trustworthy", "Modern", "Accessible"]
- **Personality**: [e.g., "Friendly but authoritative"]

### Visual Principles
1. **Clarity**: [How we ensure clarity]
2. **Consistency**: [How we maintain consistency]
3. **Accessibility**: [Our accessibility commitment]
4. **Delight**: [How we add delight without distraction]

## Color Palette

### Primary Colors
```css
--primary-50:  #[lightest];
--primary-100: #[very-light];
--primary-200: #[light];
--primary-300: #[medium-light];
--primary-400: #[medium];
--primary-500: #[base];     /* Main brand color */
--primary-600: #[medium-dark];
--primary-700: #[dark];
--primary-800: #[very-dark];
--primary-900: #[darkest];
```

### Neutral Colors
```css
--gray-50:  #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Semantic Colors
```css
--success-500: #10b981;    /* Green */
--warning-500: #f59e0b;    /* Yellow */
--error-500:   #ef4444;    /* Red */
--info-500:    #3b82f6;    /* Blue */
```

### Color Usage Rules
- **Primary Action**: primary-500 (hover: primary-600)
- **Secondary Action**: gray-200 (hover: gray-300)
- **Destructive Action**: error-500 (hover: error-600)
- **Text on Light**: gray-900
- **Text on Dark**: white
- **Borders**: gray-200
- **Backgrounds**: gray-50, white

## Typography

### Font Stack
```css
--font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Type Scale
```css
--text-xs:   0.75rem;    /* 12px */
--text-sm:   0.875rem;   /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg:   1.125rem;   /* 18px */
--text-xl:   1.25rem;    /* 20px */
--text-2xl:  1.5rem;     /* 24px */
--text-3xl:  1.875rem;   /* 30px */
--text-4xl:  2.25rem;    /* 36px */
--text-5xl:  3rem;       /* 48px */
```

### Font Weights
```css
--font-normal:  400;
--font-medium:  500;
--font-semibold: 600;
--font-bold:    700;
```

### Line Heights
```css
--leading-tight:   1.25;
--leading-normal:  1.5;
--leading-relaxed: 1.75;
```

### Typography Rules
- **Headings**: font-semibold, tight line-height
- **Body**: font-normal, normal line-height
- **Small text**: Never below text-xs
- **Links**: primary-500, underline on hover
- **Code**: font-mono, gray-100 background

## Spacing System

### Base Unit
```css
--space-unit: 0.25rem;   /* 4px */
```

### Spacing Scale
```css
--space-0:   0;
--space-1:   0.25rem;    /* 4px */
--space-2:   0.5rem;     /* 8px */
--space-3:   0.75rem;    /* 12px */
--space-4:   1rem;       /* 16px */
--space-5:   1.25rem;    /* 20px */
--space-6:   1.5rem;     /* 24px */
--space-8:   2rem;       /* 32px */
--space-10:  2.5rem;     /* 40px */
--space-12:  3rem;       /* 48px */
--space-16:  4rem;       /* 64px */
--space-20:  5rem;       /* 80px */
--space-24:  6rem;       /* 96px */
```

### Spacing Rules
- **Component padding**: space-4 (default)
- **Section spacing**: space-8 to space-12
- **Inline spacing**: space-2 to space-3
- **Minimum touch target**: 44px (space-11)

## Layout

### Container Widths
```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
```

### Grid System
- **Columns**: 12-column grid
- **Gutters**: space-4 (mobile), space-6 (desktop)
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Layout Patterns
- **Page padding**: space-4 (mobile), space-8 (desktop)
- **Max content width**: container-xl
- **Card layouts**: Use grid with gap-4
- **Form layouts**: Single column (mobile), two column (desktop)

## Components

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
}

/* Size Variants */
.btn-sm { padding: var(--space-1) var(--space-3); }
.btn-lg { padding: var(--space-3) var(--space-6); }
```

### Form Elements
```css
/* Input */
.input {
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
}

/* Focus State */
.input:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Cards
```css
.card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}
```

## Visual Properties

### Border Radius
```css
--radius-none: 0;
--radius-sm:   0.125rem;  /* 2px */
--radius-md:   0.375rem;  /* 6px */
--radius-lg:   0.5rem;    /* 8px */
--radius-xl:   0.75rem;   /* 12px */
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Transitions
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

## States & Interactions

### Interactive States
1. **Default**: Base appearance
2. **Hover**: Subtle change (darker/lighter)
3. **Focus**: Clear outline (2px, primary-500)
4. **Active**: Pressed appearance
5. **Disabled**: 50% opacity, no pointer events

### Loading States
- **Skeleton screens**: Animated gray placeholders
- **Spinners**: For actions < 3 seconds
- **Progress bars**: For longer operations

### Error States
- **Field errors**: Red border, error message below
- **Form errors**: Alert box at top
- **System errors**: Modal or toast notification

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text
- **Focus indicators**: Always visible
- **Touch targets**: Minimum 44x44px
- **Text size**: Minimum 14px (text-sm)

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Skip links for main content
- Escape key closes modals

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where needed
- Alt text for all images
- Form labels associated with inputs

## Icons & Imagery

### Icon Guidelines
- **Style**: Outline icons (2px stroke)
- **Sizes**: 16px, 20px, 24px
- **Color**: Inherit from text
- **Accessibility**: Add aria-label or sr-only text

### Image Guidelines
- **Formats**: WebP with JPG fallback
- **Sizes**: Responsive images with srcset
- **Aspect ratios**: 16:9 (default), 1:1 (square), 4:3 (traditional)
- **Loading**: Lazy load below the fold

## Motion & Animation

### Animation Principles
- **Purpose**: Enhance usability, not distract
- **Duration**: 200-300ms for micro-interactions
- **Easing**: ease-in-out for most animations
- **Reduced motion**: Respect prefers-reduced-motion

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## Dark Mode

### Dark Mode Colors
```css
/* Dark mode adjustments */
[data-theme="dark"] {
  --bg-primary: var(--gray-900);
  --bg-secondary: var(--gray-800);
  --text-primary: var(--gray-100);
  --text-secondary: var(--gray-300);
  --border-color: var(--gray-700);
}
```

### Dark Mode Rules
- Reduce contrast slightly (not pure black/white)
- Adjust shadows (less prominent)
- Mute bright colors
- Test all color combinations

## Quality Checklist

### Visual Consistency
- [ ] All similar elements use same styles
- [ ] Spacing is consistent throughout
- [ ] Colors match the palette
- [ ] Typography follows the scale

### Responsiveness
- [ ] Works on all breakpoints
- [ ] Touch targets are large enough
- [ ] Text remains readable
- [ ] No horizontal scroll

### Accessibility
- [ ] Color contrast passes WCAG AA
- [ ] All interactive elements have focus states
- [ ] Works with keyboard only
- [ ] Screen reader tested

### Performance
- [ ] Images are optimized
- [ ] Animations use CSS/GPU
- [ ] No layout shift
- [ ] Fast initial render

---

_Style Guide Version: 1.0_  
_Last Updated: [Date]_  
_Maintained by: Design Team_