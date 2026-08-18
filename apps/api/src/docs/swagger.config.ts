// src/docs/swagger.config.ts

export const swaggerConfig = {
  openapi: '3.0.3',
  info: {
    title: 'EduBridge API',
    version: '1.0.0',
    description: 'EduBridge API - Team Project',
    contact: {
      name: 'EduBridge Team',
      email: 'team@edubridge.edu',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
};