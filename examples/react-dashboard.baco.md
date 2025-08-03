---
version: 1.0
project_type: "React Dashboard"
author: "Frontend Team"
tags: ["frontend", "react", "dashboard", "charts"]
---

## FEATURE: User Dashboard

A responsive dashboard interface showing key metrics and visualizations:

- Real-time data updates
- Interactive charts using Chart.js or Recharts
- Responsive grid layout
- Dark/light theme toggle

[HIGH PRIORITY]

## FEATURE: Data Filtering

Allow users to filter and search through displayed data:

- Date range picker
- Category filters
- Search functionality
- Export filtered data to CSV

Dependencies: User Dashboard

## EXAMPLES:

- `./examples/dashboard-layout.jsx`: Grid-based dashboard layout
- `./examples/chart-components.jsx`: Reusable chart components
- `./examples/theme-context.jsx`: Theme switching implementation

## DOCUMENTATION:

- `https://react.dev/`: React documentation
- `https://recharts.org/`: Recharts library for data visualization
- `https://mui.com/`: Material-UI component library

## CONSTRAINTS:

- Must be responsive (mobile, tablet, desktop)
- Support latest 2 versions of major browsers
- Lighthouse performance score > 90
- Accessibility compliant (WCAG 2.1 AA)

## OTHER CONSIDERATIONS:

The dashboard will consume data from an existing REST API. Consider implementing:
- Request caching and deduplication
- Optimistic UI updates
- Error boundaries for graceful failure handling
- Skeleton screens during data loading