// src/docs/swagger.setup.ts
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import { Express } from 'express';
import { routeRegistry } from './route.registry';
import { registerAllModules } from './route.modules';
import { swaggerConfig } from './swagger.config';

const customSwaggerCss = `
  /* EduBridge Custom Swagger UI Theme */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --eb-bg-dark: #090d16;
    --eb-bg-card: #0f172a;
    --eb-bg-card-hover: #162036;
    --eb-bg-secondary: #1e293b;
    --eb-border: rgba(255, 255, 255, 0.08);
    --eb-border-highlight: rgba(99, 102, 241, 0.35);
    --eb-primary: #6366f1;
    --eb-primary-hover: #4f46e5;
    --eb-text-title: #f8fafc;
    --eb-text-body: #cbd5e1;
    --eb-text-muted: #94a3b8;
    
    --eb-get-color: #10b981;
    --eb-post-color: #3b82f6;
    --eb-put-color: #f59e0b;
    --eb-delete-color: #ef4444;
    --eb-patch-color: #06b6d4;
  }

  body {
    background-color: var(--eb-bg-dark) !important;
    color: var(--eb-text-body) !important;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
    -webkit-font-smoothing: antialiased;
  }

  .swagger-ui {
    color: var(--eb-text-body) !important;
    font-family: inherit !important;
  }

  /* Topbar Navigation */
  .swagger-ui .topbar {
    background: #0f172a !important;
    border-bottom: 1px solid var(--eb-border) !important;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4) !important;
    padding: 14px 0 !important;
  }

  .swagger-ui .topbar .topbar-wrapper {
    display: flex !important;
    align-items: center !important;
  }

  .swagger-ui .topbar a {
    display: flex !important;
    align-items: center !important;
    text-decoration: none !important;
  }

  .swagger-ui .topbar a::before {
    content: 'EduBridge API';
    color: #ffffff;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    display: inline-block;
  }

  .swagger-ui .topbar img {
    display: none !important;
  }

  /* Info Section */
  .swagger-ui .info {
    margin: 24px 0 !important;
    background: var(--eb-bg-card) !important;
    padding: 24px !important;
    border-radius: 12px !important;
    border: 1px solid var(--eb-border) !important;
  }

  .swagger-ui .info .title {
    color: var(--eb-text-title) !important;
    font-size: 2rem !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
  }

  .swagger-ui .info .title small.version-stamp {
    background: var(--eb-primary) !important;
    border-radius: 6px !important;
    padding: 3px 8px !important;
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    display: inline-block !important;
    margin-left: 8px !important;
  }

  .swagger-ui .info p, 
  .swagger-ui .info li,
  .swagger-ui .info td {
    color: var(--eb-text-muted) !important;
    font-size: 0.95rem !important;
    line-height: 1.5 !important;
  }

  .swagger-ui .info a {
    color: #818cf8 !important;
    font-weight: 500 !important;
    text-decoration: none !important;
  }

  .swagger-ui .info a:hover {
    text-decoration: underline !important;
  }

  /* Filter / Search */
  .swagger-ui .filter-container {
    padding: 14px 0 !important;
  }

  .swagger-ui .filter input {
    background-color: var(--eb-bg-card) !important;
    color: var(--eb-text-title) !important;
    border: 1px solid var(--eb-border) !important;
    border-radius: 8px !important;
    padding: 10px 14px !important;
    font-size: 0.9rem !important;
  }

  .swagger-ui .filter input:focus {
    border-color: var(--eb-primary) !important;
    outline: none !important;
  }

  /* Authorize Button */
  .swagger-ui .btn.authorize {
    background: var(--eb-primary) !important;
    border: 1px solid transparent !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
  }

  .swagger-ui .btn.authorize svg {
    fill: #ffffff !important;
  }

  /* Tag Section */
  .swagger-ui .opblock-tag-section {
    margin-bottom: 20px !important;
  }

  .swagger-ui .opblock-tag {
    font-family: inherit !important;
    font-size: 1.15rem !important;
    font-weight: 700 !important;
    color: var(--eb-text-title) !important;
    border-bottom: 1px solid var(--eb-border) !important;
    padding: 10px 4px !important;
  }

  .swagger-ui .opblock-tag small {
    color: var(--eb-text-muted) !important;
    font-size: 0.85rem !important;
    font-weight: 400 !important;
  }

  /* Opblock Endpoints */
  .swagger-ui .opblock {
    background: var(--eb-bg-card) !important;
    border-radius: 10px !important;
    border: 1px solid var(--eb-border) !important;
    margin: 0 0 12px 0 !important;
  }

  .swagger-ui .opblock:hover {
    border-color: var(--eb-border-highlight) !important;
  }

  .swagger-ui .opblock .opblock-summary {
    padding: 10px 16px !important;
    align-items: center !important;
  }

  .swagger-ui .opblock .opblock-summary-method {
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    border-radius: 6px !important;
    min-width: 72px !important;
    text-align: center !important;
    padding: 6px 8px !important;
  }

  .swagger-ui .opblock .opblock-summary-path {
    color: var(--eb-text-title) !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.9rem !important;
    font-weight: 600 !important;
  }

  .swagger-ui .opblock .opblock-summary-description {
    color: var(--eb-text-muted) !important;
    font-size: 0.85rem !important;
  }

  /* Method Specific Colors */
  .swagger-ui .opblock.opblock-get {
    border-left: 4px solid var(--eb-get-color) !important;
  }
  .swagger-ui .opblock.opblock-get .opblock-summary-method {
    background: rgba(16, 185, 129, 0.15) !important;
    color: var(--eb-get-color) !important;
  }

  .swagger-ui .opblock.opblock-post {
    border-left: 4px solid var(--eb-post-color) !important;
  }
  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: rgba(59, 130, 246, 0.15) !important;
    color: var(--eb-post-color) !important;
  }

  .swagger-ui .opblock.opblock-put {
    border-left: 4px solid var(--eb-put-color) !important;
  }
  .swagger-ui .opblock.opblock-put .opblock-summary-method {
    background: rgba(245, 158, 11, 0.15) !important;
    color: var(--eb-put-color) !important;
  }

  .swagger-ui .opblock.opblock-delete {
    border-left: 4px solid var(--eb-delete-color) !important;
  }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background: rgba(239, 68, 68, 0.15) !important;
    color: var(--eb-delete-color) !important;
  }

  .swagger-ui .opblock.opblock-patch {
    border-left: 4px solid var(--eb-patch-color) !important;
  }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method {
    background: rgba(6, 182, 212, 0.15) !important;
    color: var(--eb-patch-color) !important;
  }

  /* Body */
  .swagger-ui .opblock-body {
    background: var(--eb-bg-secondary) !important;
    border-top: 1px solid var(--eb-border) !important;
    padding: 16px !important;
  }

  .swagger-ui .tabli button {
    color: var(--eb-text-title) !important;
  }

  .swagger-ui .tabli.active button {
    color: var(--eb-primary) !important;
  }

  .swagger-ui table {
    color: var(--eb-text-body) !important;
  }

  .swagger-ui table thead tr th {
    color: var(--eb-text-title) !important;
    border-bottom: 1px solid var(--eb-border) !important;
  }

  .swagger-ui .parameter__name {
    color: var(--eb-text-title) !important;
    font-family: 'JetBrains Mono', monospace !important;
  }

  .swagger-ui input[type=text],
  .swagger-ui select,
  .swagger-ui textarea {
    background: var(--eb-bg-dark) !important;
    color: var(--eb-text-title) !important;
    border: 1px solid var(--eb-border) !important;
    border-radius: 6px !important;
    padding: 8px 12px !important;
  }

  .swagger-ui .btn.execute {
    background: var(--eb-get-color) !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    border-radius: 6px !important;
  }

  .swagger-ui .btn.try-out__btn {
    border-radius: 6px !important;
    border: 1px solid var(--eb-border-highlight) !important;
    color: #a5b4fc !important;
  }

  .swagger-ui .highlight-code pre,
  .swagger-ui .microlight,
  .swagger-ui .body-param__text {
    background-color: #050811 !important;
    color: #38bdf8 !important;
    border: 1px solid var(--eb-border) !important;
    border-radius: 6px !important;
    font-family: 'JetBrains Mono', monospace !important;
  }

  .swagger-ui section.models {
    background: var(--eb-bg-card) !important;
    border: 1px solid var(--eb-border) !important;
    border-radius: 12px !important;
    margin-top: 24px !important;
    padding: 16px !important;
  }

  .swagger-ui section.models h4 {
    color: var(--eb-text-title) !important;
    font-weight: 700 !important;
  }

  .swagger-ui .model-box {
    background: var(--eb-bg-dark) !important;
    border: 1px solid var(--eb-border) !important;
    border-radius: 6px !important;
    padding: 10px !important;
  }

  .swagger-ui .model-title {
    color: var(--eb-text-title) !important;
  }

  .swagger-ui .responses-inner h4,
  .swagger-ui .responses-inner h5 {
    color: var(--eb-text-title) !important;
  }

  .swagger-ui .response-col_status {
    font-family: 'JetBrains Mono', monospace !important;
    font-weight: 700 !important;
    color: var(--eb-text-title) !important;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: var(--eb-bg-dark);
  }
  ::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 3px;
  }
`;

export function setupSwagger(app: Express): void {
  registerAllModules();

  const spec = {
    ...swaggerConfig,
    tags: routeRegistry.generateTags(),
    paths: routeRegistry.generatePaths(),
    components: routeRegistry.generateComponents(),
  };

  const swaggerUiOptions: SwaggerUiOptions = {
    customCss: customSwaggerCss,
    customSiteTitle: 'EduBridge API Docs',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tagsSorter: 'alpha',
    },
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, swaggerUiOptions));
  app.get('/api-docs.json', (_, res) => res.json(spec));
}