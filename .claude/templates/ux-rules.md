# UX Rules & Principles

> User experience standards and patterns for [Project Name]

## Core UX Principles

### 1. User-Centered Design
- **Users First**: Every decision starts with user needs
- **Empathy**: Understand user context and constraints
- **Validation**: Test assumptions with real users
- **Iteration**: Improve based on feedback

### 2. Clarity Over Cleverness
- **Obvious**: Make the next action clear
- **Simple**: Reduce cognitive load
- **Consistent**: Use familiar patterns
- **Predictable**: No surprises

### 3. Progressive Disclosure
- **Just Enough**: Show only what's needed now
- **On Demand**: Reveal complexity when requested
- **Context**: Provide information when relevant
- **Hierarchy**: Most important first

### 4. Feedback & Communication
- **Immediate**: Acknowledge every action
- **Clear**: Tell users what happened
- **Actionable**: Guide the next step
- **Appropriate**: Match tone to context

### 5. Error Prevention & Recovery
- **Prevent**: Make errors impossible when possible
- **Forgive**: Allow easy recovery
- **Explain**: Clear error messages
- **Learn**: Reduce repeat errors

## Interaction Patterns

### Navigation
```yaml
principles:
  - Always show where users are
  - Provide clear path back
  - Group related items
  - Limit depth to 3 levels

patterns:
  primary_nav:
    - Maximum 7 top-level items
    - Active state clearly visible
    - Mobile: Hamburger or tab bar
    
  breadcrumbs:
    - Show on pages 2+ levels deep
    - Clickable except current page
    - Truncate long titles
    
  search:
    - Prominent placement
    - Auto-complete when possible
    - Show recent searches
```

### Forms
```yaml
principles:
  - One topic per page (mobile)
  - Clear labels and help text
  - Inline validation
  - Show progress on long forms

patterns:
  input_fields:
    - Label above field
    - Placeholder for format hints only
    - Error message below field
    - Success state when valid
    
  required_fields:
    - Mark optional fields, not required
    - Validate on blur, not keystroke
    - Group related fields
    
  submission:
    - Disable button while processing
    - Show loading state
    - Clear success confirmation
    - Preserve data on error
```

### Feedback Messages
```yaml
types:
  success:
    - Confirm what happened
    - Auto-dismiss after 5 seconds
    - Green color/checkmark icon
    
  warning:
    - Explain potential issue
    - Require dismissal
    - Yellow color/warning icon
    
  error:
    - Explain what went wrong
    - Provide solution
    - Red color/error icon
    - Never auto-dismiss
    
  info:
    - Provide helpful context
    - Blue color/info icon
    - Dismissible
```

### Loading States
```yaml
principles:
  - Never leave users wondering
  - Provide progress when possible
  - Maintain layout stability

patterns:
  instant: # < 100ms
    - No loading indicator needed
    
  fast: # 100ms - 1s
    - Skeleton screens
    - Preserve layout
    
  slow: # 1s - 10s
    - Progress indicator
    - Cancel option
    - Time estimate
    
  long: # > 10s
    - Detailed progress
    - Background processing option
    - Email when complete
```

## Content Guidelines

### Writing Style
```yaml
voice:
  - Conversational but professional
  - Active voice preferred
  - Short sentences
  - Plain language

tone:
  - Friendly
  - Helpful
  - Confident
  - Respectful
```

### Microcopy Rules
```yaml
buttons:
  - Action verbs (Save, Submit, Continue)
  - Sentence case
  - Specific over generic (Save Profile vs Save)
  
labels:
  - Clear and concise
  - Avoid jargon
  - Consistent terminology
  
errors:
  - What went wrong
  - Why it happened
  - How to fix it
  - Avoid blame
  
empty_states:
  - Explain what should be here
  - Guide to add first item
  - Positive tone
  - Visual interest
```

### Information Architecture
```yaml
organization:
  - Logical grouping
  - Clear hierarchy
  - Consistent patterns
  - User mental models

naming:
  - Descriptive not clever
  - User language not internal
  - Consistent throughout
  - Action-oriented

findability:
  - Multiple paths to content
  - Search always available
  - Related content linked
  - Clear categorization
```

## Accessibility Patterns

### Inclusive Design
```yaml
principles:
  - Design for extremes
  - One-handed operation
  - Work without color
  - Clear without sound

patterns:
  touch_targets:
    - Minimum 44x44px
    - Adequate spacing
    - Grouped actions
    
  readability:
    - High contrast text
    - Scalable fonts
    - Clear hierarchy
    - Adequate spacing
    
  alternatives:
    - Text for images
    - Captions for video
    - Transcripts for audio
    - Keyboard for mouse
```

### Cognitive Accessibility
```yaml
memory:
  - Don't rely on memory
  - Show previous entries
  - Provide context
  - Allow saving progress

attention:
  - Minimize distractions
  - Clear focus
  - One task at a time
  - Reduce time pressure

understanding:
  - Simple language
  - Visual aids
  - Examples
  - Help on demand
```

## Mobile-First Patterns

### Touch Interactions
```yaml
gestures:
  - Tap: Primary action
  - Long press: Secondary options
  - Swipe: Navigation/delete
  - Pinch: Zoom only

optimization:
  - Thumb-friendly zones
  - Bottom navigation
  - Reachable actions
  - Minimal typing
```

### Responsive Behavior
```yaml
breakpoints:
  mobile: # < 640px
    - Single column
    - Stacked content
    - Full-width buttons
    - Bottom sheets
    
  tablet: # 640px - 1024px
    - Two columns max
    - Side navigation
    - Floating actions
    
  desktop: # > 1024px
    - Multi-column
    - Hover states
    - Keyboard shortcuts
    - Dense layouts
```

## Performance UX

### Perceived Performance
```yaml
techniques:
  - Optimistic updates
  - Skeleton screens
  - Progressive enhancement
  - Lazy loading

priorities:
  - Critical path first
  - Above fold content
  - User-initiated actions
  - Background sync
```

### Offline Patterns
```yaml
strategies:
  - Cache critical data
  - Queue actions
  - Sync when online
  - Clear offline indicators

communication:
  - Show offline state
  - Explain limitations
  - Queue status
  - Sync confirmation
```

## Decision Trees

### When to Use Modals
```
Use modal when:
- Requires immediate attention
- Blocks critical action
- Contains focused task
- Needs isolation from page

Don't use when:
- Content is long
- Multiple steps involved
- Non-critical information
- Mobile primary experience
```

### Navigation Patterns
```
Top navigation when:
- < 7 primary sections
- Desktop primary
- Marketing/content sites

Side navigation when:
- Complex hierarchy
- Admin/dashboard
- Need persistent access

Bottom navigation when:
- Mobile primary
- 3-5 main actions
- App-like experience
```

## Quality Metrics

### Usability Heuristics
1. **Visibility**: System status always clear
2. **Match**: Real world language
3. **Control**: User freedom and control
4. **Consistency**: Standards followed
5. **Prevention**: Error prevention
6. **Recognition**: Over recall
7. **Flexibility**: Efficient use
8. **Aesthetic**: Minimalist design
9. **Recovery**: From errors
10. **Help**: Documentation available

### Success Metrics
```yaml
task_success:
  - Completion rate > 90%
  - Error rate < 5%
  - Time on task appropriate
  
satisfaction:
  - SUS score > 80
  - NPS > 50
  - Low frustration
  
engagement:
  - Return usage
  - Feature adoption
  - Task efficiency
```

## UX Debt Indicators

### Red Flags
- Users can't find features
- Same errors repeatedly
- High abandonment rates
- Workarounds needed
- Confused feedback

### Warning Signs
- Inconsistent patterns
- Multiple ways to do same thing
- Unclear navigation
- Missing feedback
- Poor mobile experience

## Iteration Process

### Continuous Improvement
1. **Measure**: Track key metrics
2. **Identify**: Find pain points
3. **Hypothesize**: Propose solutions
4. **Test**: Validate with users
5. **Implement**: Roll out improvements
6. **Monitor**: Assess impact

---

_UX Rules Version: 1.0_  
_Last Updated: [Date]_  
_Maintained by: UX Team_