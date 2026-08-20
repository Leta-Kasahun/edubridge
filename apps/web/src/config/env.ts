export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'EduBridge',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;