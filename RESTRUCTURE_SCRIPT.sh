#!/bin/bash
# Repository Restructure Script
# This script moves all Stage projects from root into Using-AI folder

set -e

echo "🚀 Starting Repository Restructure..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to move and log
move_project() {
    local src=$1
    local dest=$2
    
    if [ -d "$src" ]; then
        echo -e "${BLUE}Moving: $src → $dest${NC}"
        mkdir -p "$(dirname "$dest")"
        mv "$src" "$dest"
        echo -e "${GREEN}✓ Moved: $dest${NC}"
    else
        echo "⚠ Source not found: $src (skipping)"
    fi
}

# Stage 1 Projects
echo -e "\n${BLUE}Processing Stage 1 - Traditional Software...${NC}"
move_project "Stage-1-Traditional-Software/Entertainment/youtube_project" "Using-AI/Stage-1-Traditional-Software/Entertainment/youtube_project"
move_project "Stage-1-Traditional-Software/Intersecting_domains/renthub" "Using-AI/Stage-1-Traditional-Software/Intersecting_domains/renthub"
move_project "Stage-1-Traditional-Software/Intersecting_domains/resume_builder" "Using-AI/Stage-1-Traditional-Software/Intersecting_domains/resume_builder"

# Copy any other projects from Stage 2
echo -e "\n${BLUE}Processing Stage 2 - AI-Assisted Software...${NC}"
if [ -d "Stage-2-AI-Assisted-Software/Business" ]; then
    find Stage-2-AI-Assisted-Software -mindepth 2 -maxdepth 2 -type d | while read -r proj; do
        domain=$(basename "$(dirname "$proj")")
        project=$(basename "$proj")
        dest="Using-AI/Stage-2-AI-Assisted-Software/$domain/$project"
        move_project "$proj" "$dest"
    done
fi

# Copy any other projects from Stage 3
echo -e "\n${BLUE}Processing Stage 3 - Digital Employees...${NC}"
if [ -d "Stage-3-Digital-Employees/Business" ]; then
    find Stage-3-Digital-Employees -mindepth 2 -maxdepth 2 -type d | while read -r proj; do
        domain=$(basename "$(dirname "$proj")")
        project=$(basename "$proj")
        dest="Using-AI/Stage-3-Digital-Employees/$domain/$project"
        move_project "$proj" "$dest"
    done
fi

# Copy projects from Stage 4
echo -e "\n${BLUE}Processing Stage 4 - Digital Organizations...${NC}"
if [ -d "Stage-4-Digital-Organizations/Multi-Agent-Systems" ]; then
    find Stage-4-Digital-Organizations -mindepth 1 -maxdepth 1 -type d ! -name "Multi-Agent-Systems" | while read -r proj; do
        project=$(basename "$proj")
        dest="Using-AI/Stage-4-Digital-Organizations/$project"
        move_project "$proj" "$dest"
    done
fi

# Copy projects from Stage 5
echo -e "\n${BLUE}Processing Stage 5 - Autonomous Organizations...${NC}"
if [ -d "Stage-5-Autonomous-Organizations/Future-Experiments" ]; then
    find Stage-5-Autonomous-Organizations -mindepth 1 -maxdepth 1 -type d ! -name "Future-Experiments" | while read -r proj; do
        project=$(basename "$proj")
        dest="Using-AI/Stage-5-Autonomous-Organizations/$project"
        move_project "$proj" "$dest"
    done
fi

# Clean up empty directories
echo -e "\n${BLUE}Cleaning up empty Stage directories...${NC}"
for stage_dir in Stage-1-Traditional-Software Stage-2-AI-Assisted-Software Stage-3-Digital-Employees Stage-4-Digital-Organizations Stage-5-Autonomous-Organizations; do
    if [ -d "$stage_dir" ]; then
        # Remove if empty or only has READMEs
        find "$stage_dir" -type f ! -name "README.md" ! -name ".gitkeep" | head -1 > /dev/null 2>&1 || rm -rf "$stage_dir"
    fi
done

echo -e "\n${GREEN}=================================="
echo "✅ Restructure Complete!"
echo "=================================="
echo -e "Next steps:"
echo "1. Review the new structure"
echo "2. Run: git add ."
echo "3. Run: git commit -m 'Move all projects into Using-AI structure'"
echo "4. Run: git push origin repo-restructure"
echo "5. Create a Pull Request on GitHub${NC}"
