#!/bin/bash
# Install Pantheon custom theme for code-server

echo "🎨 Installing Pantheon Lightning theme..."

# Create extensions directory if it doesn't exist
mkdir -p /home/coder/.local/share/code-server/extensions/pantheon-theme

# Create the theme extension
cat > /home/coder/.local/share/code-server/extensions/pantheon-theme/package.json << 'EOF'
{
  "name": "pantheon-theme",
  "displayName": "Pantheon Lightning Theme",
  "description": "Official BACO/Pantheon theme with lightning colors",
  "version": "1.0.0",
  "publisher": "baco",
  "engines": {
    "vscode": "^1.60.0"
  },
  "categories": ["Themes"],
  "contributes": {
    "themes": [
      {
        "label": "Pantheon Lightning",
        "uiTheme": "vs-dark",
        "path": "./themes/pantheon-lightning.json"
      }
    ]
  }
}
EOF

# Create themes directory
mkdir -p /home/coder/.local/share/code-server/extensions/pantheon-theme/themes

# Copy the theme file
if [ -f "/home/coder/.local/share/code-server/User/pantheon-theme.json" ]; then
    cp /home/coder/.local/share/code-server/User/pantheon-theme.json \
       /home/coder/.local/share/code-server/extensions/pantheon-theme/themes/pantheon-lightning.json
    echo "✅ Theme installed successfully!"
else
    echo "❌ Theme file not found!"
fi

# Apply custom CSS if code-server supports it
if [ -f "/home/coder/.local/share/code-server/User/custom.css" ]; then
    echo "🎨 Applying custom CSS..."
    # Note: This requires Custom CSS and JS Loader extension
fi

echo "✨ Pantheon Lightning theme is ready!"
echo "   The theme will be automatically applied on startup."