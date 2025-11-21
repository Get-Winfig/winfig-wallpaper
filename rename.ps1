#!/usr/bin/env pwsh

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

$ErrorActionPreference = "Stop"

# Directory Setup
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ImagesDir = Join-Path $ScriptDir "images"

if (-not (Test-Path $ImagesDir)) {
    Write-Host "images directory not found" -ForegroundColor Red
    exit 1
}

Set-Location $ImagesDir

# More strict standard format pattern: exactly 3 digits, dash, dimensions, dot, extension
$StandardPattern = "^[0-9]{3}-[0-9]+[xX][0-9]+\.[a-zA-Z0-9]+$"

# Find the highest existing number from PROPERLY formatted files only
$HighestNum = 0

Get-ChildItem -File | ForEach-Object {
    $File = $_.Name
    if ($File -match "^([0-9]{3})-[0-9]+[xX][0-9]+\.[a-zA-Z0-9]+$") {
        $Num = [int]$Matches[1]
        if ($Num -gt $HighestNum) {
            $HighestNum = $Num
        }
    }
}

Write-Host "Starting from number: $($HighestNum + 1)"
Write-Host "Renaming photos that don't follow standard format (XXX-WIDTHxHEIGHT.extension)..."

# Check if identify command exists
$IdentifyExists = Get-Command identify -ErrorAction SilentlyContinue
if (-not $IdentifyExists) {
    Write-Host "Error: 'identify' command not found. Please install ImageMagick." -ForegroundColor Red
    exit 1
}

$CurrentNum = $HighestNum + 1

# Get all files and sort them
$Files = Get-ChildItem -File | Sort-Object Name

foreach ($FileObj in $Files) {
    $Name = $FileObj.Name

    # Debug: Show what we're checking
    Write-Host "Checking: $Name"

    # Skip if already follows STRICT standard format (exactly 3 digits-dimensions.ext)
    if ($Name -match $StandardPattern) {
        # Write-Host "✓ Already standard: $Name" -ForegroundColor Green
        continue
    }

    # Get image dimensions
    try {
        $Dimensions = & identify -format "%wx%h" $Name 2>$null
        if ($LASTEXITCODE -eq 0 -and $Dimensions) {
            $Extension = [System.IO.Path]::GetExtension($Name).Substring(1)

            # Format number with leading zeros (3 digits)
            $FormattedNum = "{0:D3}" -f $CurrentNum
            $NewName = "$FormattedNum-$Dimensions.$Extension"

            # Check if new name already exists
            while (Test-Path $NewName) {
                $CurrentNum++
                $FormattedNum = "{0:D3}" -f $CurrentNum
                $NewName = "$FormattedNum-$Dimensions.$Extension"
            }

            Rename-Item $Name $NewName
            Write-Host "Renamed: $NewName"
            Write-Host ""
            $CurrentNum++
        }
        else {
            Write-Host "Warning: Could not get dimensions for $Name. Skipping." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Warning: Could not get dimensions for $Name. Skipping." -ForegroundColor Yellow
    }
}

Write-Host "Renaming completed."
