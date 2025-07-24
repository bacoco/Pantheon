// baco-vscode-extension/extension.js
const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Status bar items
let statusBar;
let authStatusBar;

// Extension activation
function activate(context) {
    console.log('BACO Pantheon extension is now active!');

    // Initialize status bars
    initializeStatusBars(context);

    // Register BACO commands
    registerBACoCommands(context);

    // Register authentication commands
    registerAuthCommands(context);

    // Check authentication status on startup
    if (vscode.workspace.getConfiguration('baco').get('autoCheckAuth')) {
        checkAuthenticationStatus();
    }
}

// Initialize status bar items
function initializeStatusBars(context) {
    // Main BACO status bar
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = '🚀 BACO';
    statusBar.tooltip = 'Click for BACO Commands';
    statusBar.command = 'baco.showMenu';
    
    if (vscode.workspace.getConfiguration('baco').get('showStatusBar')) {
        statusBar.show();
    }
    
    // Authentication status bar
    authStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    authStatusBar.tooltip = 'Claude Authentication Status';
    authStatusBar.command = 'baco.authenticate';
    
    context.subscriptions.push(statusBar, authStatusBar);
}

// Register BACO commands
function registerBACoCommands(context) {
    // Initialize project command
    let initCmd = vscode.commands.registerCommand('baco.init', async () => {
        const terminal = vscode.window.createTerminal('BACO Init');
        terminal.show();
        terminal.sendText('gods init');
    });

    // Create plan command
    let planCmd = vscode.commands.registerCommand('baco.plan', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'What would you like to build?',
            placeHolder: 'e.g., REST API with authentication'
        });
        
        if (input) {
            const terminal = vscode.window.createTerminal('BACO Plan');
            terminal.show();
            terminal.sendText(`gods plan "${input}"`);
        }
    });
    
    // Execute plan command
    let executeCmd = vscode.commands.registerCommand('baco.execute', async () => {
        const terminal = vscode.window.createTerminal('BACO Execute');
        terminal.show();
        terminal.sendText('gods execute');
    });

    // Show menu command
    let menuCmd = vscode.commands.registerCommand('baco.showMenu', async () => {
        const items = [
            { label: '🚀 Initialize Project', description: 'Run gods init', command: 'baco.init' },
            { label: '📋 Create Plan', description: 'Run gods plan', command: 'baco.plan' },
            { label: '⚡ Execute Plan', description: 'Run gods execute', command: 'baco.execute' },
            { label: '---' },
            { label: '🔐 Authenticate Claude', description: 'Run authentication wizard', command: 'baco.authenticate' },
            { label: '📊 Check Auth Status', description: 'View authentication status', command: 'baco.authStatus' },
            { label: '💾 Backup Authentication', description: 'Backup current auth', command: 'baco.authBackup' },
            { label: '📥 Restore Authentication', description: 'Restore from backup', command: 'baco.authRestore' }
        ];
        
        const selected = await vscode.window.showQuickPick(
            items.filter(item => item.label !== '---'),
            {
                placeHolder: 'Select a command to run',
            }
        );

        if (selected && selected.command) {
            vscode.commands.executeCommand(selected.command);
        }
    });

    context.subscriptions.push(initCmd, planCmd, executeCmd, menuCmd);
}

// Register authentication commands
function registerAuthCommands(context) {
    // Authenticate command
    let authCmd = vscode.commands.registerCommand('baco.authenticate', async () => {
        const terminal = vscode.window.createTerminal({
            name: 'Claude Authentication',
            iconPath: new vscode.ThemeIcon('key')
        });
        terminal.show();
        terminal.sendText('claude-auth-docker.sh');
        
        // Update status after a delay
        setTimeout(() => checkAuthenticationStatus(), 5000);
    });

    // Check status command
    let statusCmd = vscode.commands.registerCommand('baco.authStatus', async () => {
        const terminal = vscode.window.createTerminal({
            name: 'Authentication Status',
            iconPath: new vscode.ThemeIcon('info')
        });
        terminal.show();
        terminal.sendText('claude-auth-status.sh');
    });

    // Backup command
    let backupCmd = vscode.commands.registerCommand('baco.authBackup', async () => {
        const terminal = vscode.window.createTerminal('Backup Authentication');
        terminal.show();
        terminal.sendText('claude-auth-helper.sh backup');
        
        setTimeout(() => {
            vscode.window.showInformationMessage('Authentication backup completed!');
        }, 2000);
    });

    // Restore command
    let restoreCmd = vscode.commands.registerCommand('baco.authRestore', async () => {
        const response = await vscode.window.showWarningMessage(
            'This will restore authentication from a backup. Continue?',
            'Yes',
            'No'
        );
        
        if (response === 'Yes') {
            const terminal = vscode.window.createTerminal('Restore Authentication');
            terminal.show();
            terminal.sendText('claude-auth-helper.sh restore');
        }
    });

    context.subscriptions.push(authCmd, statusCmd, backupCmd, restoreCmd);
}

// Check authentication status
function checkAuthenticationStatus() {
    exec('claude status', (error, stdout, stderr) => {
        if (!error) {
            // Authenticated
            authStatusBar.text = '$(check) Claude';
            authStatusBar.color = new vscode.ThemeColor('statusBar.foreground');
            authStatusBar.backgroundColor = new vscode.ThemeColor('statusBar.background');
            authStatusBar.tooltip = 'Claude is authenticated ✓';
        } else {
            // Not authenticated
            authStatusBar.text = '$(x) Claude';
            authStatusBar.color = new vscode.ThemeColor('errorForeground');
            authStatusBar.backgroundColor = new vscode.ThemeColor('statusBar.background');
            authStatusBar.tooltip = 'Claude is not authenticated - Click to authenticate';
        }
        authStatusBar.show();
    });
}

// Watch for authentication changes
function watchAuthenticationChanges(context) {
    const authDir = path.join(process.env.HOME || process.env.USERPROFILE, '.claude');
    
    if (fs.existsSync(authDir)) {
        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(authDir, '**/*'),
            false,
            false,
            false
        );
        
        watcher.onDidChange(() => checkAuthenticationStatus());
        watcher.onDidCreate(() => checkAuthenticationStatus());
        watcher.onDidDelete(() => checkAuthenticationStatus());
        
        context.subscriptions.push(watcher);
    }
}

// Extension deactivation
function deactivate() {
    console.log('BACO Pantheon extension deactivated');
}

// Helper function to run commands and get output
async function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Show authentication reminder if not authenticated
async function showAuthenticationReminder() {
    try {
        await runCommand('claude status');
    } catch (error) {
        const response = await vscode.window.showWarningMessage(
            'Claude is not authenticated. Would you like to authenticate now?',
            'Authenticate',
            'Later'
        );
        
        if (response === 'Authenticate') {
            vscode.commands.executeCommand('baco.authenticate');
        }
    }
}

// Add configuration change listener
vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('baco.showStatusBar')) {
        if (vscode.workspace.getConfiguration('baco').get('showStatusBar')) {
            statusBar.show();
        } else {
            statusBar.hide();
        }
    }
});

module.exports = {
    activate,
    deactivate
};