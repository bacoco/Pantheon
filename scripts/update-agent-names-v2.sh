#!/bin/bash
# Script to update all old agent names to mythological names throughout .claude directory
# Version 2 - Handles names with parentheses and special formatting

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Pantheon Agent Name Update Script V2 ===${NC}"
echo "This script will replace all old agent names with mythological names"
echo "Including names in formats like 'Winston (Architect)' and '### John (PM)'"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$SCRIPT_DIR/../.claude"

# Change to .claude directory
cd "$CLAUDE_DIR"

# Function to replace a single name with various patterns
replace_name_patterns() {
    local old_name="$1"
    local new_name="$2"
    local role="$3"
    
    echo -e "${YELLOW}Replacing $old_name → $new_name${NC}"
    
    # Find all text files
    find . -type f \( -name "*.md" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" -o -name "*.txt" -o -name "*.js" -o -name "*.ts" -o -name "*.py" \) -print0 | while IFS= read -r -d '' file; do
        # Skip backup files
        if [[ "$file" == *"backup"* ]]; then
            continue
        fi
        
        # Create temporary file
        temp_file=$(mktemp)
        cp "$file" "$temp_file"
        
        # Replace various patterns
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS sed
            # Basic name replacements
            sed -i '' "s/${old_name}/${new_name}/g" "$temp_file"
            
            # With role in parentheses
            sed -i '' "s/${old_name} (${role})/${new_name} (${role})/g" "$temp_file"
            
            # Markdown headers
            sed -i '' "s/### ${old_name} /### ${new_name} /g" "$temp_file"
            sed -i '' "s/## ${old_name} /## ${new_name} /g" "$temp_file"
            sed -i '' "s/# ${old_name} /# ${new_name} /g" "$temp_file"
            
            # Bold markdown
            sed -i '' "s/\*\*${old_name}\*\*/\*\*${new_name}\*\*/g" "$temp_file"
            sed -i '' "s/\*\*${old_name} (/\*\*${new_name} (/g" "$temp_file"
            
            # In lists
            sed -i '' "s/- ${old_name} /- ${new_name} /g" "$temp_file"
            sed -i '' "s/- \*\*${old_name}/- \*\*${new_name}/g" "$temp_file"
            
            # Lowercase versions
            local old_lower=$(echo "$old_name" | tr '[:upper:]' '[:lower:]')
            local new_lower=$(echo "$new_name" | tr '[:upper:]' '[:lower:]')
            sed -i '' "s/${old_lower}/${new_lower}/g" "$temp_file"
            
            # Uppercase versions
            local old_upper=$(echo "$old_name" | tr '[:lower:]' '[:upper:]')
            local new_upper=$(echo "$new_name" | tr '[:lower:]' '[:upper:]')
            sed -i '' "s/${old_upper}/${new_upper}/g" "$temp_file"
        else
            # Linux sed
            sed -i "s/${old_name}/${new_name}/g" "$temp_file"
            sed -i "s/${old_name} (${role})/${new_name} (${role})/g" "$temp_file"
            sed -i "s/### ${old_name} /### ${new_name} /g" "$temp_file"
            sed -i "s/## ${old_name} /## ${new_name} /g" "$temp_file"
            sed -i "s/# ${old_name} /# ${new_name} /g" "$temp_file"
            sed -i "s/\*\*${old_name}\*\*/\*\*${new_name}\*\*/g" "$temp_file"
            sed -i "s/\*\*${old_name} (/\*\*${new_name} (/g" "$temp_file"
            sed -i "s/- ${old_name} /- ${new_name} /g" "$temp_file"
            sed -i "s/- \*\*${old_name}/- \*\*${new_name}/g" "$temp_file"
            sed -i "s/${old_lower}/${new_lower}/g" "$temp_file"
            sed -i "s/${old_upper}/${new_upper}/g" "$temp_file"
        fi
        
        # Check if file was modified
        if ! cmp -s "$file" "$temp_file"; then
            echo -e "  ${GREEN}✓${NC} Updated: $file"
            mv "$temp_file" "$file"
        else
            rm "$temp_file"
        fi
    done
}

# Function to replace names
replace_all_names() {
    echo -e "\n${BLUE}Replacing all agent names...${NC}"
    
    # Replace each agent with their role
    replace_name_patterns "Winston" "Daedalus" "Architect"
    replace_name_patterns "James" "Hephaestus" "Developer"
    replace_name_patterns "Elena" "Themis" "QA"
    replace_name_patterns "Marcus" "Aegis" "Security"
    replace_name_patterns "John" "Prometheus" "PM"
    replace_name_patterns "Sarah" "Athena" "PO"
    replace_name_patterns "Bob" "Hermes" "SM"
    replace_name_patterns "Sally" "Apollo" "UX"
    
    echo -e "${GREEN}✓ All name replacements complete${NC}"
}

# Function to rename directories
rename_directories() {
    echo -e "\n${BLUE}Checking for directories to rename...${NC}"
    
    # These were already renamed by the first script
    local dirs_renamed=false
    
    if [ -d "templates/agents/winston" ]; then
        mv "templates/agents/winston" "templates/agents/daedalus"
        echo -e "  ${YELLOW}Renamed: templates/agents/winston → daedalus${NC}"
        dirs_renamed=true
    fi
    
    if [ -d "templates/agents/james" ]; then
        mv "templates/agents/james" "templates/agents/hephaestus"
        echo -e "  ${YELLOW}Renamed: templates/agents/james → hephaestus${NC}"
        dirs_renamed=true
    fi
    
    if [ -d "templates/agents/elena" ]; then
        mv "templates/agents/elena" "templates/agents/themis"
        echo -e "  ${YELLOW}Renamed: templates/agents/elena → themis${NC}"
        dirs_renamed=true
    fi
    
    if [ -d "templates/agents/marcus" ]; then
        mv "templates/agents/marcus" "templates/agents/aegis"
        echo -e "  ${YELLOW}Renamed: templates/agents/marcus → aegis${NC}"
        dirs_renamed=true
    fi
    
    if [ "$dirs_renamed" = false ]; then
        echo -e "  ${GREEN}✓ All directories already renamed${NC}"
    fi
}

# Function to verify changes
verify_final() {
    echo -e "\n${BLUE}Final verification...${NC}"
    
    local found_old=false
    for old_name in "Winston" "James" "Elena" "Marcus" "John" "Sarah" "Bob" "Sally"; do
        echo -n "  Checking for $old_name... "
        count=$(grep -r "${old_name}" . --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" 2>/dev/null | grep -v "backup" | wc -l)
        if [ $count -gt 0 ]; then
            echo -e "${RED}Still found $count occurrences${NC}"
            found_old=true
        else
            echo -e "${GREEN}✓ All replaced${NC}"
        fi
    done
    
    if [ "$found_old" = false ]; then
        echo -e "\n${GREEN}✅ SUCCESS: All old names have been replaced!${NC}"
    else
        echo -e "\n${YELLOW}⚠ Some occurrences might remain in special contexts${NC}"
    fi
}

# Main execution
echo -e "\n${YELLOW}Starting comprehensive agent name updates...${NC}"

# No need for new backup - use existing one
echo -e "${BLUE}Using existing backup from previous run${NC}"

# Execute updates
replace_all_names
rename_directories
verify_final

echo -e "\n${GREEN}=== Update Complete ===${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the changes"
echo "2. Test the system"
echo "3. Commit when satisfied"
echo ""
echo -e "${YELLOW}To restore from backup if needed:${NC}"
echo "  cd .. && tar xzf .claude-backup-20250724-161616.tar.gz"