/**
 * @fileoverview Styled console logger with icons and colors
 * @description Provides consistent, professional terminal output using chalk and figures
 */

import chalk from "chalk";
import figures from "figures";

/**
 * Logger object with styled output methods
 * Uses chalk for colors and figures for terminal icons
 */
export const logger = {
    /**
     * Success message with green checkmark
     * @param {string} message - Message to display
     */
    success: (message) => {
        console.log(chalk.green(`${figures.tick} ${message}`));
    },

    /**
     * Error message with red cross
     * @param {string} message - Error message to display
     */
    error: (message) => {
        console.log(chalk.red(`${figures.cross} ${message}`));
    },

    /**
     * Warning message with yellow triangle
     * @param {string} message - Warning message to display
     */
    warn: (message) => {
        console.log(chalk.yellow(`${figures.warning} ${message}`));
    },

    /**
     * Info message with blue circle
     * @param {string} message - Info message to display
     */
    info: (message) => {
        console.log(chalk.blue(`${figures.info} ${message}`));
    },

    /**
     * Processing/loading message with cyan pointer
     * @param {string} message - Processing message to display
     */
    processing: (message) => {
        console.log(chalk.cyan(`${figures.pointer} ${message}`));
    },

    /**
     * File saved message with magenta arrow
     * @param {string} filepath - Path where file was saved
     */
    saved: (filepath) => {
        console.log(chalk.magenta(`${figures.arrowRight} Saved: ${chalk.underline(filepath)}`));
    },

    /**
     * Batch progress indicator
     * @param {number} current - Current item number
     * @param {number} total - Total items count
     * @param {string} item - Item being processed
     */
    progress: (current, total, item) => {
        const percentage = Math.round((current / total) * 100);
        const bar = chalk.green("█".repeat(Math.floor(percentage / 5))) +
                    chalk.gray("░".repeat(20 - Math.floor(percentage / 5)));
        console.log(chalk.dim(`[${bar}] ${percentage}% - ${item}`));
    },

    /**
     * Display QR code in terminal
     * @param {string} qrString - QR code string representation
     */
    qr: (qrString) => {
        console.log(chalk.white(qrString));
    },

    /**
     * Divider line for visual separation
     */
    divider: () => {
        console.log(chalk.gray("─".repeat(50)));
    },

    /**
     * Header/title display
     * @param {string} title - Title text
     */
    header: (title) => {
        console.log(chalk.bold.cyan(`\n${figures.star} ${title}`));
        console.log(chalk.gray("─".repeat(50)));
    },

    /**
     * Raw console log without styling
     * @param {string} message - Message to display
     */
    raw: (message) => {
        console.log(message);
    }
};

export default logger;