/**
 * @fileoverview QR Code options builder
 * @description Constructs properly formatted options object for qrcode library
 */

import { normalizeHexColor } from "./validators.js";

/**
 * Default QR code configuration values
 */
const DEFAULTS = {
    width: 300,
    margin: 4,
    darkColor: "#000000FF",
    lightColor: "#FFFFFFFF",
    errorCorrectionLevel: "M", // L, M, Q, H (H is best for logos)
};

/**
 * Builds QR code options object from CLI options
 * @param {object} cliOptions - Options from commander
 * @returns {object} Formatted options for qrcode library
 */
export const buildQROptions = (cliOptions = {}) => {
    const options = {
        errorCorrectionLevel: cliOptions.logo ? "H" : DEFAULTS.errorCorrectionLevel,
        margin: cliOptions.margin
            ? parseInt(cliOptions.margin, 10)
            : DEFAULTS.margin,
        width: cliOptions.size ? parseInt(cliOptions.size, 10) : DEFAULTS.width,
        color: {
            dark: normalizeHexColor(cliOptions.color || DEFAULTS.darkColor),
            light: normalizeHexColor(cliOptions.background || DEFAULTS.lightColor),
        },
    };

    return options;
};

/**
 * Builds terminal output options for QR display
 * @param {object} cliOptions - Options from commander
 * @returns {object} Formatted options for terminal output
 */
    export const buildTerminalOptions = (cliOptions = {}) => {
        return {
            type: "terminal",
            small: true,
            margin: cliOptions.margin
                ? parseInt(cliOptions.margin, 10)
                : DEFAULTS.margin,
            errorCorrectionLevel: cliOptions.logo ? "H" : DEFAULTS.errorCorrectionLevel,
        };
};

/**
 * Gets the output format from options or filename
 * @param {object} options - CLI options
 * @returns {string} Output format (png, svg)
 */
export const getOutputFormat = (options) => {
    if (options.format) {
        return options.format.toLowerCase();
    }

    if (options.output) {
        const ext = options.output.split(".").pop().toLowerCase();

        if (["png", "svg"].includes(ext)) {
            return ext;
        }
    }

return "png";
};

/**
 * Determines if logo embedding is requested and valid
 * @param {object} options - CLI options
 * @returns {boolean} True if logo should be embedded
 */
export const shouldEmbedLogo = (options) => {
    return Boolean(options.logo) && getOutputFormat(options) === "png";
};

/**
 * Gets logo size as decimal (percentage / 100)
 * @param {object} options - CLI options
 * @returns {number} Logo size as decimal (0.05 to 0.40)
 */
export const getLogoSize = (options) => {
    const size = parseInt(options.logoSize, 10) || 20;
    return Math.min(Math.max(size, 5), 40) / 100;
};

export default {
    buildQROptions,
    buildTerminalOptions,
    getOutputFormat,
    shouldEmbedLogo,
    getLogoSize,
    DEFAULTS,
};
