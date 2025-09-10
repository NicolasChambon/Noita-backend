import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImageUploadResult } from '../types/index.js';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ImageUploadService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../public/images');
    void this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(
    imageData: string,
    imageName: string
  ): Promise<ImageUploadResult> {
    try {
      // Validate image data format
      if (!imageData.includes(',')) {
        return {
          success: false,
          error: 'Invalid image data format',
        };
      }

      // Extract base64 data
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        return {
          success: false,
          error: 'No image data found',
        };
      }

      // Validate image size
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > config.upload.maxSize) {
        return {
          success: false,
          error: `Image size exceeds maximum allowed size of ${config.upload.maxSize / (1024 * 1024)}MB`,
        };
      }

      const imagePath = path.join(this.uploadDir, imageName);

      // Write file using promises for better performance
      await fs.writeFile(imagePath, buffer);

      return {
        success: true,
        filename: imageName,
        path: imagePath,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to upload image',
      };
    }
  }

  async deleteImage(imageUrl: string): Promise<ImageUploadResult> {
    try {
      // Extract filename from URL
      const filename = path.basename(imageUrl);
      const imagePath = path.join(this.uploadDir, filename);

      // Check if file exists before attempting to delete
      try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
        return {
          success: true,
          filename,
        };
      } catch {
        // File doesn't exist, consider it a success
        return {
          success: true,
          filename,
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete image',
      };
    }
  }

  async imageExists(imageName: string): Promise<boolean> {
    try {
      const imagePath = path.join(this.uploadDir, imageName);
      await fs.access(imagePath);
      return true;
    } catch {
      return false;
    }
  }

  getImagePath(imageName: string): string {
    return path.join(this.uploadDir, imageName);
  }

  validateImageFormat(imageData: string): boolean {
    // Basic validation for base64 image data
    const validFormats = [
      'data:image/jpeg;base64,',
      'data:image/png;base64,',
      'data:image/gif;base64,',
      'data:image/webp;base64,',
    ];
    return validFormats.some((format) => imageData.startsWith(format));
  }
}

export default ImageUploadService;
