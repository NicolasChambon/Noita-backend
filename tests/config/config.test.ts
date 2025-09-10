import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { config } from '../../src/config/index.js';

describe('Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Database Configuration', () => {
    it('should have database configuration properties', () => {
      expect(config.database).toBeDefined();
      expect(config.database).toHaveProperty('url');
      expect(config.database).toHaveProperty('options');
    });

    it('should have valid database URL format', () => {
      expect(config.database.url).toMatch(/^postgres:\/\/.+:.+@.+:\d+\/.+$/);
    });

    it('should have pool configuration for Cloud Run optimization', () => {
      expect(config.database.options.pool).toBeDefined();
      expect(config.database.options.pool?.max).toBe(5);
      expect(config.database.options.pool?.min).toBe(0);
      expect(config.database.options.pool?.idle).toBe(10000);
    });
  });

  describe('Server Configuration', () => {
    it('should have server port configuration', () => {
      expect(config.port).toBeDefined();
      expect(typeof config.port).toBe('number');
      expect(config.port).toBeGreaterThan(0);
      expect(config.port).toBeLessThan(65536);
    });

    it('should use environment variable for port', () => {
      expect(config.port).toBe(parseInt(process.env.SERVER_PORT || '3000'));
    });

    it('should have node environment configuration', () => {
      expect(config.nodeEnv).toBeDefined();
      expect(['development', 'production', 'test']).toContain(config.nodeEnv);
    });
  });

  describe('CORS Configuration', () => {
    it('should have CORS configuration', () => {
      expect(config.cors).toBeDefined();
      expect(config.cors).toHaveProperty('origin');
      expect(config.cors).toHaveProperty('methods');
      expect(config.cors).toHaveProperty('credentials');
      expect(config.cors).toHaveProperty('allowedHeaders');
    });

    it('should have valid CORS origins', () => {
      expect(Array.isArray(config.cors.origin)).toBe(true);
      expect(config.cors.origin.length).toBeGreaterThan(0);
    });

    it('should have standard HTTP methods', () => {
      expect(config.cors.methods).toContain('GET');
      expect(config.cors.methods).toContain('POST');
      expect(config.cors.methods).toContain('PUT');
      expect(config.cors.methods).toContain('DELETE');
    });
  });

  describe('Upload Configuration', () => {
    it('should have upload configuration', () => {
      expect(config.upload).toBeDefined();
      expect(config.upload).toHaveProperty('maxSize');
      expect(config.upload).toHaveProperty('allowedTypes');
    });

    it('should have reasonable file size limit', () => {
      expect(config.upload.maxSize).toBe(10 * 1024 * 1024); // 10MB
    });

    it('should allow common image types', () => {
      expect(config.upload.allowedTypes).toContain('image/jpeg');
      expect(config.upload.allowedTypes).toContain('image/png');
      expect(config.upload.allowedTypes).toContain('image/gif');
      expect(config.upload.allowedTypes).toContain('image/webp');
    });
  });

  describe('Configuration Validation', () => {
    it('should have all required configuration sections', () => {
      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('nodeEnv');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('cors');
      expect(config).toHaveProperty('upload');
    });

    it('should be a valid configuration object', () => {
      expect(typeof config).toBe('object');
      expect(config).not.toBeNull();
    });
  });
});
