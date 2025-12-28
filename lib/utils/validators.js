/**
 * @fileoverview Input validation utilities for qr-forge CLI
 * @description Validates hex colors, file paths, sizes and other user inputs
 */

import fs from "fs";
import path from "path";

/**
 * Validates hexadecimal color format
 * Accepts: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHexColor = (color) => {
    if (!color || typeof color !== "string") return false;
    const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    return hexRegex.test(color);
};

/**
 * Normalizes hex color to 8-character format (RRGGBBAA)
 * @param {string} color - Hex color to normalize
 * @returns {string} Normalized hex color with alpha
 */
export const normalizeHexColor = (color) => {
    if (!isValidHexColor(color)) return "#000000FF";

    let hex = color.slice(1).toUpperCase();

    switch (hex.length) {
        case 3: // #RGB -> #RRGGBBFF
            hex = hex.split("").map(c => c + c).join("") + "FF";
            break;
        case 4: // #RGBA -> #RRGGBBAA
            hex = hex.split("").map(c => c + c).join("");
            break;
        case 6: // #RRGGBB -> #RRGGBBFF
            hex = hex + "FF";
            break;
        // case 8: already correct format
    }

    return `#${hex}`;
};

/**
 * Validates file path exists
 * @param {string} filepath - Path to validate
 * @returns {boolean} True if file exists
 */
export const fileExists = (filepath) => {
    try {
        return fs.existsSync(filepath) && fs.statSync(filepath).isFile();
    } catch {
        return false;
    }
};

/**
 * Validates directory exists or can be created
 * @param {string} dirpath - Directory path to validate
 * @returns {boolean} True if directory exists or was created
 */
export const ensureDirectory = (dirpath) => {
    try {
        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath, { recursive: true });
        }
        return true;
    } catch {
        return false;
    }
};

/**
 * Validates output file extension matches format
 * @param {string} filepath - Output file path
 * @param {string} format - Expected format (png, svg)
 * @returns {boolean} True if extension matches format
 */
export const isValidOutputPath = (filepath, format = "png") => {
    if (!filepath || typeof filepath !== "string") return false;
    const ext = path.extname(filepath).toLowerCase().slice(1);
    return ext === format.toLowerCase();
};

/**
 * Validates image file for logo (png, jpg, jpeg, svg)
 * @param {string} filepath - Path to logo file
 * @returns {boolean} True if valid image file
 */
export const isValidLogoFile = (filepath) => {
    if (!fileExists(filepath)) return false;
    const validExtensions = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
    const ext = path.extname(filepath).toLowerCase();
    return validExtensions.includes(ext);
};

/**
 * Validates numeric value within range
 * @param {string|number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if valid number in range
 */
export const isValidNumber = (value, min = 0, max = Infinity) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validates QR format type
 * @param {string} format - Format to validate
 * @returns {boolean} True if valid format
 */
export const isValidFormat = (format) => {
    const validFormats = ["png", "svg", "terminal"];
    return validFormats.includes(format?.toLowerCase());
};

/**
 * Validates batch file contains valid data
 * @param {string} filepath - Path to batch file
 * @returns {{valid: boolean, lines: string[], error: string|null}}
 */
export const validateBatchFile = (filepath) => {
    if (!fileExists(filepath)) {
        return { valid: false, lines: [], error: "Batch file not found" };
    }

    try {
        const content = fs.readFileSync(filepath, "utf8");
        const lines = content
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            return { valid: false, lines: [], error: "Batch file is empty" };
        }

        return { valid: true, lines, error: null };
    } catch (err) {
        return { valid: false, lines: [], error: `Failed to read batch file: ${err.message}` };
    }
};

/**
 * Validates all CLI options and returns errors array
 * @param {object} options - CLI options object
 * @param {string} data - Input data string
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateOptions = (options, data) => {
    const errors = [];

    // Data validation (required unless batch mode)
    if (!data && !options.batch) {
        errors.push("Data argument is required (or use --batch for batch processing)");
    }

    // Color validation
    if (options.color && !isValidHexColor(options.color)) {
        errors.push(`Invalid color format: "${options.color}". Use hex format (#RGB, #RRGGBB, or #RRGGBBAA)`);
    }

    if (options.background && !isValidHexColor(options.background)) {
        errors.push(`Invalid background format: "${options.background}". Use hex format (#RGB, #RRGGBB, or #RRGGBBAA)`);
    }

    // Size validation
    if (options.size && !isValidNumber(options.size, 50, 2000)) {
        errors.push(`Invalid size: "${options.size}". Must be between 50 and 2000 pixels`);
    }

    // Margin validation
    if (options.margin && !isValidNumber(options.margin, 0, 20)) {
        errors.push(`Invalid margin: "${options.margin}". Must be between 0 and 20`);
    }

    // Format validation
    if (options.format && !isValidFormat(options.format)) {
        errors.push(`Invalid format: "${options.format}". Supported formats: png, svg`);
    }

    // Logo validation
    if (options.logo && !isValidLogoFile(options.logo)) {
        errors.push(`Invalid logo file: "${options.logo}". File must exist and be a valid image (png, jpg, svg, webp)`);
    }

    // Logo size validation
    if (options.logoSize && !isValidNumber(options.logoSize, 5, 40)) {
        errors.push(`Invalid logo size: "${options.logoSize}". Must be between 5% and 40%`);
    }

    // Batch file validation
    if (options.batch) {
        const batchResult = validateBatchFile(options.batch);
        if (!batchResult.valid) {
            errors.push(batchResult.error);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

export default {
    isValidHexColor,
    normalizeHexColor,
    fileExists,
    ensureDirectory,
    isValidOutputPath,
    isValidLogoFile,
    isValidNumber,
    isValidFormat,
    validateBatchFile,
    validateOptions
};