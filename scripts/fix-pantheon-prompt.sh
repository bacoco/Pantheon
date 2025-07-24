#!/bin/bash
# Fix script to restore Pantheon terminal prompt

echo "⚡ Restoring Pantheon terminal prompt..."

# Add to bashrc if not present
if ! grep -q "pantheon" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Pantheon terminal prompt" >> ~/.bashrc
    echo "export PS1='⚡ [\\u@pantheon \\W]$ '" >> ~/.bashrc
    echo "✅ Added Pantheon prompt to ~/.bashrc"
else
    echo "✅ Pantheon prompt already in ~/.bashrc"
fi

# Apply immediately
export PS1='⚡ [\u@pantheon \W]$ '

echo ""
echo "✅ Pantheon prompt restored!"
echo ""
echo "Your terminal should now show:"
echo "⚡ [coder@pantheon projects]$ "
echo ""
echo "If not visible, please:"
echo "1. Close this terminal"
echo "2. Open a new terminal (Ctrl+` or Cmd+`)"
echo ""
echo "Or run: source ~/.bashrc"