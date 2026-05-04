import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'health_assistant',
  storage: process.env.DB_STORAGE || './database.sqlite',
};

export const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
