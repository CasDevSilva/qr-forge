/**
 * @fileoverview Single QR code generation command
 * @description Handles generation of individual QR codes with all options
 */

import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import os from "os";
import {
    logger,
    buildQROptions,
    buildTerminalOptions,
    getOutputFormat,
    shouldEmbedLogo,
    ensureDirectory
} from "../utils/index.js";
import { embedLogo } from "../utils/logo-embed.js";

/**
 * Default export directory for QR codes
 */
const DEFAULT_EXPORT_DIR = path.join(os.homedir(), ".qr-forge", "exports");

/**
 * Generates a single QR code and saves to file
 * @param {string} data - Data to encode in QR
 * @param {object} options - CLI options
 * @returns {Promise<string>} Path to saved file
 */
export const generateQR = async (data, options = {}) => {
    // Build QR options from CLI options
    const qrOptions = buildQROptions(options);
    const format = getOutputFormat(options);

    // Determine output path
    const outputPath = resolveOutputPath(options.output, format);
    const outputDir = path.dirname(outputPath);

    // Ensure output directory exists
    if (!ensureDirectory(outputDir)) {
        throw new Error(`Failed to create output directory: ${outputDir}`);
    }

    // Display QR in terminal (always)
    await displayTerminalQR(data, options);

    // Generate QR based on format
    if (format === "svg") {
        await generateSVG(data, outputPath, qrOptions);
    } else {
        await generatePNG(data, outputPath, qrOptions, options);
    }

    return outputPath;
};

/**
 * Generates PNG QR code, optionally with embedded logo
 * @param {string} data - Data to encode
 * @param {string} outputPath - Output file path
 * @param {object} qrOptions - QR generation options
 * @param {object} cliOptions - Original CLI options (for logo)
 */
const generatePNG = async (data, outputPath, qrOptions, cliOptions) => {
    if (shouldEmbedLogo(cliOptions)) {
        // Generate QR as buffer first
        logger.processing("Generating QR code with logo...");
        const qrBuffer = await QRCode.toBuffer(data, { ...qrOptions, type: "png" });

        // Embed logo
        const finalBuffer = await embedLogo(qrBuffer, cliOptions.logo, cliOptions);

        // Write to file
        fs.writeFileSync(outputPath, finalBuffer);
        logger.success("QR code with logo generated successfully");
    } else {
        // Standard PNG generation
        logger.processing("Generating QR code...");
        await QRCode.toFile(outputPath, data, qrOptions);
        logger.success("QR code generated successfully");
    }

    logger.saved(outputPath);
};

/**
 * Generates SVG QR code
 * @param {string} data - Data to encode
 * @param {string} outputPath - Output file path
 * @param {object} qrOptions - QR generation options
 */
const generateSVG = async (data, outputPath, qrOptions) => {
    logger.processing("Generating SVG QR code...");

    const svgString = await QRCode.toString(data, {
        ...qrOptions,
        type: "svg"
    });

    fs.writeFileSync(outputPath, svgString);
    logger.success("SVG QR code generated successfully");
    logger.saved(outputPath);
};

/**
 * Displays QR code in terminal
 * @param {string} data - Data to encode
 * @param {object} options - CLI options
 */
const displayTerminalQR = async (data, options) => {
    try {
        const terminalOptions = buildTerminalOptions(options);
        const terminalQR = await QRCode.toString(data, terminalOptions);
        logger.divider();
        logger.qr(terminalQR);
        logger.divider();
    } catch (err) {
        logger.warn(`Could not display terminal preview: ${err.message}`);
    }
};

/**
 * Resolves output path with defaults
 * @param {string|undefined} output - User specified output
 * @param {string} format - Output format
 * @returns {string} Resolved absolute output path
 */
const resolveOutputPath = (output, format) => {
    if (!output) {
        // Default: ~/.qr-forge/exports/qr-{timestamp}.{format}
        const timestamp = Date.now();
        return path.join(DEFAULT_EXPORT_DIR, `qr-${timestamp}.${format}`);
    }

    // If output is just a filename, put in default directory
    if (!path.isAbsolute(output) && !output.includes(path.sep)) {
        return path.join(DEFAULT_EXPORT_DIR, output);
    }

    return path.resolve(output);
};

/**
 * Generates QR code as Data URL (base64)
 * @param {string} data - Data to encode
 * @param {object} options - CLI options
 * @returns {Promise<string>} Data URL string
 */
export const generateDataURL = async (data, options = {}) => {
    const qrOptions = buildQROptions(options);
    return await QRCode.toDataURL(data, qrOptions);
};

/**
 * Generates HTML embed code with QR as inline image
 * @param {string} data - Data to encode
 * @param {object} options - CLI options
 * @returns {Promise<string>} HTML string with embedded QR
 */
export const generateHTMLEmbed = async (data, options = {}) => {
    const dataUrl = await generateDataURL(data, options);
    const size = options.size || 300;

    return `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QR Code - qr-forge</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f5f5f5;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .qr-container {
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        box-shadow: 0 4px 24px rgba(0,0,0,0.1);
                        text-align: center;
                    }
                    .qr-container img {
                        display: block;
                        margin: 0 auto 16px;
                    }
                    .qr-data {
                        color: #666;
                        font-size: 14px;
                        word-break: break-all;
                        max-width: ${size}px;
                    }
                    .qr-footer {
                        margin-top: 16px;
                        color: #999;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                <img src="${dataUrl}" alt="QR Code" width="${size}" height="${size}">
                <p class="qr-data">${escapeHtml(data)}</p>
                <p class="qr-footer">Generated with qr-forge</p>
                </div>
            </body>
        </html>
    `;
};

/**
 * Generates IMG tag with embedded QR (data URL)
 * @param {string} data - Data to encode
 * @param {object} options - CLI options
 * @returns {Promise<string>} IMG tag HTML string
 */
export const generateIMGTag = async (data, options = {}) => {
    const dataUrl = await generateDataURL(data, options);
    const size = options.size || 300;
    return `<img src="${dataUrl}" alt="QR Code" width="${size}" height="${size}">`;
};

/**
 * Escapes HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
const escapeHtml = (str) => {
    const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
    };
    return str.replace(/[&<>"']/g, char => htmlEntities[char]);
};

export default {
    generateQR,
    generateDataURL,
    generateHTMLEmbed,
    generateIMGTag
};