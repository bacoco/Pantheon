// Example client code for using Pantheon service from frontend

/**
 * Pantheon API Client Example
 * 
 * This shows how to interact with the Pantheon service from a frontend application
 */

const API_BASE = 'http://localhost:3001/api/pantheon';

// Check Pantheon status
async function checkPantheonStatus() {
  const response = await fetch(`${API_BASE}/status`);
  const data = await response.json();
  
  if (data.success && data.data.initialized) {
    console.log('Pantheon is initialized');
    console.log('Available commands:', data.data.commands.list);
  } else {
    console.log('Pantheon is not initialized');
  }
  
  return data;
}

// Initialize Pantheon
async function initializePantheon() {
  const response = await fetch(`${API_BASE}/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Pantheon initialized successfully');
  } else {
    console.error('Failed to initialize Pantheon:', data.error);
  }
  
  return data;
}

// List available commands
async function listCommands() {
  const response = await fetch(`${API_BASE}/commands`);
  const data = await response.json();
  
  if (data.success) {
    console.log('Available commands:');
    data.data.commands.forEach(cmd => {
      console.log(`  ${cmd.name}: ${cmd.description}`);
    });
  }
  
  return data;
}

// Get specific command details
async function getCommand(commandName: string) {
  const response = await fetch(`${API_BASE}/commands/${commandName}`);
  const data = await response.json();
  
  if (data.success) {
    console.log(`Command: ${data.data.name}`);
    console.log(`Description: ${data.data.description}`);
    console.log(`Content preview: ${data.data.content.substring(0, 100)}...`);
  }
  
  return data;
}

// Execute a Pantheon command
async function executeCommand(command: string) {
  const response = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Command executed successfully');
    console.log('Output:', data.data.output);
    
    if (data.data.artifacts) {
      console.log('Artifacts:', data.data.artifacts);
    }
  } else {
    console.error('Command execution failed:', data.error);
  }
  
  return data;
}

// Change working directory
async function changeWorkspace(directory: string) {
  const response = await fetch(`${API_BASE}/workspace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ directory })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Workspace changed to:', directory);
    console.log('Status:', data.data.status);
  }
  
  return data;
}

// Example usage flow
async function exampleFlow() {
  console.log('=== Pantheon Client Example ===\n');
  
  // 1. Check initial status
  console.log('1. Checking Pantheon status...');
  const status = await checkPantheonStatus();
  
  // 2. Initialize if needed
  if (!status.data?.initialized) {
    console.log('\n2. Initializing Pantheon...');
    await initializePantheon();
  }
  
  // 3. List available commands
  console.log('\n3. Listing available commands...');
  await listCommands();
  
  // 4. Get help command details
  console.log('\n4. Getting help command details...');
  await getCommand('help');
  
  // 5. Execute help command
  console.log('\n5. Executing /help command...');
  await executeCommand('/help');
}

// React hooks example
export const usePantheonCommands = () => {
  const [commands, setCommands] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    async function fetchCommands() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/commands`);
        const data = await response.json();
        
        if (data.success) {
          setCommands(data.data.commands);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCommands();
  }, []);
  
  return { commands, loading, error };
};

// Export functions for use in frontend
export {
  checkPantheonStatus,
  initializePantheon,
  listCommands,
  getCommand,
  executeCommand,
  changeWorkspace,
  exampleFlow
};