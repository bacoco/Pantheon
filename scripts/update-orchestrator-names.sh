#!/bin/bash

# Script to update orchestrator names from old to mythological names
# BACO Orchestrator → Zeus
# BMad Master → Janus

echo "🔄 Starting orchestrator name updates..."

# Counter for changes
TOTAL_CHANGES=0

# Function to perform replacements with proper escaping
replace_orchestrator_names() {
    local old_name="$1"
    local new_name="$2"
    local description="$3"
    
    echo -e "\n📝 Replacing '$old_name' with '$new_name' ($description)..."
    
    # Find and replace in .claude directory
    local count=$(find /Users/loic/develop/BACO/.claude -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.yml" \) -exec grep -l "$old_name" {} \; | wc -l)
    
    if [ $count -gt 0 ]; then
        echo "Found $count files containing '$old_name'"
        
        # Perform the replacement
        find /Users/loic/develop/BACO/.claude -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.yml" \) -exec grep -l "$old_name" {} \; | while read file; do
            echo "  Updating: $file"
            # Use sed with backup
            sed -i.bak "s/$old_name/$new_name/g" "$file"
            rm "${file}.bak"
        done
        
        TOTAL_CHANGES=$((TOTAL_CHANGES + count))
    else
        echo "No instances of '$old_name' found"
    fi
}

# Replace BACO Orchestrator with Zeus
replace_orchestrator_names "BACO Orchestrator" "Zeus" "Supreme Orchestrator"

# Replace BMad Master with Janus
replace_orchestrator_names "BMad Master" "Janus" "Meta-Orchestrator"

echo -e "\n✅ Orchestrator name update complete!"
echo "Total files updated: $TOTAL_CHANGES"

# Verify the changes
echo -e "\n🔍 Verifying changes..."

echo -e "\n❌ Checking for any remaining 'BACO Orchestrator':"
if grep -r "BACO Orchestrator" /Users/loic/develop/BACO/.claude --include="*.md" --include="*.yaml" --include="*.yml" 2>/dev/null; then
    echo "WARNING: Some instances still remain!"
else
    echo "✅ None found - all replaced!"
fi

echo -e "\n❌ Checking for any remaining 'BMad Master':"
if grep -r "BMad Master" /Users/loic/develop/BACO/.claude --include="*.md" --include="*.yaml" --include="*.yml" 2>/dev/null; then
    echo "WARNING: Some instances still remain!"
else
    echo "✅ None found - all replaced!"
fi

echo -e "\n🎉 Orchestrator name migration complete!"