#!/usr/bin/env bash
# filepath: f:\Github\Get-Winfig\winfig-wallpaper\rename.sh

##########################################################################################
#                               Get-Winfig Project                                       #
##########################################################################################
#                                                                                        #
# Author: Armoghan-ul-Mohmin                                                             #
# LICENSE: MIT                                                                           #
# Date: 2024-06-11                                                                       #
# Description: Script to rename photos in Images directory (XXX-WIDTHxHEIGHT.extension)  #
# Purpose: Rename photos in the Images directory to a standardized format                #
#                                                                                        #
##########################################################################################

set -euo pipefail

# Directory Setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGES_DIR="${SCRIPT_DIR}/images"
cd "${IMAGES_DIR}" || { echo "images directory not found"; exit 1; }

# More strict standard format pattern: exactly 3 digits, dash, dimensions, dot, extension
STANDARD_PATTERN="^[0-9]{3}-[0-9]+[xX][0-9]+\.[a-zA-Z0-9]+$"

# Find the highest existing number from PROPERLY formatted files only
highest_num=0
for file in *; do
    if [[ -f "$file" && "$file" =~ ^([0-9]{3})-[0-9]+[xX][0-9]+\.[a-zA-Z0-9]+$ ]]; then
        num="${BASH_REMATCH[1]}"
        # Remove leading zeros for comparison
        num=$((10#$num))
        if (( num > highest_num )); then
            highest_num=$num
        fi
    fi
done

echo "Starting from number: $((highest_num + 1))"
echo "Renaming photos that don't follow standard format (XXX-WIDTHxHEIGHT.extension)..."

# Check if identify command exists
if ! command -v identify &> /dev/null; then
    echo "Error: identify is required but not installed."
    echo "Attempting to install identify..."

    if command -v apt-get &>/dev/null; then
        PKG_INSTALL_CMD="sudo apt-get update && sudo apt-get install -y imagemagick"
    elif command -v pacman &>/dev/null; then
        PKG_INSTALL_CMD="sudo pacman -Sy --noconfirm imagemagick"
    elif command -v brew &>/dev/null; then
        PKG_INSTALL_CMD="brew install imagemagick"
    else
        echo "No supported package manager found. Please install 'imagemagick' manually: https://imagemagick.org/script/download.php"
        exit 1
    fi

    echo "Running: $PKG_INSTALL_CMD"
    if ! eval "$PKG_INSTALL_CMD"; then
        echo "Installation failed. Please install identify manually and re-run the script."
        exit 1
    fi

    echo "identify installed successfully."
fi

current_num=$((highest_num + 1))

# Use process substitution instead of pipeline to preserve variables
while IFS= read -r -d '' file; do
    name="${file#./}"

    # Debug: Show what we're checking
    echo "Checking: $name"

    # Skip if already follows STRICT standard format (exactly 3 digits-dimensions.ext)
    if [[ "$name" =~ ^[0-9]{3}-[0-9]+[xX][0-9]+\.[a-zA-Z0-9]+$ ]]; then
        # echo "✓ Already standard: $name"
        continue
    fi

    # Get image dimensions
    dimensions=$(identify -format "%wx%h" "$name" 2>/dev/null || echo "")
    if [[ -n "$dimensions" ]]; then
        extension="${name##*.}"
        # Format number with leading zeros (3 digits)
        formatted_num=$(printf "%03d" $current_num)
        new_name="${formatted_num}-${dimensions}.${extension}"

        # Check if new name already exists
        while [[ -f "$new_name" ]]; do
            ((current_num++))
            formatted_num=$(printf "%03d" $current_num)
            new_name="${formatted_num}-${dimensions}.${extension}"
        done

        mv "$name" "$new_name"
        echo "Renamed: $new_name"
        echo ""
        ((current_num++))
    else
        echo "Warning: Could not get dimensions for $name. Skipping."
    fi
done < <(find . -maxdepth 1 -type f -print0 | sort -z)

echo "Renaming completed."
