#!/usr/bin/env node

/**
 * @fileoverview qr-forge CLI entry point
 * @description Command line interface for generating QR codes with customization options
 * @author CasDevSilva
 * @version 1.0.0
 */

import { program } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import commands and utilities
import { generateQR, generateHTMLEmbed, generateIMGTag } from "../lib/commands/generate.js";
import { processBatch } from "../lib/commands/batch.js";
import { logger, validateOptions, ensureDirectory } from "../lib/utils/index.js";

// Get package version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf8"));

/**
 * CLI Program Configuration
 */
program
    .name("qr-forge")
    .description("Generate QR codes with custom colors, logo embedding, batch processing and multiple output formats")
    .version(pkg.version, "-v, --version", "Display version number")
    .argument("[data]", "Data to encode in QR code (URL, text, etc.)")

    // Output options
    .option("-o, --output <path>", "Output file path (default: ~/.qr-forge/exports/)")
    .option("-f, --format <type>", "Output format: png, svg (default: png)", "png")

    // Styling options
    .option("-s, --size <pixels>", "QR code size in pixels (default: 300)", "300")
    .option("-c, --color <hex>", "QR code color in hex format (default: #000000)", "#000000")
    .option("-b, --background <hex>", "Background color in hex format (default: #FFFFFF)", "#FFFFFF")
    .option("-m, --margin <number>", "QR code margin (default: 4)", "4")

    // Logo options
    .option("-l, --logo <path>", "Path to logo image to embed in QR center")
    .option("--logo-size <percent>", "Logo size as percentage of QR (5-40, default: 20)", "20")

    // Batch processing
    .option("--batch <file>", "Path to file with data list (one item per line)")

    // Output format options
    .option("--html", "Output as HTML file with embedded QR")
    .option("--img", "Output as IMG tag with base64 data URL")

    // Action handler
    .action(async (data, options) => {
        try {
            // Validate inputs
            const validation = validateOptions(options, data);

            if (!validation.valid) {
                logger.error("Validation failed:");
                validation.errors.forEach(err => logger.error(`  ${err}`));
                process.exit(1);
            }

            // Batch processing mode
            if (options.batch) {
                await handleBatchMode(options);
                return;
            }

            // HTML embed mode
            if (options.html) {
                await handleHTMLMode(data, options);
                return;
            }

            // IMG tag mode
            if (options.img) {
                await handleIMGMode(data, options);
                return;
            }

            // Standard single QR generation
            await handleStandardMode(data, options);
        } catch (error) {
            logger.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

/**
 * Handles batch processing mode
 * @param {object} options - CLI options
 */
async function handleBatchMode(options) {
    logger.header("QR-Forge Batch Mode");
    const result = await processBatch(options.batch, options);

    if (result.failed > 0) {
        process.exit(1);
    }
}

/**
 * Handles HTML embed output mode
 * @param {string} data - Data to encode
 * @param {object} options - CLI options
 */
async function handleHTMLMode(data, options) {
    logger.processing("Generating HTML embed...");

    const html = await generateHTMLEmbed(data, options);

    if (options.output) {
        const { writeFileSync } = await import("fs");
        const outputPath = options.output.endsWith(".html")
            ? options.output
            : `${options.output}.html`;

        writeFileSync(outputPath, html);
        logger.success("HTML file generated successfully");
        logger.saved(outputPath);
    } else {
        // Output to console
        logger.divider();
        logger.raw(html);
        logger.divider();
        logger.info("Use -o <path> to save to file");
    }
}

/**
 * Handles IMG tag output mode
 * @param {string} data - Data to encode
 * @param {object} options - CLI options
 */
async function handleIMGMode(data, options) {
    logger.processing("Generating IMG tag with base64...");

    const imgTag = await generateIMGTag(data, options);

    logger.divider();
    logger.raw(imgTag);
    logger.divider();
    logger.info("Copy the above IMG tag to use in your HTML");
}

/**
 * Handles standard single QR generation mode
 * @param {string} data - Data to encode
 * @param {object} options - CLI options
 */
async function handleStandardMode(data, options) {
    logger.header("QR-Forge");

    // Show configuration
    const format = options.format.toUpperCase();
    const hasLogo = options.logo ? "Yes" : "No";

    logger.info(`Data: ${truncate(data, 50)}`);
    logger.info(`Format: ${format} | Size: ${options.size}px | Logo: ${hasLogo}`);

    // Generate QR
    const outputPath = await generateQR(data, options);
}

/**
 * Truncates string for display
 * @param {string} str - String to truncate
 * @param {number} max - Max length
 * @returns {string}
 */
function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.substring(0, max - 3) + "..." : str;
}

// Parse CLI arguments
program.parse();

// Show help if no arguments provided
if (process.argv.length === 2) {
    program.help();
}