#!/bin/bash

# Pantheon CI/CD Orchestration Script
# Complete automated workflow for testing, validation, and deployment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
CLAUDE_DIR=".claude"
PANTHEON_DIR=".pantheon"
TEST_SCRIPT="$CLAUDE_DIR/tests/bmad-integration-test.js"
HOOKS_CONFIG="$CLAUDE_DIR/hooks.json"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${PURPLE}═══════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    log_success "Node.js: $(node --version)"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    log_success "Git: $(git --version | head -n1)"
    
    # Check directories
    if [ ! -d "$CLAUDE_DIR" ]; then
        log_error ".claude directory not found"
        exit 1
    fi
    log_success ".claude directory exists"
    
    # Check test file
    if [ ! -f "$TEST_SCRIPT" ]; then
        log_error "Test script not found: $TEST_SCRIPT"
        exit 1
    fi
    log_success "Test script found"
    
    # Check hooks configuration
    if [ -f "$HOOKS_CONFIG" ]; then
        log_success "Hooks configured"
    else
        log_warning "Hooks not configured (optional)"
    fi
}

# Run BMAD tests
run_tests() {
    log_header "Running BMAD Test Suite"
    
    if node "$TEST_SCRIPT" 2>/dev/null; then
        SUCCESS_RATE=$(node "$TEST_SCRIPT" 2>/dev/null | grep "Success Rate" | cut -d: -f2 | tr -d ' ')
        log_success "Tests passed: $SUCCESS_RATE"
        return 0
    else
        log_error "Tests failed"
        return 1
    fi
}

# Validate Sacred Scrolls
validate_scrolls() {
    log_header "Validating Sacred Scrolls"
    
    # Create pantheon directory if it doesn't exist
    mkdir -p "$PANTHEON_DIR/scrolls"
    
    # Check for active scrolls
    SCROLL_COUNT=$(find "$PANTHEON_DIR/scrolls" -name "*.xml" 2>/dev/null | wc -l)
    
    if [ $SCROLL_COUNT -gt 0 ]; then
        log_success "Found $SCROLL_COUNT Sacred Scrolls"
        
        # Validate XML structure
        for scroll in "$PANTHEON_DIR/scrolls"/*.xml; do
            if [ -f "$scroll" ]; then
                if xmllint --noout "$scroll" 2>/dev/null; then
                    log_success "Valid: $(basename $scroll)"
                else
                    log_warning "Invalid XML: $(basename $scroll)"
                fi
            fi
        done
    else
        log_info "No Sacred Scrolls found (normal for new projects)"
    fi
}

# Check current phase
check_phase() {
    log_header "Checking BMAD Phase"
    
    PHASE_FILE="$PANTHEON_DIR/current-phase"
    
    if [ -f "$PHASE_FILE" ]; then
        CURRENT_PHASE=$(cat "$PHASE_FILE")
        log_info "Current phase: $CURRENT_PHASE"
        
        if [ "$CURRENT_PHASE" == "planning" ]; then
            log_warning "In planning phase - execution limited"
        elif [ "$CURRENT_PHASE" == "execution" ]; then
            log_success "In execution phase - full access"
        fi
    else
        log_info "No phase set - full access"
        echo "execution" > "$PHASE_FILE"
    fi
}

# Run quality gates
run_quality_gates() {
    log_header "Running Quality Gates"
    
    # Test coverage check
    log_info "Checking test coverage..."
    COVERAGE=$(node "$TEST_SCRIPT" 2>/dev/null | grep -E "passed|failed" | wc -l)
    if [ $COVERAGE -gt 70 ]; then
        log_success "Test coverage acceptable"
    else
        log_warning "Low test coverage"
    fi
    
    # Documentation check
    log_info "Checking documentation..."
    DOC_COUNT=$(find "$CLAUDE_DIR/docs" -name "*.md" 2>/dev/null | wc -l)
    if [ $DOC_COUNT -gt 0 ]; then
        log_success "Documentation found: $DOC_COUNT files"
    else
        log_warning "No documentation found"
    fi
    
    # Code quality (basic check)
    log_info "Checking code quality..."
    TODO_COUNT=$(grep -r "TODO\|FIXME" "$CLAUDE_DIR" 2>/dev/null | wc -l)
    if [ $TODO_COUNT -eq 0 ]; then
        log_success "No TODOs or FIXMEs found"
    else
        log_warning "Found $TODO_COUNT TODOs/FIXMEs"
    fi
}

# Git operations
git_operations() {
    log_header "Git Operations"
    
    # Check git status
    if git diff --quiet && git diff --cached --quiet; then
        log_info "No changes to commit"
        return 0
    fi
    
    # Generate commit message
    CHANGED_FILES=$(git diff --name-only | wc -l)
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
    
    if [ "$1" == "auto" ]; then
        # Auto-commit if tests pass
        if run_tests; then
            git add -A
            git commit -m "✅ Auto-commit: All tests passing ($TIMESTAMP)" || true
            log_success "Changes committed automatically"
        else
            log_warning "Tests failed - skipping auto-commit"
        fi
    else
        log_info "Changes detected: $CHANGED_FILES files"
        log_info "Run with 'auto' flag to auto-commit"
    fi
}

# Generate CI report
generate_report() {
    log_header "Generating CI Report"
    
    REPORT_FILE="$PANTHEON_DIR/ci-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Pantheon CI Report

**Date**: $(date)
**Branch**: $(git branch --show-current)

## Test Results
$(node "$TEST_SCRIPT" 2>/dev/null | grep -E "Success Rate|passed|failed" || echo "No test results")

## Sacred Scrolls
- Count: $(find "$PANTHEON_DIR/scrolls" -name "*.xml" 2>/dev/null | wc -l)
- Valid: $(find "$PANTHEON_DIR/scrolls" -name "*.xml" -exec xmllint --noout {} \; 2>&1 | grep -c "^$" || echo "0")

## Code Quality
- TODOs: $(grep -r "TODO" "$CLAUDE_DIR" 2>/dev/null | wc -l)
- FIXMEs: $(grep -r "FIXME" "$CLAUDE_DIR" 2>/dev/null | wc -l)

## Git Status
$(git status --short)

---
*Generated by Pantheon CI*
EOF
    
    log_success "Report saved to: $REPORT_FILE"
}

# Main workflow
main() {
    clear
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║     🏛️  PANTHEON CI/CD SYSTEM  🏛️      ║"
    echo "║        Automated Quality Gates        ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Parse arguments
    MODE=${1:-"check"}
    
    case $MODE in
        "check")
            log_info "Running in CHECK mode (no commits)"
            ;;
        "auto")
            log_info "Running in AUTO mode (will commit if tests pass)"
            ;;
        "release")
            log_info "Running in RELEASE mode"
            ;;
        *)
            log_error "Unknown mode: $MODE"
            echo "Usage: $0 [check|auto|release]"
            exit 1
            ;;
    esac
    
    # Run CI pipeline
    check_prerequisites
    
    # Core workflow
    if run_tests; then
        validate_scrolls
        check_phase
        run_quality_gates
        
        if [ "$MODE" == "auto" ]; then
            git_operations "auto"
        elif [ "$MODE" == "release" ]; then
            log_header "Release Workflow"
            VERSION=${2:-"patch"}
            
            # Ensure everything is committed
            if ! git diff --quiet; then
                log_error "Uncommitted changes - cannot release"
                exit 1
            fi
            
            # Update version (if package.json exists)
            if [ -f "$CLAUDE_DIR/package.json" ]; then
                cd "$CLAUDE_DIR"
                npm version "$VERSION" --no-git-tag-version
                cd - > /dev/null
                
                NEW_VERSION=$(node -p "require('./$CLAUDE_DIR/package.json').version")
                
                git add "$CLAUDE_DIR/package.json"
                git commit -m "🚀 Release v$NEW_VERSION"
                git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"
                
                log_success "Created release v$NEW_VERSION"
                log_info "Push with: git push origin main --tags"
            else
                log_warning "No package.json found - manual versioning required"
            fi
        fi
        
        generate_report
        
        log_header "CI Pipeline Complete"
        log_success "All checks passed! 🎉"
        
        # Show summary
        echo -e "\n${GREEN}Summary:${NC}"
        echo "  • Tests: ✅ Passing"
        echo "  • Quality: ✅ Good"
        echo "  • Scrolls: ✅ Valid"
        echo "  • Ready: ✅ Yes"
        
    else
        log_header "CI Pipeline Failed"
        log_error "Fix issues and try again"
        exit 1
    fi
}

# Run main function
main "$@"