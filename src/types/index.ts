import { Request, Response, NextFunction } from 'express';

// Domain Types
export interface Post {
  id: number;
  title_fr: string;
  title_de: string;
  content_fr: string;
  content_de: string;
  displayed_date: Date;
  image_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface Concert {
  id: number;
  city: string;
  event_date: Date;
  venue?: string;
  event_name?: string;
  event_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface Carousel {
  id: number;
  url: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

// Request Types
export interface CreatePostRequest {
  title_fr: string;
  title_de: string;
  content_fr: string;
  content_de: string;
  displayed_date: string;
  img64?: string;
}

export interface UpdatePostRequest extends CreatePostRequest {
  id: string;
}

export interface CreateConcertRequest {
  city: string;
  event_date: string;
  venue?: string;
  event_name?: string;
  event_url: string;
}

export interface UpdateConcertRequest extends CreateConcertRequest {
  id: string;
}

export interface CreateCarouselRequest {
  picture64: string;
}

export interface UpdateCarouselRequest extends CreateCarouselRequest {
  id: string;
}

export interface SwitchPositionRequest {
  direction: 'left' | 'right';
}

// Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: string[];
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Auth Types
export interface FirebaseUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export interface AuthenticatedRequest<T = unknown>
  extends Request<Record<string, string>, unknown, T> {
  user?: FirebaseUser;
}

// Configuration Types
export interface DatabaseConfig {
  url: string;
  options: {
    define: { underscored: boolean };
    logging: boolean | ((sql: string) => void);
    pool: {
      max: number;
      min: number;
      acquire: number;
      idle: number;
    };
    dialectOptions?: {
      keepAlive: boolean;
      keepAliveInitialDelayMillis: number;
    };
  };
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  cors: {
    origin: string[];
    methods: string[];
    credentials: boolean;
    allowedHeaders: string[];
  };
  nodeEnv: 'development' | 'production' | 'test';
  upload: {
    maxSize: number;
    allowedTypes: string[];
  };
}

// Service Response Types
export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

// Upload Types
export interface ImageUploadResult {
  success: boolean;
  filename?: string;
  path?: string;
  error?: string;
}

// Database Connection Types
export interface DatabaseConnection {
  authenticate(): Promise<void>;
  close(): Promise<void>;
  sync(options?: Record<string, unknown>): Promise<void>;
}

// Utility Types
export type AsyncHandler<T = unknown> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};
