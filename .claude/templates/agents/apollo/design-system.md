---
id: "design-system"
name: "Design System Documentation Template"
description: "Comprehensive design system for consistent product experiences"
category: "design"
agent: "sally"
frameworks: ["any"]
dependencies: []
tags: ["design-system", "ui", "ux", "patterns", "guidelines"]
testTemplate: null
conflicts: []
mergeStrategy: "new"
targetFiles:
  - path: "docs/design-system/index.md"
    type: "new"
  - path: "docs/design-system/tokens.md"
    type: "new"
  - path: "docs/design-system/components.md"
    type: "new"
  - path: "docs/design-system/patterns.md"
    type: "new"
---

## Overview

This template helps Sally create a comprehensive design system that ensures consistent, scalable, and delightful user experiences across all products.

## Template

# {{productName}} Design System

**Version**: {{version}}  
**Last Updated**: {{lastUpdated}}  
**Design Lead**: Sally (UX Designer)  
**Status**: {{status}}

## Introduction

### Purpose
{{designSystemPurpose}}

### Principles
1. **{{principle1}}**: {{principle1Explanation}}
2. **{{principle2}}**: {{principle2Explanation}}
3. **{{principle3}}**: {{principle3Explanation}}
4. **{{principle4}}**: {{principle4Explanation}}
5. **{{principle5}}**: {{principle5Explanation}}

### Benefits
- {{benefit1}}
- {{benefit2}}
- {{benefit3}}
- {{benefit4}}

## Brand Identity

### Brand Values
- **{{value1}}**: {{value1Description}}
- **{{value2}}**: {{value2Description}}
- **{{value3}}**: {{value3Description}}

### Brand Personality
{{brandPersonality}}

### Voice and Tone
| Context | Voice | Tone | Example |
|---------|-------|------|---------|
| Success Messages | {{successVoice}} | {{successTone}} | {{successExample}} |
| Error Messages | {{errorVoice}} | {{errorTone}} | {{errorExample}} |
| Instructions | {{instructionVoice}} | {{instructionTone}} | {{instructionExample}} |
| Marketing | {{marketingVoice}} | {{marketingTone}} | {{marketingExample}} |

## Design Tokens

### Color System

#### Brand Colors
```css
/* Primary Palette */
--color-primary-50: {{primary50}};
--color-primary-100: {{primary100}};
--color-primary-200: {{primary200}};
--color-primary-300: {{primary300}};
--color-primary-400: {{primary400}};
--color-primary-500: {{primary500}}; /* Main */
--color-primary-600: {{primary600}};
--color-primary-700: {{primary700}};
--color-primary-800: {{primary800}};
--color-primary-900: {{primary900}};

/* Secondary Palette */
--color-secondary-50: {{secondary50}};
--color-secondary-100: {{secondary100}};
--color-secondary-200: {{secondary200}};
--color-secondary-300: {{secondary300}};
--color-secondary-400: {{secondary400}};
--color-secondary-500: {{secondary500}};
--color-secondary-600: {{secondary600}};
--color-secondary-700: {{secondary700}};
--color-secondary-800: {{secondary800}};
--color-secondary-900: {{secondary900}};

/* Accent Colors */
--color-accent-1: {{accent1}};
--color-accent-2: {{accent2}};
--color-accent-3: {{accent3}};
```

#### Semantic Colors
```css
/* Status Colors */
--color-success: {{successColor}};
--color-success-light: {{successLight}};
--color-success-dark: {{successDark}};

--color-warning: {{warningColor}};
--color-warning-light: {{warningLight}};
--color-warning-dark: {{warningDark}};

--color-error: {{errorColor}};
--color-error-light: {{errorLight}};
--color-error-dark: {{errorDark}};

--color-info: {{infoColor}};
--color-info-light: {{infoLight}};
--color-info-dark: {{infoDark}};

/* Neutral Colors */
--color-gray-50: {{gray50}};
--color-gray-100: {{gray100}};
--color-gray-200: {{gray200}};
--color-gray-300: {{gray300}};
--color-gray-400: {{gray400}};
--color-gray-500: {{gray500}};
--color-gray-600: {{gray600}};
--color-gray-700: {{gray700}};
--color-gray-800: {{gray800}};
--color-gray-900: {{gray900}};
```

#### Color Usage Guidelines
| Color | Primary Use | Secondary Use | Don't Use For |
|-------|-------------|---------------|---------------|
| Primary | {{primaryUse}} | {{primarySecondary}} | {{primaryDont}} |
| Secondary | {{secondaryUse}} | {{secondarySecondary}} | {{secondaryDont}} |
| Success | {{successUse}} | {{successSecondary}} | {{successDont}} |
| Error | {{errorUse}} | {{errorSecondary}} | {{errorDont}} |

### Typography

#### Font Families
```css
/* Font Stacks */
--font-family-sans: {{sansFontStack}};
--font-family-serif: {{serifFontStack}};
--font-family-mono: {{monoFontStack}};

/* Specific Usage */
--font-family-heading: var(--font-family-sans);
--font-family-body: var(--font-family-sans);
--font-family-ui: var(--font-family-sans);
--font-family-code: var(--font-family-mono);
```

#### Type Scale
```css
/* Font Sizes */
--font-size-xs: {{fontSizeXS}};    /* 12px */
--font-size-sm: {{fontSizeSM}};    /* 14px */
--font-size-base: {{fontSizeBase}}; /* 16px */
--font-size-lg: {{fontSizeLG}};    /* 18px */
--font-size-xl: {{fontSizeXL}};    /* 20px */
--font-size-2xl: {{fontSize2XL}};  /* 24px */
--font-size-3xl: {{fontSize3XL}};  /* 30px */
--font-size-4xl: {{fontSize4XL}};  /* 36px */
--font-size-5xl: {{fontSize5XL}};  /* 48px */

/* Line Heights */
--line-height-tight: {{lineHeightTight}};   /* 1.25 */
--line-height-snug: {{lineHeightSnug}};     /* 1.375 */
--line-height-normal: {{lineHeightNormal}}; /* 1.5 */
--line-height-relaxed: {{lineHeightRelaxed}}; /* 1.625 */
--line-height-loose: {{lineHeightLoose}};   /* 2 */

/* Font Weights */
--font-weight-light: {{fontWeightLight}};     /* 300 */
--font-weight-normal: {{fontWeightNormal}};   /* 400 */
--font-weight-medium: {{fontWeightMedium}};   /* 500 */
--font-weight-semibold: {{fontWeightSemibold}}; /* 600 */
--font-weight-bold: {{fontWeightBold}};       /* 700 */
```

#### Text Styles
```css
/* Headings */
.heading-1 {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: {{h1LetterSpacing}};
}

.heading-2 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  letter-spacing: {{h2LetterSpacing}};
}

/* Body Text */
.body-large {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

.body-base {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

.body-small {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

/* UI Text */
.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: {{labelLetterSpacing}};
  text-transform: {{labelTextTransform}};
}

.caption {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-normal);
  color: var(--color-gray-600);
}
```

### Spacing System

```css
/* Base Unit: {{baseUnit}}px */
--space-0: 0;
--space-1: {{space1}};    /* 4px */
--space-2: {{space2}};    /* 8px */
--space-3: {{space3}};    /* 12px */
--space-4: {{space4}};    /* 16px */
--space-5: {{space5}};    /* 20px */
--space-6: {{space6}};    /* 24px */
--space-8: {{space8}};    /* 32px */
--space-10: {{space10}};  /* 40px */
--space-12: {{space12}};  /* 48px */
--space-16: {{space16}};  /* 64px */
--space-20: {{space20}};  /* 80px */
--space-24: {{space24}};  /* 96px */

/* Component-specific spacing */
--spacing-component-padding: var(--space-4);
--spacing-component-margin: var(--space-6);
--spacing-section-padding: var(--space-8);
--spacing-page-margin: var(--space-10);
```

### Layout Grid

```css
/* Grid System */
--grid-columns: {{gridColumns}};
--grid-gutter: {{gridGutter}};
--grid-margin: {{gridMargin}};

/* Breakpoints */
--breakpoint-xs: {{breakpointXS}};   /* 0px */
--breakpoint-sm: {{breakpointSM}};   /* 640px */
--breakpoint-md: {{breakpointMD}};   /* 768px */
--breakpoint-lg: {{breakpointLG}};   /* 1024px */
--breakpoint-xl: {{breakpointXL}};   /* 1280px */
--breakpoint-2xl: {{breakpoint2XL}}; /* 1536px */

/* Container Widths */
--container-sm: {{containerSM}};   /* 640px */
--container-md: {{containerMD}};   /* 768px */
--container-lg: {{containerLG}};   /* 1024px */
--container-xl: {{containerXL}};   /* 1280px */
--container-2xl: {{container2XL}}; /* 1536px */
```

### Visual Effects

```css
/* Shadows */
--shadow-xs: {{shadowXS}};
--shadow-sm: {{shadowSM}};
--shadow-md: {{shadowMD}};
--shadow-lg: {{shadowLG}};
--shadow-xl: {{shadowXL}};
--shadow-2xl: {{shadow2XL}};
--shadow-inner: {{shadowInner}};

/* Border Radius */
--radius-none: 0;
--radius-sm: {{radiusSM}};    /* 2px */
--radius-md: {{radiusMD}};    /* 4px */
--radius-lg: {{radiusLG}};    /* 8px */
--radius-xl: {{radiusXL}};    /* 12px */
--radius-2xl: {{radius2XL}};  /* 16px */
--radius-full: 9999px;

/* Transitions */
--transition-fast: {{transitionFast}};       /* 150ms */
--transition-base: {{transitionBase}};       /* 250ms */
--transition-slow: {{transitionSlow}};       /* 350ms */
--transition-slower: {{transitionSlower}};   /* 500ms */

/* Easing Functions */
--ease-in: {{easeIn}};
--ease-out: {{easeOut}};
--ease-in-out: {{easeInOut}};
--ease-bounce: {{easeBounce}};
```

## Component Library

### Foundation Components

#### Button
- Primary Button
- Secondary Button
- Tertiary Button
- Icon Button
- Button Group

#### Form Elements
- Text Input
- Textarea
- Select
- Checkbox
- Radio Button
- Toggle Switch
- Slider
- Date Picker

#### Navigation
- Navigation Bar
- Sidebar
- Breadcrumbs
- Tabs
- Pagination
- Stepper

#### Feedback
- Alert
- Toast/Snackbar
- Modal
- Tooltip
- Progress Bar
- Spinner/Loader

#### Data Display
- Table
- Card
- List
- Avatar
- Badge
- Tag/Chip

### Component States
| Component | Default | Hover | Active | Focus | Disabled | Loading | Error |
|-----------|---------|-------|--------|-------|----------|---------|-------|
| Button | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Input | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Card | ✓ | ✓ | ✓ | ✓ | - | ✓ | - |

## Patterns and Guidelines

### Layout Patterns

#### Page Layouts
1. **Dashboard Layout**
   ```
   ┌─────────────────────────────┐
   │         Header              │
   ├─────┬───────────────────────┤
   │ Nav │     Content           │
   │     │                       │
   │     │                       │
   └─────┴───────────────────────┘
   ```

2. **Single Column Layout**
   ```
   ┌─────────────────────────────┐
   │         Header              │
   ├─────────────────────────────┤
   │         Content             │
   │                             │
   └─────────────────────────────┘
   ```

### Interaction Patterns

#### Form Patterns
- **Inline Validation**: {{inlineValidationPattern}}
- **Progressive Disclosure**: {{progressiveDisclosurePattern}}
- **Smart Defaults**: {{smartDefaultsPattern}}

#### Navigation Patterns
- **Hub and Spoke**: {{hubSpokePattern}}
- **Progressive Navigation**: {{progressiveNavPattern}}
- **Contextual Actions**: {{contextualActionsPattern}}

#### Feedback Patterns
- **Optimistic UI**: {{optimisticUIPattern}}
- **Skeleton Screens**: {{skeletonScreenPattern}}
- **Empty States**: {{emptyStatePattern}}

### Content Patterns

#### Error Messages
| Error Type | Message Pattern | Example |
|------------|-----------------|---------|
| Validation | {{validationPattern}} | {{validationExample}} |
| System | {{systemPattern}} | {{systemExample}} |
| Permission | {{permissionPattern}} | {{permissionExample}} |
| Network | {{networkPattern}} | {{networkExample}} |

#### Success Messages
| Action | Message Pattern | Example |
|--------|-----------------|---------|
| Create | {{createPattern}} | {{createExample}} |
| Update | {{updatePattern}} | {{updateExample}} |
| Delete | {{deletePattern}} | {{deleteExample}} |

## Accessibility Guidelines

### Color Accessibility
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Independence**: Never use color as the only indicator
- **Focus Indicators**: Visible focus states for all interactive elements

### Keyboard Navigation
- **Tab Order**: Logical and predictable
- **Skip Links**: Available for repetitive content
- **Keyboard Shortcuts**: Document and make discoverable

### Screen Reader Support
- **Semantic HTML**: Use proper heading hierarchy
- **ARIA Labels**: Provide context where needed
- **Live Regions**: Announce dynamic content changes

### Motion and Animation
- **Respect Preferences**: Honor prefers-reduced-motion
- **Purpose**: All motion should have purpose
- **Duration**: Keep animations under 400ms

## Implementation Guidelines

### CSS Architecture
```css
/* Naming Convention: BEM */
.block {}
.block__element {}
.block--modifier {}

/* Utility Classes */
.u-text-center {}
.u-mt-4 {}
.u-hidden {}

/* Component Classes */
.c-button {}
.c-card {}
.c-modal {}

/* Layout Classes */
.l-container {}
.l-grid {}
.l-sidebar {}
```

### Token Usage
```scss
// ✅ Do: Use design tokens
.button {
  padding: var(--space-3) var(--space-6);
  background: var(--color-primary-500);
  border-radius: var(--radius-md);
}

// ❌ Don't: Use arbitrary values
.button {
  padding: 12px 24px;
  background: #3B82F6;
  border-radius: 4px;
}
```

### Component Composition
```jsx
// ✅ Do: Compose from primitives
<Card>
  <CardHeader>
    <Heading level={2}>Title</Heading>
  </CardHeader>
  <CardBody>
    <Text>Content</Text>
  </CardBody>
</Card>

// ❌ Don't: Create overly specific components
<UserProfileCardWithEditButton />
```

## Tooling and Resources

### Design Tools
- **Primary**: {{primaryDesignTool}}
- **Prototyping**: {{prototypingTool}}
- **Collaboration**: {{collaborationTool}}
- **Version Control**: {{versionControlTool}}

### Development Tools
- **Component Library**: {{componentLibraryTool}}
- **Documentation**: {{documentationTool}}
- **Testing**: {{testingTool}}
- **Build System**: {{buildSystemTool}}

### Resources
- **Icons**: {{iconResource}}
- **Illustrations**: {{illustrationResource}}
- **Stock Photos**: {{photoResource}}
- **Fonts**: {{fontResource}}

## Maintenance and Governance

### Update Process
1. **Proposal**: {{proposalProcess}}
2. **Review**: {{reviewProcess}}
3. **Testing**: {{testingProcess}}
4. **Documentation**: {{documentationProcess}}
5. **Release**: {{releaseProcess}}

### Version Control
- **Major Version**: Breaking changes
- **Minor Version**: New features
- **Patch Version**: Bug fixes

### Team Responsibilities
| Role | Responsibilities |
|------|------------------|
| Design Lead | {{designLeadResponsibilities}} |
| Developer Lead | {{devLeadResponsibilities}} |
| Product Owner | {{poResponsibilities}} |
| Contributors | {{contributorResponsibilities}} |

## Adoption Guide

### Getting Started
1. {{gettingStarted1}}
2. {{gettingStarted2}}
3. {{gettingStarted3}}

### Migration Path
- **Phase 1**: {{migrationPhase1}}
- **Phase 2**: {{migrationPhase2}}
- **Phase 3**: {{migrationPhase3}}

### Training Resources
- **Documentation**: {{documentationLink}}
- **Video Tutorials**: {{tutorialsLink}}
- **Workshop Schedule**: {{workshopLink}}
- **Office Hours**: {{officeHoursInfo}}

---

## Sally's Design System Philosophy

1. **Systematic Thinking**: Design decisions that scale
2. **Inclusive by Default**: Accessibility is not optional
3. **Performance Conscious**: Beautiful experiences that load fast
4. **Documentation First**: If it's not documented, it doesn't exist
5. **Evolve Thoughtfully**: Change with purpose, not whim