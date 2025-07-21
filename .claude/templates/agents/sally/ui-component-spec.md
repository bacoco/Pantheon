---
id: "ui-component-spec"
name: "UI Component Specification Template"
description: "Detailed component specifications for consistent UI implementation"
category: "design"
agent: "sally"
frameworks: ["react", "vue", "angular", "web-components"]
dependencies: []
tags: ["ui", "component", "design", "specification", "ux"]
testTemplate: "component-testing"
conflicts: []
mergeStrategy: "new"
targetFiles:
  - path: "docs/design/components/{{componentName}}.md"
    type: "new"
  - path: "src/components/{{componentName}}/README.md"
    type: "new"
---

## Overview

This template helps Sally create comprehensive UI component specifications that provide developers with everything needed to implement consistent, accessible, and delightful user interfaces.

## Template

# Component Specification: {{componentName}}

**Component Name**: {{componentName}}  
**Category**: {{componentCategory}}  
**Version**: {{version}}  
**Designer**: Sally (UX Designer)  
**Last Updated**: {{lastUpdated}}  
**Status**: {{status}}

## Component Overview

### Purpose
{{componentPurpose}}

### User Need
{{userNeed}}

### Design Principles
1. **{{principle1}}**: {{principle1Description}}
2. **{{principle2}}**: {{principle2Description}}
3. **{{principle3}}**: {{principle3Description}}

### Key Features
- {{keyFeature1}}
- {{keyFeature2}}
- {{keyFeature3}}

## Visual Design

### Component Anatomy
```
┌─────────────────────────────────────┐
│  {{anatomyDiagram}}                 │
│                                     │
│  1. {{element1}}                    │
│  2. {{element2}}                    │
│  3. {{element3}}                    │
│  4. {{element4}}                    │
└─────────────────────────────────────┘
```

### Visual States
| State | Description | Visual Changes |
|-------|-------------|----------------|
| Default | {{defaultDesc}} | {{defaultVisual}} |
| Hover | {{hoverDesc}} | {{hoverVisual}} |
| Focus | {{focusDesc}} | {{focusVisual}} |
| Active | {{activeDesc}} | {{activeVisual}} |
| Disabled | {{disabledDesc}} | {{disabledVisual}} |
| Loading | {{loadingDesc}} | {{loadingVisual}} |
| Error | {{errorDesc}} | {{errorVisual}} |
| Success | {{successDesc}} | {{successVisual}} |

### Variants
#### Variant 1: {{variant1Name}}
- **Use Case**: {{variant1UseCase}}
- **Differences**: {{variant1Differences}}
- **Example**: {{variant1Example}}

#### Variant 2: {{variant2Name}}
- **Use Case**: {{variant2UseCase}}
- **Differences**: {{variant2Differences}}
- **Example**: {{variant2Example}}

### Responsive Behavior
| Breakpoint | Behavior | Layout Changes |
|------------|----------|----------------|
| Mobile (<768px) | {{mobileBehavior}} | {{mobileLayout}} |
| Tablet (768px-1024px) | {{tabletBehavior}} | {{tabletLayout}} |
| Desktop (>1024px) | {{desktopBehavior}} | {{desktopLayout}} |

## Design Tokens

### Colors
```css
/* Primary Colors */
--{{componentName}}-primary: {{primaryColor}};
--{{componentName}}-primary-hover: {{primaryHoverColor}};
--{{componentName}}-primary-active: {{primaryActiveColor}};

/* Text Colors */
--{{componentName}}-text: {{textColor}};
--{{componentName}}-text-secondary: {{textSecondaryColor}};
--{{componentName}}-text-disabled: {{textDisabledColor}};

/* Background Colors */
--{{componentName}}-bg: {{bgColor}};
--{{componentName}}-bg-hover: {{bgHoverColor}};
--{{componentName}}-bg-disabled: {{bgDisabledColor}};

/* Border Colors */
--{{componentName}}-border: {{borderColor}};
--{{componentName}}-border-focus: {{borderFocusColor}};
--{{componentName}}-border-error: {{borderErrorColor}};
```

### Typography
```css
/* Font Properties */
--{{componentName}}-font-family: {{fontFamily}};
--{{componentName}}-font-size: {{fontSize}};
--{{componentName}}-font-weight: {{fontWeight}};
--{{componentName}}-line-height: {{lineHeight}};
--{{componentName}}-letter-spacing: {{letterSpacing}};

/* Text Styles */
--{{componentName}}-heading: {{headingStyle}};
--{{componentName}}-body: {{bodyStyle}};
--{{componentName}}-caption: {{captionStyle}};
```

### Spacing
```css
/* Padding */
--{{componentName}}-padding-xs: {{paddingXS}};
--{{componentName}}-padding-sm: {{paddingSM}};
--{{componentName}}-padding-md: {{paddingMD}};
--{{componentName}}-padding-lg: {{paddingLG}};

/* Margin */
--{{componentName}}-margin-xs: {{marginXS}};
--{{componentName}}-margin-sm: {{marginSM}};
--{{componentName}}-margin-md: {{marginMD}};
--{{componentName}}-margin-lg: {{marginLG}};

/* Gap */
--{{componentName}}-gap: {{gap}};
```

### Dimensions
```css
/* Sizes */
--{{componentName}}-height-sm: {{heightSM}};
--{{componentName}}-height-md: {{heightMD}};
--{{componentName}}-height-lg: {{heightLG}};

--{{componentName}}-width-min: {{widthMin}};
--{{componentName}}-width-max: {{widthMax}};

/* Border Radius */
--{{componentName}}-radius-sm: {{radiusSM}};
--{{componentName}}-radius-md: {{radiusMD}};
--{{componentName}}-radius-lg: {{radiusLG}};

/* Shadows */
--{{componentName}}-shadow-sm: {{shadowSM}};
--{{componentName}}-shadow-md: {{shadowMD}};
--{{componentName}}-shadow-lg: {{shadowLG}};
```

## Behavior Specifications

### Interactions
#### Click/Tap
- **Trigger**: {{clickTrigger}}
- **Action**: {{clickAction}}
- **Feedback**: {{clickFeedback}}
- **Transition**: {{clickTransition}}

#### Keyboard
| Key | Action | Notes |
|-----|--------|-------|
| Enter/Space | {{enterAction}} | {{enterNotes}} |
| Tab | {{tabAction}} | {{tabNotes}} |
| Shift+Tab | {{shiftTabAction}} | {{shiftTabNotes}} |
| Escape | {{escapeAction}} | {{escapeNotes}} |
| Arrow Keys | {{arrowAction}} | {{arrowNotes}} |

#### Touch Gestures
- **Tap**: {{tapGesture}}
- **Long Press**: {{longPressGesture}}
- **Swipe**: {{swipeGesture}}
- **Pinch**: {{pinchGesture}}

### Animations
```css
/* Transitions */
--{{componentName}}-transition-duration: {{transitionDuration}};
--{{componentName}}-transition-easing: {{transitionEasing}};

/* Specific Animations */
.{{componentName}}--entering {
  animation: {{enterAnimation}} {{enterDuration}} {{enterEasing}};
}

.{{componentName}}--exiting {
  animation: {{exitAnimation}} {{exitDuration}} {{exitEasing}};
}

@keyframes {{animationName}} {
  from { {{animationFrom}} }
  to { {{animationTo}} }
}
```

### Loading States
1. **Skeleton Screen**: {{skeletonDescription}}
2. **Spinner**: {{spinnerDescription}}
3. **Progress Indicator**: {{progressDescription}}
4. **Placeholder Content**: {{placeholderDescription}}

## Component API

### Props/Attributes
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| {{prop1}} | {{type1}} | {{default1}} | {{required1}} | {{description1}} |
| {{prop2}} | {{type2}} | {{default2}} | {{required2}} | {{description2}} |
| {{prop3}} | {{type3}} | {{default3}} | {{required3}} | {{description3}} |
| {{prop4}} | {{type4}} | {{default4}} | {{required4}} | {{description4}} |

### Events
| Event | Payload | Description | When Triggered |
|-------|---------|-------------|----------------|
| {{event1}} | {{payload1}} | {{eventDesc1}} | {{trigger1}} |
| {{event2}} | {{payload2}} | {{eventDesc2}} | {{trigger2}} |
| {{event3}} | {{payload3}} | {{eventDesc3}} | {{trigger3}} |

### Slots/Children
| Slot | Purpose | Constraints |
|------|---------|-------------|
| {{slot1}} | {{slotPurpose1}} | {{slotConstraints1}} |
| {{slot2}} | {{slotPurpose2}} | {{slotConstraints2}} |

### Methods
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| {{method1}} | {{params1}} | {{returns1}} | {{methodDesc1}} |
| {{method2}} | {{params2}} | {{returns2}} | {{methodDesc2}} |

## Accessibility

### ARIA Requirements
```html
<!-- Basic ARIA structure -->
<div 
  role="{{ariaRole}}"
  aria-label="{{ariaLabel}}"
  aria-describedby="{{ariaDescribedBy}}"
  aria-expanded="{{ariaExpanded}}"
  aria-controls="{{ariaControls}}"
  tabindex="{{tabIndex}}"
>
  {{content}}
</div>
```

### Screen Reader Behavior
1. **Announcement**: {{screenReaderAnnouncement}}
2. **Navigation**: {{screenReaderNavigation}}
3. **State Changes**: {{screenReaderStateChanges}}
4. **Error Messages**: {{screenReaderErrors}}

### Keyboard Navigation
```yaml
tab_order:
  1: {{tabOrder1}}
  2: {{tabOrder2}}
  3: {{tabOrder3}}
  
focus_management:
  - initial_focus: {{initialFocus}}
  - focus_trap: {{focusTrap}}
  - focus_return: {{focusReturn}}
```

### Color Contrast
| Element | Foreground | Background | Ratio | WCAG Level |
|---------|------------|------------|-------|------------|
| {{element1}} | {{fg1}} | {{bg1}} | {{ratio1}} | {{level1}} |
| {{element2}} | {{fg2}} | {{bg2}} | {{ratio2}} | {{level2}} |

## Implementation Examples

### React Implementation
```jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './{{ComponentName}}.module.css';

const {{ComponentName}} = ({ 
  {{prop1}},
  {{prop2}},
  {{prop3}},
  onEvent,
  className,
  ...props 
}) => {
  const [state, setState] = useState({{initialState}});
  const ref = useRef(null);

  useEffect(() => {
    {{useEffectLogic}}
  }, [{{dependencies}}]);

  const handleInteraction = (event) => {
    {{interactionHandler}}
    onEvent?.(event);
  };

  return (
    <div 
      ref={ref}
      className={`${styles.{{componentName}}} ${className}`}
      role="{{ariaRole}}"
      aria-label={{{ariaLabel}}}
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      {{componentStructure}}
    </div>
  );
};

{{ComponentName}}.propTypes = {
  {{propTypes}}
};

{{ComponentName}}.defaultProps = {
  {{defaultProps}}
};

export default {{ComponentName}};
```

### CSS Implementation
```css
.{{componentName}} {
  /* Layout */
  display: {{display}};
  position: {{position}};
  
  /* Dimensions */
  width: var(--{{componentName}}-width);
  height: var(--{{componentName}}-height);
  
  /* Spacing */
  padding: var(--{{componentName}}-padding);
  margin: var(--{{componentName}}-margin);
  
  /* Visual */
  background-color: var(--{{componentName}}-bg);
  border: 1px solid var(--{{componentName}}-border);
  border-radius: var(--{{componentName}}-radius);
  box-shadow: var(--{{componentName}}-shadow);
  
  /* Typography */
  font-family: var(--{{componentName}}-font-family);
  font-size: var(--{{componentName}}-font-size);
  color: var(--{{componentName}}-text);
  
  /* Transitions */
  transition: all var(--{{componentName}}-transition-duration) var(--{{componentName}}-transition-easing);
}

/* States */
.{{componentName}}:hover {
  {{hoverStyles}}
}

.{{componentName}}:focus {
  {{focusStyles}}
}

.{{componentName}}:active {
  {{activeStyles}}
}

.{{componentName}}[disabled] {
  {{disabledStyles}}
}

/* Variants */
.{{componentName}}--{{variant1}} {
  {{variant1Styles}}
}

/* Responsive */
@media (max-width: 768px) {
  .{{componentName}} {
    {{mobileStyles}}
  }
}
```

## Usage Guidelines

### Do's
1. ✅ {{do1}}
2. ✅ {{do2}}
3. ✅ {{do3}}
4. ✅ {{do4}}

### Don'ts
1. ❌ {{dont1}}
2. ❌ {{dont2}}
3. ❌ {{dont3}}
4. ❌ {{dont4}}

### Common Patterns
#### Pattern 1: {{pattern1Name}}
```html
{{pattern1Code}}
```
**When to use**: {{pattern1When}}

#### Pattern 2: {{pattern2Name}}
```html
{{pattern2Code}}
```
**When to use**: {{pattern2When}}

## Content Guidelines

### Microcopy
| Element | Guidelines | Character Limit | Examples |
|---------|------------|-----------------|----------|
| {{element1}} | {{guidelines1}} | {{limit1}} | {{examples1}} |
| {{element2}} | {{guidelines2}} | {{limit2}} | {{examples2}} |

### Tone of Voice
- **Personality**: {{personality}}
- **Language**: {{languageStyle}}
- **Formality**: {{formalityLevel}}

## Testing Checklist

### Visual Testing
- [ ] All states render correctly
- [ ] Responsive behavior works as specified
- [ ] Animations are smooth
- [ ] Colors match design tokens
- [ ] Typography is consistent

### Functional Testing
- [ ] All props work as documented
- [ ] Events fire correctly
- [ ] Keyboard navigation works
- [ ] Touch gestures function properly
- [ ] Error states handle gracefully

### Accessibility Testing
- [ ] Screen reader announces correctly
- [ ] Keyboard navigation is logical
- [ ] Focus indicators are visible
- [ ] Color contrast passes WCAG
- [ ] ARIA attributes are correct

### Performance Testing
- [ ] Component renders quickly
- [ ] Animations don't cause jank
- [ ] Memory usage is reasonable
- [ ] No unnecessary re-renders

## Related Components

### Similar Components
- **{{relatedComponent1}}**: {{relation1}}
- **{{relatedComponent2}}**: {{relation2}}

### Component Composition
```
{{ParentComponent}}
  └── {{ComponentName}}
      ├── {{ChildComponent1}}
      └── {{ChildComponent2}}
```

## Version History

| Version | Date | Changes | Designer |
|---------|------|---------|----------|
| {{version1}} | {{date1}} | {{changes1}} | {{designer1}} |
| {{version2}} | {{date2}} | {{changes2}} | {{designer2}} |

## Resources

### Design Files
- Figma: [{{figmaLink}}]
- Sketch: [{{sketchLink}}]
- Adobe XD: [{{xdLink}}]

### Documentation
- Storybook: [{{storybookLink}}]
- Design System: [{{designSystemLink}}]
- Component Library: [{{componentLibraryLink}}]

---

## Sally's Design Principles

1. **User-Centered**: Every pixel serves the user's needs
2. **Accessible First**: Design for everyone from the start
3. **Consistent**: Predictable patterns build trust
4. **Delightful**: Small details make big differences
5. **Performance Matters**: Beautiful AND fast