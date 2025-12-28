# qr-forge

> CLI tool to generate QR codes with custom colors, logo embedding, batch processing and multiple output formats.

[![npm version](https://img.shields.io/npm/v/qr-forge.svg)](https://www.npmjs.com/package/qr-forge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **Custom Colors** - Set QR and background colors with hex values
- 🖼️ **Logo Embedding** - Embed logos in QR center with configurable size
- 📦 **Batch Processing** - Generate multiple QR codes from a file
- 📄 **Multiple Formats** - PNG, SVG, HTML embed, IMG tag
- 🖥️ **Terminal Preview** - See QR code in terminal before saving
- ⚡ **Zero Config** - Works out of the box with sensible defaults

## Installation

```bash
npm install -g qr-forge
```

## Usage

### Basic

```bash
# Generate QR code (saved to ~/.qr-forge/exports/)
qr-forge "https://github.com/NeiHR"

# Specify output path
qr-forge "Hello World" -o hello.png

# Generate SVG
qr-forge "https://example.com" -f svg -o example.svg
```

### Custom Styling

```bash
# Custom colors
qr-forge "https://mysite.com" -c "#1a1a2e" -b "#eaeaea" -o branded.png

# Custom size and margin
qr-forge "data123" -s 500 -m 2 -o large.png
```

### Logo Embedding

```bash
# Embed logo in center
qr-forge "https://mycompany.com" -l ./logo.png -o company-qr.png

# Custom logo size (percentage of QR)
qr-forge "https://brand.com" -l ./brand.png --logo-size 30 -o branded.png
```

### Batch Processing

```bash
# Create batch file (urls.txt)
# https://site1.com
# https://site2.com
# https://site3.com

# Generate all QR codes
qr-forge --batch urls.txt -o ./qrcodes/

# Batch with custom styling
qr-forge --batch urls.txt -c "#000" -s 400 -o ./output/
```

### HTML & IMG Output

```bash
# Generate HTML file with embedded QR
qr-forge "https://example.com" --html -o qrcode.html

# Output IMG tag to console
qr-forge "https://example.com" --img
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output` | `-o` | Output file path | `~/.qr-forge/exports/` |
| `--format` | `-f` | Output format (png, svg) | `png` |
| `--size` | `-s` | QR size in pixels | `300` |
| `--color` | `-c` | QR color (hex) | `#000000` |
| `--background` | `-b` | Background color (hex) | `#FFFFFF` |
| `--margin` | `-m` | QR margin | `4` |
| `--logo` | `-l` | Logo image path | - |
| `--logo-size` | - | Logo size (5-40%) | `20` |
| `--batch` | - | Batch file path | - |
| `--html` | - | Output as HTML | `false` |
| `--img` | - | Output as IMG tag | `false` |
| `--version` | `-v` | Show version | - |
| `--help` | `-h` | Show help | - |

## Output Directory

By default, QR codes are saved to `~/.qr-forge/exports/`. You can override this with the `-o` option.

```bash
# Uses default directory
qr-forge "data"
# Output: ~/.qr-forge/exports/qr-1703698800000.png

# Custom path
qr-forge "data" -o ./my-qr.png
# Output: ./my-qr.png
```

## Color Formats

Supports hex colors in multiple formats:

- `#RGB` → `#F00` (red)
- `#RRGGBB` → `#FF0000` (red)
- `#RGBA` → `#F00F` (red, full opacity)
- `#RRGGBBAA` → `#FF0000FF` (red, full opacity)

## Logo Requirements

- Supported formats: PNG, JPG, JPEG, SVG, WebP
- Recommended: Square images with transparent background
- Logo size: 5-40% of QR code (default: 20%)
- Note: Logo embedding only works with PNG output

## Error Correction

When embedding logos, QR-Forge automatically uses high error correction level (H) to ensure the QR code remains scannable even with the center obscured.

## Programmatic Usage

```javascript
import { generateQR, processBatch, generateHTMLEmbed } from "qr-forge";

// Generate single QR
await generateQR("https://example.com", {
  output: "./qr.png",
  color: "#1a1a2e",
  size: "400"
});

// Batch processing
await processBatch("./urls.txt", {
  output: "./qrcodes/",
  format: "png"
});

// Get HTML embed
const html = await generateHTMLEmbed("https://example.com", { size: "300" });
```

## License

MIT © [CasDevSilva](https://github.com/CasDevSilva)
