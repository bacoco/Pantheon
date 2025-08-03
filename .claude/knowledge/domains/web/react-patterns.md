---
title: React Development Patterns
category: Web Development
tags: [react, frontend, patterns, hooks, components]
created: 2024-01-15
updated: 2024-01-15
confidence: high
---

# React Development Patterns

## Component Patterns

### 1. Container/Presentational Pattern
Separate logic from presentation for better testing and reusability.

```jsx
// Container Component (Smart)
const UserListContainer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);
  
  return <UserList users={users} loading={loading} />;
};

// Presentational Component (Dumb)
const UserList = ({ users, loading }) => {
  if (loading) return <Spinner />;
  
  return (
    <ul>
      {users.map(user => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  );
};
```

### 2. Compound Components Pattern
Create flexible component APIs that share state implicitly.

```jsx
const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabContext.Provider>
  );
};

Tabs.List = ({ children }) => (
  <div className="tab-list">{children}</div>
);

Tabs.Tab = ({ value, children }) => {
  const { activeTab, setActiveTab } = useContext(TabContext);
  return (
    <button 
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

// Usage
<Tabs defaultTab="profile">
  <Tabs.List>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="profile">Profile Content</Tabs.Panel>
  <Tabs.Panel value="settings">Settings Content</Tabs.Panel>
</Tabs>
```

### 3. Render Props Pattern
Share code between components using a prop whose value is a function.

```jsx
const MouseTracker = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return render(position);
};

// Usage
<MouseTracker 
  render={({ x, y }) => (
    <div>Mouse at: {x}, {y}</div>
  )}
/>
```

## Hook Patterns

### 1. Custom Hooks for Logic Reuse
Extract component logic into reusable hooks.

```jsx
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);
};
```

### 2. Reducer Pattern for Complex State
Use useReducer for complex state logic.

```jsx
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        },
        errors: {
          ...state.errors,
          [action.field]: undefined
        }
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, errors: {} };
    default:
      return state;
  }
};

const useForm = (initialValues, onSubmit) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    isSubmitting: false
  });
  
  const updateField = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      await onSubmit(state.values);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (errors) {
      dispatch({ type: 'SET_ERRORS', errors });
    }
  };
  
  return { ...state, updateField, handleSubmit };
};
```

## Performance Patterns

### 1. Memoization
Optimize expensive computations and prevent unnecessary re-renders.

```jsx
const ExpensiveComponent = memo(({ data, filter }) => {
  const filteredData = useMemo(() => {
    return data.filter(item => item.category === filter);
  }, [data, filter]);
  
  const totalValue = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.value, 0);
  }, [filteredData]);
  
  const handleClick = useCallback((id) => {
    console.log('Clicked:', id);
  }, []);
  
  return (
    <div>
      <h3>Total: {totalValue}</h3>
      {filteredData.map(item => (
        <Item key={item.id} {...item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

### 2. Code Splitting
Load components only when needed.

```jsx
const LazyDashboard = lazy(() => import('./Dashboard'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<LazyDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

## State Management Patterns

### 1. Context for Cross-Cutting Concerns
Use Context API for theme, auth, and other app-wide state.

```jsx
const ThemeContext = createContext();
const AuthContext = createContext();

const AppProviders = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AuthContext.Provider value={{ user, setUser }}>
        {children}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};

// Custom hooks for easier consumption
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 2. Local State First
Keep state as local as possible, lift only when necessary.

```jsx
// Good: State local to where it's used
const TodoItem = ({ todo, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return <TodoEditor todo={todo} onSave={() => setIsEditing(false)} />;
  }
  
  return (
    <div onClick={() => onToggle(todo.id)}>
      {todo.text}
      <button onClick={() => setIsEditing(true)}>Edit</button>
    </div>
  );
};
```

## Testing Patterns

### 1. Test User Behavior
Focus on how users interact with components.

```jsx
test('user can add a todo', async () => {
  render(<TodoApp />);
  
  const input = screen.getByPlaceholderText('Add a todo');
  const button = screen.getByText('Add');
  
  await userEvent.type(input, 'Buy milk');
  await userEvent.click(button);
  
  expect(screen.getByText('Buy milk')).toBeInTheDocument();
});
```

### 2. Mock External Dependencies
Isolate components for reliable tests.

```jsx
jest.mock('../api/users');

test('displays users after loading', async () => {
  const mockUsers = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  
  getUsersAPI.mockResolvedValue(mockUsers);
  
  render(<UserList />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
```

## Anti-Patterns to Avoid

1. **Direct State Mutation**: Always create new objects/arrays
2. **useEffect Overuse**: Consider if you really need an effect
3. **Prop Drilling**: Use Context or composition instead
4. **Giant Components**: Break down into smaller, focused components
5. **Inline Functions in JSX**: Can cause unnecessary re-renders

## Best Practices

1. **Component Naming**: Use PascalCase and descriptive names
2. **File Organization**: Co-locate related files
3. **Type Safety**: Use TypeScript or PropTypes
4. **Accessibility**: Always include ARIA labels and keyboard support
5. **Error Boundaries**: Catch and handle errors gracefully

## Related Knowledge

- [React Hooks Deep Dive](../react-hooks.md)
- [React Performance Optimization](../../patterns/performance/react-optimization.md)
- [Component Testing Strategies](../../best-practices/testing/react-testing.md)