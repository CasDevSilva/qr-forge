/**
 * @fileoverview Logo embedding utility using sharp
 * @description Overlays logo image on QR code center with proper sizing and optional background
 */

import sharp from "sharp";
import { getLogoSize } from "./qr-builder.js";

/**
 * Embeds a logo in the center of a QR code image
 * @param {Buffer} qrBuffer - QR code image buffer (PNG)
 * @param {string} logoPath - Path to logo image file
 * @param {object} options - CLI options containing logoSize
 * @returns {Promise<Buffer>} QR code with embedded logo as PNG buffer
 */
export const embedLogo = async (qrBuffer, logoPath, options = {}) => {
    // Get QR code dimensions
    const qrImage = sharp(qrBuffer);
    const qrMetadata = await qrImage.metadata();
    const qrWidth = qrMetadata.width;
    const qrHeight = qrMetadata.height;

    // Calculate logo dimensions (percentage of QR size)
    const logoSizeRatio = getLogoSize(options);
    const logoWidth = Math.round(qrWidth * logoSizeRatio);
    const logoHeight = Math.round(qrHeight * logoSizeRatio);

    // Calculate center position for logo
    const logoX = Math.round((qrWidth - logoWidth) / 2);
    const logoY = Math.round((qrHeight - logoHeight) / 2);

    // Resize logo to target dimensions
    const resizedLogo = await sharp(logoPath)
        .resize(logoWidth, logoHeight, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toBuffer();

    // Create white background circle/square for logo (improves QR readability)
    const padding = Math.round(logoWidth * 0.1);
    const backgroundSize = logoWidth + padding * 2;
    const backgroundX = logoX - padding;
    const backgroundY = logoY - padding;

    // Create rounded white background
    const logoBackground = await sharp({
            create: {
                width: backgroundSize,
                height: backgroundSize,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            },
        })
        .png()
        .toBuffer();

    // Composite: QR + white background + logo
    const result = await sharp(qrBuffer)
        .composite([
            {
            input: logoBackground,
            left: backgroundX,
            top: backgroundY,
            },
            {
            input: resizedLogo,
            left: logoX,
            top: logoY,
            },
        ])
        .png()
        .toBuffer();

    return result;
};

/**
 * Embeds logo with circular background (alternative style)
 * @param {Buffer} qrBuffer - QR code image buffer (PNG)
 * @param {string} logoPath - Path to logo image file
 * @param {object} options - CLI options
 * @returns {Promise<Buffer>} QR code with embedded logo as PNG buffer
 */
export const embedLogoCircular = async (qrBuffer, logoPath, options = {}) => {
    const qrImage = sharp(qrBuffer);
    const qrMetadata = await qrImage.metadata();
    const qrWidth = qrMetadata.width;
    const qrHeight = qrMetadata.height;

    const logoSizeRatio = getLogoSize(options);
    const logoWidth = Math.round(qrWidth * logoSizeRatio);
    const logoHeight = Math.round(qrHeight * logoSizeRatio);
    const logoX = Math.round((qrWidth - logoWidth) / 2);
    const logoY = Math.round((qrHeight - logoHeight) / 2);

    // Resize logo
    const resizedLogo = await sharp(logoPath)
        .resize(logoWidth, logoHeight, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toBuffer();

    // Create circular white background
    const padding = Math.round(logoWidth * 0.15);
    const diameter = logoWidth + padding * 2;
    const radius = diameter / 2;

    const circleSvg = Buffer.from(`
        <svg width="${diameter}" height="${diameter}">
            <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/>
        </svg>
    `);

    const circleBackground = await sharp(circleSvg).png().toBuffer();

    const backgroundX = Math.round((qrWidth - diameter) / 2);
    const backgroundY = Math.round((qrHeight - diameter) / 2);

    const result = await sharp(qrBuffer)
        .composite([
            {
            input: circleBackground,
            left: backgroundX,
            top: backgroundY,
            },
            {
            input: resizedLogo,
            left: logoX,
            top: logoY,
            },
        ])
        .png()
        .toBuffer();

    return result;
};

export default {
    embedLogo,
    embedLogoCircular,
};
