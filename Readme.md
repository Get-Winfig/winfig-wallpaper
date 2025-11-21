<h1 align="center">Winfig Wallpapers</h1>

![Winfig Banner](.github/images/Banner.png)

This repository contains a collection of high-quality wallpapers specifically designed and collected from different sources to enhance the visual appeal of your Windows Environment. Whether you're looking for stunning landscapes, abstract designs, or minimalist themes, you'll find a variety of options to suit your taste.

Images live in the `images` directory and use short numeric filenames (for example `001-3904x2240.png`, `002-4032x2688.jpg`, etc) to make it easy to reference them in documentation and issues.

## Usage
To use these wallpapers:

1. **Browse** the `images` directory to find wallpapers you like
2. **Download** the desired image(s) by clicking on them and selecting "Download"
3. **Set as wallpaper**:
   - Right-click on your desktop → "Personalize" → "Background"
   - Or go to Settings → Personalization → Background
   - Select "Picture" and browse to your downloaded image

## Development Scripts

This repository includes utility scripts to help maintain the wallpaper collection:

### 🔧 Image Renaming Script

The rename script automatically standardizes image filenames to follow our naming convention.

**Naming Convention:** `XXX-WIDTHxHEIGHT.extension` (e.g., `042-3840x2160.png`)

#### Usage

**Bash (Linux/Mac/WSL):**
```bash
chmod +x rename.sh
./rename.sh
```

**PowerShell (Windows/Linux/Mac):**
```powershell
./rename.ps1
```

#### Features
- Automatically detects image dimensions using ImageMagick
- Only renames files that don't follow the standard format
- Increments from the highest existing number
- Prevents filename conflicts
- Cross-platform compatibility

#### Requirements
- **ImageMagick** (`identify` command)
  - Linux: `sudo apt-get install imagemagick` or `sudo pacman -S imagemagick`
  - Mac: `brew install imagemagick`
  - Windows: Download from [ImageMagick website](https://imagemagick.org/script/download.php)

### 📄 JSON Generation Script

The photos script generates a `photos.json` file containing metadata for all wallpapers.

#### Usage

**Bash:**
```bash
chmod +x photos.sh
./photos.sh
```

#### Features
- Generates structured JSON with image metadata
- Includes direct GitHub raw URLs for each image
- Validates filename format before processing
- Extracts dimensions from filenames
- URL-encodes filenames for web compatibility

#### Requirements
- **jq** (JSON processor)
  - Linux: `sudo apt-get install jq` or `sudo pacman -S jq`
  - Mac: `brew install jq`
  - Windows: Download from [jq website](https://stedolan.github.io/jq/)

#### Output Format
```json
{
  "photos": [
    {
      "name": "001-1920x1080.png",
      "src": "images/001-1920x1080.png",
      "type": "png",
      "resolution": "1920X1080",
      "url": "https://raw.githubusercontent.com/Get-Winfig/winfig-wallpaper/main/images/001-1920x1080.png"
    }
  ]
}
```

## Copyright and Attribution

**Important:** We respect intellectual property rights.

If you are the original creator of any wallpaper in this collection and would like it to be:
- **Removed**: Please open an issue with the filename and proof of ownership
- **Properly attributed**: Please provide the attribution details you'd like displayed

Our goal is to respect the rights of original creators while providing a valuable resource for Windows users.

## Contributing

We welcome contributions to improve the Winfig wallpapers collection! Here's how you can help:

### How to Contribute
1.  **Fork** this repository
2.  **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3.  **Make** your changes with clear, descriptive commits
4.  **Push** to your branch (`git push origin feature/amazing-feature`)
5.  **Submit** a Pull Request with a detailed description

### Setup GitHooks
To maintain code quality, we use GitHooks for pre-commit checks. To set them up locally, run the following command in your terminal:

On Linux/Mac:

```bash
sudo chmod +x ./setup-githooks.sh && ./setup-githooks.sh
```

On Windows:

```cmd
setup-githooks.bat
```

### Wallpaper Submission Guidelines
- **Quality**: Submit high-resolution images (minimum 1920x1080)
- **Format**: PNG preferred, JPG acceptable
- **Naming**: Follow the convention `XXX-WIDTHxHEIGHT.extension` (e.g., `042-3840x2160.png`)
- **Originality**: Only submit wallpapers you have rights to or are in public domain
- **File size**: Keep individual files under 10MB when possible

### General Guidelines
- Follow existing repository structure
- Test that images display correctly
- Include source/attribution information when applicable
- Keep commits focused and atomic


### Contribution Guidelines
- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation if needed
- Keep commits focused and atomic

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
