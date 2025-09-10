import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ImageUploadService } from '../../src/services/ImageUploadService.js';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  unlink: jest.fn(),
  access: jest.fn(),
  mkdir: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  dirname: jest.fn((path: string) => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn((path: string) => path.split('/').pop() || ''),
}));

// Mock url
jest.mock('url', () => ({
  fileURLToPath: jest.fn((url: string) => url.replace('file://', '')),
}));

describe('ImageUploadService', () => {
  let imageUploadService: ImageUploadService;

  beforeEach(() => {
    jest.clearAllMocks();
    imageUploadService = new ImageUploadService();
  });

  describe('validateImageFormat', () => {
    it('should validate JPEG format', () => {
      const jpegData = 'data:image/jpeg;base64,test';
      const isValid = imageUploadService.validateImageFormat(jpegData);
      expect(isValid).toBe(true);
    });

    it('should validate PNG format', () => {
      const pngData = 'data:image/png;base64,test';
      const isValid = imageUploadService.validateImageFormat(pngData);
      expect(isValid).toBe(true);
    });

    it('should validate GIF format', () => {
      const gifData = 'data:image/gif;base64,test';
      const isValid = imageUploadService.validateImageFormat(gifData);
      expect(isValid).toBe(true);
    });

    it('should validate WebP format', () => {
      const webpData = 'data:image/webp;base64,test';
      const isValid = imageUploadService.validateImageFormat(webpData);
      expect(isValid).toBe(true);
    });

    it('should reject invalid format', () => {
      const invalidData = 'data:image/bmp;base64,test';
      const isValid = imageUploadService.validateImageFormat(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject non-image data', () => {
      const invalidData = 'data:text/plain;base64,test';
      const isValid = imageUploadService.validateImageFormat(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject malformed data', () => {
      const invalidData = 'not-a-data-url';
      const isValid = imageUploadService.validateImageFormat(invalidData);
      expect(isValid).toBe(false);
    });
  });

  describe('getImagePath', () => {
    it('should return correct image path', () => {
      const path = imageUploadService.getImagePath('test.png');
      expect(path).toContain('test.png');
    });

    it('should handle different file extensions', () => {
      const jpgPath = imageUploadService.getImagePath('test.jpg');
      const pngPath = imageUploadService.getImagePath('test.png');
      const gifPath = imageUploadService.getImagePath('test.gif');

      expect(jpgPath).toContain('test.jpg');
      expect(pngPath).toContain('test.png');
      expect(gifPath).toContain('test.gif');
    });
  });

  describe('Image data validation', () => {
    it('should detect invalid base64 format', async () => {
      const invalidData = 'invalid-data-without-comma';
      const result = await imageUploadService.uploadImage(
        invalidData,
        'test.png'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid image data format');
    });

    it('should detect empty base64 data', async () => {
      const invalidData = 'data:image/png;base64,';
      const result = await imageUploadService.uploadImage(
        invalidData,
        'test.png'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('No image data found');
    });

    it('should detect oversized images', async () => {
      // Create a large base64 string that would exceed the limit
      const largeBase64Data = 'A'.repeat(15 * 1024 * 1024); // 15MB of 'A' characters
      const largeImageData = `data:image/png;base64,${largeBase64Data}`;

      const result = await imageUploadService.uploadImage(
        largeImageData,
        'test.png'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Image size exceeds maximum allowed size');
    });
  });
});
