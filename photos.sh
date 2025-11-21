#!/usr/bin/env bash

####################################################################################
#                               Get-Winfig Project                                 #
####################################################################################
#                                                                                  #
# Author: Armoghan-ul-Mohmin                                                       #
# LICENSE: MIT                                                                     #
# Date: 2024-06-10                                                                 #
# Description: Script to generate a JSON file from images in the directory         #
# Purpose: Create a photos.json file for WebGallery to retrieve images from GitHub #
#                                                                                  #
####################################################################################

set -euo pipefail

# Directory Setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGES_DIR="${SCRIPT_DIR}/images"
OUTPUT_FILE="${SCRIPT_DIR}/photos.json"
GITHUB_BASE="https://raw.githubusercontent.com/Get-Winfig/winfig-wallpaper/refs/heads/main/images"

# Regex for Validation: (Anything)-(Digits)x(Digits).(Extension)
VALID_PATTERN="^(.+)-([0-9]+)[xX]([0-9]+)\.([a-zA-Z0-9]+)$"

cd "${IMAGES_DIR}" || { echo "images directory not found"; exit 1; }

# Dependency check (jq is still required for safe JSON)
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed."
    echo "Attempting to install jq..."

    if command -v apt-get &>/dev/null; then
        PKG_INSTALL_CMD="sudo apt-get update && sudo apt-get install -y jq"
    elif command -v pacman &>/dev/null; then
        PKG_INSTALL_CMD="sudo pacman -Sy --noconfirm jq"
    elif command -v brew &>/dev/null; then
        PKG_INSTALL_CMD="brew install jq"
    else
        echo "No supported package manager found. Please install 'jq' manually: https://stedolan.github.io/jq/"
        exit 1
    fi

    echo "Running: $PKG_INSTALL_CMD"
    if ! eval "$PKG_INSTALL_CMD"; then
        echo "Installation failed. Please install jq manually and re-run the script."
        exit 1
    fi

    echo "jq installed successfully."
fi

echo "Generating JSON..."
echo '{"photos": []}' > "${OUTPUT_FILE}.tmp"

# Iterate files
find . -maxdepth 1 -type f -print0 | sort -z | while IFS= read -r -d '' file; do

    name="${file#./}"

    if [[ ! "$name" =~ $VALID_PATTERN ]]; then
        echo "⚠️  SKIPPED: $name (Invalid Format)" >&2
        continue
    fi

    # Extract Width and Height directly from filename using Regex groups
    width="${BASH_REMATCH[2]}"
    height="${BASH_REMATCH[3]}"

    # Encode URL (using Python for safety, or use sed if python is unavailable)
    encoded_name=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$name")
    full_url="${GITHUB_BASE}/${encoded_name}"

    ext="${name##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    # Add to JSON via JQ - update the photos array inside the object
    jq  --arg name "$name" \
        --arg src "images/$name" \
        --arg type "$ext" \
        --arg res "${width}X${height}" \
        --arg url "$full_url" \
        '.photos += [{
            name: $name, src: $src, type: $type,
            resolution: $res, url: $url
        }]' "${OUTPUT_FILE}.tmp" > "${OUTPUT_FILE}.tmp.2" && mv "${OUTPUT_FILE}.tmp.2" "${OUTPUT_FILE}.tmp"

    echo "Processed: $name"
done

mv "${OUTPUT_FILE}.tmp" "${OUTPUT_FILE}"
echo "Done."

