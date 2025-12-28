/**
 * @fileoverview Batch QR code generation command
 * @description Processes multiple QR codes from a file (one data per line)
 */

import fs from "fs";
import path from "path";
import os from "os";
import QRCode from "qrcode";
import {
    logger,
    buildQROptions,
    validateBatchFile,
    ensureDirectory,
    getOutputFormat,
    shouldEmbedLogo
} from "../utils/index.js";
import { embedLogo } from "../utils/logo-embed.js";

/**
 * Default export directory for batch QR codes
 */
const DEFAULT_EXPORT_DIR = path.join(os.homedir(), ".qr-forge", "exports");

/**
 * Processes batch file and generates multiple QR codes
 * @param {string} batchFilePath - Path to file containing data (one per line)
 * @param {object} options - CLI options
 * @returns {Promise<{success: number, failed: number, outputDir: string}>}
 */
export const processBatch = async (batchFilePath, options = {}) => {
    // Validate batch file
    const validation = validateBatchFile(batchFilePath);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const { lines } = validation;
    const format = getOutputFormat(options);
    const qrOptions = buildQROptions(options);

    // Determine output directory
    const batchFileName = path.basename(batchFilePath, path.extname(batchFilePath));
    const outputDir = resolveOutputDir(options.output, batchFileName);

    // Ensure output directory exists
    if (!ensureDirectory(outputDir)) {
        throw new Error(`Failed to create output directory: ${outputDir}`);
    }

    logger.header(`Batch Processing: ${lines.length} QR codes`);
    logger.info(`Output directory: ${outputDir}`);
    logger.info(`Format: ${format.toUpperCase()}`);
    logger.divider();

    let success = 0;
    let failed = 0;
    const uselogo = shouldEmbedLogo(options);

    // Process each line
    for (let i = 0; i < lines.length; i++) {
        const data = lines[i];
        const filename = `qr-${String(i + 1).padStart(3, "0")}.${format}`;
        const outputPath = path.join(outputDir, filename);

        try {
            logger.progress(i + 1, lines.length, truncateData(data));

            if (format === "svg") {
                // SVG generation
                const svgString = await QRCode.toString(data, { ...qrOptions, type: "svg" });
                fs.writeFileSync(outputPath, svgString);
            } else if (uselogo) {
                // PNG with logo
                const qrBuffer = await QRCode.toBuffer(data, { ...qrOptions, type: "png" });
                const finalBuffer = await embedLogo(qrBuffer, options.logo, options);
                fs.writeFileSync(outputPath, finalBuffer);
            } else {
                // Standard PNG
                await QRCode.toFile(outputPath, data, qrOptions);
            }

            success++;
        } catch (err) {
            logger.error(`Failed to generate QR for: "${truncateData(data)}" - ${err.message}`);
            failed++;
        }
    }

    // Summary
    logger.divider();
    logger.header("Batch Processing Complete");
    logger.success(`Generated: ${success} QR codes`);

    if (failed > 0) {
        logger.error(`Failed: ${failed} QR codes`);
    }

    logger.saved(outputDir);

    return { success, failed, outputDir };
};

/**
 * Resolves output directory for batch processing
 * @param {string|undefined} output - User specified output directory
 * @param {string} batchName - Name of batch file (used for folder naming)
 * @returns {string} Resolved absolute output directory path
 */
const resolveOutputDir = (output, batchName) => {
    const timestamp = Date.now();
    const folderName = `${batchName}_batch_${timestamp}`;

    if (!output) {
        // Default: ~/.qr-forge/exports/{batchName}_batch_{timestamp}/
        return path.join(DEFAULT_EXPORT_DIR, folderName);
    }

    // Check if output is a directory path or has extension (filename)
    const hasExtension = path.extname(output).length > 0;

    if (hasExtension) {
        // User provided a filename, use its directory
        const dir = path.dirname(output);
        return path.isAbsolute(dir) ? dir : path.join(DEFAULT_EXPORT_DIR, dir);
    }

    // Output is a directory path
    if (path.isAbsolute(output)) {
        return output;
    }

    return path.join(DEFAULT_EXPORT_DIR, output);
};

/**
 * Truncates data string for display
 * @param {string} data - Data to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
const truncateData = (data, maxLength = 40) => {
    if (data.length <= maxLength) return data;
    return data.substring(0, maxLength - 3) + "...";
};

/**
 * Creates a batch file from array of data
 * @param {string[]} dataArray - Array of data strings
 * @param {string} outputPath - Path to save batch file
 */
export const createBatchFile = (dataArray, outputPath) => {
    const content = dataArray.join("\n");
    fs.writeFileSync(outputPath, content, "utf8");
    logger.success(`Batch file created: ${outputPath}`);
};

export default {
    processBatch,
    createBatchFile
};