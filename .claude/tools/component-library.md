# Component Library Tool (shadcn-ui MCP)

This tool provides access to the shadcn-ui component library for generating modern, accessible UI components.

## ACTIVATION

When agents need to generate UI components or access component documentation, use this tool.

## Capabilities

- **Component generation**: Create React components with Tailwind CSS
- **Theme customization**: Adapt components to project design system
- **Variant selection**: Choose from multiple component styles
- **Documentation access**: Get usage examples and API references
- **Accessibility built-in**: WCAG compliant components

## Configuration

```yaml
tool:
  name: shadcn-ui
  type: mcp_server
  config:
    registry_url: "https://ui.shadcn.com/registry"
    framework: "react"
    styling: "tailwind"
    
capabilities:
  components:
    categories:
      - forms: ["input", "textarea", "select", "checkbox", "radio", "switch"]
      - layout: ["card", "dialog", "sheet", "tabs", "accordion"]
      - navigation: ["menu", "breadcrumb", "pagination", "tabs"]
      - feedback: ["alert", "toast", "progress", "skeleton", "spinner"]
      - data: ["table", "data-table", "list", "tree"]
      
  themes:
    presets: ["default", "slate", "zinc", "neutral", "stone"]
    customizable: ["radius", "colors", "typography", "spacing"]
```

## Usage Patterns

### Basic Component Generation

```javascript
// Generate a button component
const button = await mcp.shadcnui.generate({
  component: "button",
  variant: "default",
  props: {
    size: "lg",
    className: "w-full"
  }
});

// Generate a form with multiple components
const form = await mcp.shadcnui.generateForm({
  fields: [
    { type: "input", name: "email", label: "Email", validation: "email" },
    { type: "input", name: "password", label: "Password", type: "password" },
    { type: "checkbox", name: "remember", label: "Remember me" }
  ],
  submitButton: { text: "Sign In", variant: "default" }
});
```

### Theme Customization

```javascript
// Apply custom theme
const themedComponents = await mcp.shadcnui.applyTheme({
  theme: {
    primary: "#0070f3",
    secondary: "#7928ca",
    radius: "0.5rem",
    fontFamily: "Inter, sans-serif"
  },
  components: ["button", "card", "input"]
});

// Get theme configuration
const themeConfig = await mcp.shadcnui.getThemeConfig({
  includeCSS: true,
  format: "tailwind"
});
```

### Complex Component Patterns

```javascript
// Generate a data table with sorting and filtering
const dataTable = await mcp.shadcnui.generateDataTable({
  columns: [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", filterable: true },
    { key: "status", label: "Status", badge: true }
  ],
  features: ["sorting", "filtering", "pagination", "row-selection"],
  styling: {
    striped: true,
    hover: true,
    compact: false
  }
});

// Generate a multi-step form wizard
const wizard = await mcp.shadcnui.generateWizard({
  steps: [
    { title: "Personal Info", components: ["input", "select"] },
    { title: "Address", components: ["input", "textarea"] },
    { title: "Confirmation", components: ["summary", "checkbox"] }
  ],
  navigation: "stepper",
  validation: "per-step"
});
```

## Agent-Specific Usage

### Apollo (UX Designer)

```javascript
// Create a complete design system
async function createDesignSystem(brandGuidelines) {
  // Generate color palette
  const palette = await mcp.shadcnui.generatePalette({
    primary: brandGuidelines.primaryColor,
    mode: "complementary"
  });
  
  // Create component library
  const components = await mcp.shadcnui.generateLibrary({
    theme: palette,
    components: [
      "button", "card", "input", "select",
      "dialog", "toast", "tabs", "table"
    ],
    variants: ["default", "outline", "ghost", "destructive"]
  });
  
  // Generate documentation
  const docs = await mcp.shadcnui.generateDocs({
    components: components,
    includeExamples: true,
    includeAPI: true
  });
  
  return { palette, components, docs };
}
```

### Hephaestus (Developer)

```javascript
// Implement feature with shadcn-ui components
async function implementFeature(feature) {
  const components = [];
  
  // Analyze feature requirements
  for (const requirement of feature.uiRequirements) {
    const component = await mcp.shadcnui.recommend({
      need: requirement.type,
      context: requirement.context,
      constraints: requirement.constraints
    });
    
    // Generate with customizations
    const generated = await mcp.shadcnui.generate({
      component: component.name,
      variant: component.recommendedVariant,
      props: requirement.props,
      customStyles: requirement.styles
    });
    
    components.push({
      requirement: requirement.id,
      component: generated
    });
  }
  
  // Compose into feature
  return composeFeature(components);
}
```

### Pixel (UI Healer)

```javascript
// Fix UI issues with proper components
async function fixUIIssue(issue) {
  // Get current implementation
  const current = issue.currentImplementation;
  
  // Find appropriate shadcn-ui replacement
  const replacement = await mcp.shadcnui.findReplacement({
    currentHTML: current.html,
    currentStyles: current.styles,
    issue: issue.description
  });
  
  // Generate fixed component
  const fixed = await mcp.shadcnui.generate({
    component: replacement.component,
    variant: replacement.variant,
    props: replacement.props,
    accessibility: {
      aria: replacement.aria,
      keyboard: true,
      screenReader: true
    }
  });
  
  return {
    issue: issue.id,
    original: current,
    fixed: fixed,
    improvements: replacement.improvements
  };
}
```

## Component Composition

```javascript
// Compose complex UI from shadcn-ui components
async function composeUI(layout) {
  const composed = {
    layout: await mcp.shadcnui.generate({
      component: layout.container,
      props: { className: layout.className }
    }),
    sections: []
  };
  
  for (const section of layout.sections) {
    const sectionComponents = await Promise.all(
      section.components.map(comp => 
        mcp.shadcnui.generate({
          component: comp.type,
          variant: comp.variant,
          props: comp.props
        })
      )
    );
    
    composed.sections.push({
      id: section.id,
      components: sectionComponents
    });
  }
  
  return composed;
}
```

## Integration Patterns

```javascript
// Integrate with existing codebase
async function integrateComponent(component, project) {
  // Check dependencies
  const deps = await mcp.shadcnui.getDependencies({
    component: component,
    framework: project.framework
  });
  
  // Generate import statements
  const imports = await mcp.shadcnui.generateImports({
    component: component,
    style: project.importStyle
  });
  
  // Adapt to project conventions
  const adapted = await mcp.shadcnui.adaptComponent({
    component: component,
    conventions: project.conventions,
    typescript: project.useTypeScript
  });
  
  return {
    component: adapted,
    imports: imports,
    dependencies: deps
  };
}
```

## Documentation Access

```javascript
// Get component documentation
async function getComponentDocs(componentName) {
  const docs = await mcp.shadcnui.getDocs({
    component: componentName,
    sections: ["props", "examples", "accessibility", "keyboard"]
  });
  
  return {
    api: docs.props,
    examples: docs.examples.map(ex => ({
      title: ex.title,
      code: ex.code,
      preview: ex.preview
    })),
    a11y: docs.accessibility,
    keyboard: docs.keyboard
  };
}
```

## Performance Optimization

```javascript
// Optimize component bundle
async function optimizeComponents(components) {
  // Tree-shake unused variants
  const optimized = await mcp.shadcnui.optimize({
    components: components,
    removeUnusedVariants: true,
    removeUnusedStyles: true
  });
  
  // Generate minimal CSS
  const styles = await mcp.shadcnui.generateStyles({
    components: optimized,
    mode: "minimal",
    purge: true
  });
  
  return {
    components: optimized,
    styles: styles,
    savings: calculateSavings(components, optimized)
  };
}
```

## Best Practices

1. **Use semantic variants** that match your design system
2. **Maintain consistency** across component usage
3. **Leverage built-in accessibility** features
4. **Customize thoughtfully** - don't override core functionality
5. **Document customizations** for team reference
6. **Test across viewports** - components are responsive by default
7. **Use composition** over complex single components
8. **Keep dependencies updated** for security and features

This tool provides access to a modern, well-designed component library that accelerates UI development while maintaining quality and consistency.