import dotenv from "dotenv";
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  database: {
    url: process.env.DATABASE_URL || "",
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    privateKey: process.env.JWT_PRIVATE_KEY || "",
    publicKey: process.env.JWT_PUBLIC_KEY || "",
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },

  aws: {
    s3Bucket: process.env.AWS_S3_BUCKET || "",
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },

  email: {
    from: process.env.EMAIL_FROM || "noreply@marketplace.com",
    sendgridApiKey: process.env.SENDGRID_API_KEY || "",
    user: process.env.EMAIL || "",
    password: process.env.MAIL_PASSWORD || "",
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()),
  },

  mfa: {
    appName: process.env.MFA_APP_NAME || "Marketplace",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};
