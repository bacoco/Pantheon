#!/bin/bash
# Script to update all old agent names to mythological names throughout .claude directory

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Pantheon Agent Name Update Script ===${NC}"
echo "This script will replace all old agent names with mythological names"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$SCRIPT_DIR/../.claude"

# Change to .claude directory
cd "$CLAUDE_DIR"

# Create backup
echo -e "${YELLOW}Creating backup of .claude directory...${NC}"
BACKUP_NAME=".claude-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
cd ..
tar czf "$BACKUP_NAME" .claude/
echo -e "${GREEN}✓ Backup created: $BACKUP_NAME${NC}"
cd "$CLAUDE_DIR"

# Function to replace a single name pair
replace_name() {
    local old_name="$1"
    local new_name="$2"
    
    # Find all text files and replace
    find . -type f \( -name "*.md" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" -o -name "*.txt" -o -name "*.js" -o -name "*.ts" -o -name "*.py" \) -print0 | while IFS= read -r -d '' file; do
        # Skip backup files
        if [[ "$file" == *"backup"* ]]; then
            continue
        fi
        
        # Check if file contains the old name
        if grep -q "\b${old_name}\b" "$file" 2>/dev/null; then
            echo -e "  ${YELLOW}Updating $old_name → $new_name in: $file${NC}"
            
            # Use sed to replace
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/\b${old_name}\b/${new_name}/g" "$file"
            else
                # Linux
                sed -i "s/\b${old_name}\b/${new_name}/g" "$file"
            fi
        fi
    done
}

# Function to replace names in files
replace_in_files() {
    echo -e "\n${BLUE}Replacing names in files...${NC}"
    
    # Replace each name pair
    replace_name "Winston" "Daedalus"
    replace_name "winston" "daedalus"
    replace_name "WINSTON" "DAEDALUS"
    
    replace_name "James" "Hephaestus"
    replace_name "james" "hephaestus"
    replace_name "JAMES" "HEPHAESTUS"
    
    replace_name "Elena" "Themis"
    replace_name "elena" "themis"
    replace_name "ELENA" "THEMIS"
    
    replace_name "Marcus" "Aegis"
    replace_name "marcus" "aegis"
    replace_name "MARCUS" "AEGIS"
    
    replace_name "John" "Prometheus"
    replace_name "john" "prometheus"
    replace_name "JOHN" "PROMETHEUS"
    
    replace_name "Sarah" "Athena"
    replace_name "sarah" "athena"
    replace_name "SARAH" "ATHENA"
    
    replace_name "Bob" "Hermes"
    replace_name "bob" "hermes"
    replace_name "BOB" "HERMES"
    
    replace_name "Sally" "Apollo"
    replace_name "sally" "apollo"
    replace_name "SALLY" "APOLLO"
    
    echo -e "${GREEN}✓ File content updates complete${NC}"
}

# Function to rename directories
rename_directories() {
    echo -e "\n${BLUE}Renaming directories...${NC}"
    
    # Rename template directories
    if [ -d "templates/agents/winston" ]; then
        echo -e "  ${YELLOW}Renaming: templates/agents/winston → templates/agents/daedalus${NC}"
        mv "templates/agents/winston" "templates/agents/daedalus"
    fi
    
    if [ -d "templates/agents/james" ]; then
        echo -e "  ${YELLOW}Renaming: templates/agents/james → templates/agents/hephaestus${NC}"
        mv "templates/agents/james" "templates/agents/hephaestus"
    fi
    
    if [ -d "templates/agents/elena" ]; then
        echo -e "  ${YELLOW}Renaming: templates/agents/elena → templates/agents/themis${NC}"
        mv "templates/agents/elena" "templates/agents/themis"
    fi
    
    if [ -d "templates/agents/marcus" ]; then
        echo -e "  ${YELLOW}Renaming: templates/agents/marcus → templates/agents/aegis${NC}"
        mv "templates/agents/marcus" "templates/agents/aegis"
    fi
    
    echo -e "${GREEN}✓ Directory renames complete${NC}"
}

# Function to verify changes
verify_changes() {
    echo -e "\n${BLUE}Verifying changes...${NC}"
    
    # Check for any remaining old names
    local found_old=false
    for old_name in "Winston" "James" "Elena" "Marcus" "John" "Sarah" "Bob" "Sally"; do
        echo -n "  Checking for $old_name... "
        count=$(grep -r "\b${old_name}\b" . --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" 2>/dev/null | wc -l)
        if [ $count -gt 0 ]; then
            echo -e "${RED}Found $count occurrences${NC}"
            found_old=true
            echo "    Sample locations:"
            grep -r "\b${old_name}\b" . --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" 2>/dev/null | head -3 | sed 's/^/      /'
        else
            echo -e "${GREEN}None found${NC}"
        fi
    done
    
    if [ "$found_old" = false ]; then
        echo -e "\n${GREEN}✓ All old names have been replaced!${NC}"
    else
        echo -e "\n${YELLOW}⚠ Some old names may still remain. Please check the output above.${NC}"
    fi
}

# Function to create summary
create_summary() {
    echo -e "\n${BLUE}Creating summary report...${NC}"
    
    SUMMARY_FILE="../agent-name-update-summary.txt"
    {
        echo "Pantheon Agent Name Update Summary"
        echo "================================="
        echo "Date: $(date)"
        echo ""
        echo "Name Mappings Applied:"
        echo "---------------------"
        echo "Winston → Daedalus"
        echo "James → Hephaestus"
        echo "Elena → Themis"
        echo "Marcus → Aegis"
        echo "John → Prometheus"
        echo "Sarah → Athena"
        echo "Bob → Hermes"
        echo "Sally → Apollo"
        echo ""
        echo "Files Modified:"
        echo "--------------"
        find . -type f -newer "../$BACKUP_NAME" 2>/dev/null | sort | head -50
        echo ""
        echo "Backup Location: $BACKUP_NAME"
    } > "$SUMMARY_FILE"
    
    echo -e "${GREEN}✓ Summary saved to: agent-name-update-summary.txt${NC}"
}

# Main execution
echo -e "\n${YELLOW}Starting agent name updates...${NC}"

# Execute updates
replace_in_files
rename_directories
verify_changes
create_summary

echo -e "\n${GREEN}=== Update Complete ===${NC}"
echo -e "Backup saved as: ${YELLOW}$BACKUP_NAME${NC}"
echo -e "Summary saved as: ${YELLOW}agent-name-update-summary.txt${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the changes"
echo "2. Test the system to ensure everything works"
echo "3. Commit the changes when satisfied"
echo ""
echo -e "${YELLOW}To restore from backup if needed:${NC}"
echo "  tar xzf $BACKUP_NAME"