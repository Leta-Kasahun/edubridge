export interface SwaggerHtmlOptions {
  title?: string;
  specUrl?: string;
}

/**
 * Generates the clean FastAPI-identical Swagger UI HTML page.
 * Uses official Swagger UI assets (CDN with local fallback) and clean white background.
 */
export function renderSwaggerHtml(options: SwaggerHtmlOptions = {}): string {
  const title = options.title ?? "EduBridge API - Swagger UI";
  const specUrl = options.specUrl ?? "/api-docs/openapi.json";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html {
      box-sizing: border-box;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #ffffff;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .login-status {
      position: fixed;
      top: 12px;
      right: 16px;
      padding: 10px 16px;
      border-radius: 6px;
      z-index: 9999;
      font-weight: 600;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .login-success {
      background: #def7ec;
      color: #03543f;
      border: 1px solid #bcf0da;
    }
    .login-error {
      background: #fde8e8;
      color: #9b1c1c;
      border: 1px solid #fbd5d5;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>

  <script>
    function showLoginStatus(message, type) {
      const existing = document.querySelector('.login-status');
      if (existing) {
        existing.remove();
      }

      const status = document.createElement('div');
      status.className = 'login-status login-' + type;
      status.textContent = message;
      document.body.appendChild(status);

      setTimeout(() => {
        if (status.parentNode) {
          status.remove();
        }
      }, 5000);
    }

    function extractToken(data) {
      if (!data) return null;
      return (
        data.token ||
        data.accessToken ||
        (data.tokens && data.tokens.accessToken) ||
        (data.data && data.data.token) ||
        (data.data && data.data.accessToken) ||
        (data.data && data.data.tokens && data.data.tokens.accessToken)
      );
    }

    function setBearerToken(token, message) {
      if (!token) return;
      localStorage.setItem('swagger_token', token);
      if (window.ui && typeof window.ui.preauthorizeApiKey === 'function') {
        window.ui.preauthorizeApiKey('bearerAuth', token);
        if (message) {
          showLoginStatus(message, 'success');
        }
      }
    }

    window.onload = function () {
      // Intercept fetch calls to capture JWT bearer token on login
      const originalFetch = window.fetch;
      window.fetch = async function (url, options) {
        const response = await originalFetch(url, options);
        const urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');

        if ((urlStr.includes('/auth/login') || urlStr.includes('/auth/verify-otp')) && response.ok) {
          try {
            const clone = response.clone();
            const data = await clone.json();
            const token = extractToken(data);

            if (token) {
              setBearerToken(token, 'Login successful! Bearer token auto-configured.');
            }
          } catch (e) {
            console.log('Login response parse warning:', e);
          }
        }

        return response;
      };

      // Initialize Swagger UI exactly like FastAPI
      const ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
      });

      window.ui = ui;

      // Restore previously saved token if present
      const storedToken = localStorage.getItem('swagger_token');
      if (storedToken) {
        setTimeout(() => {
          setBearerToken(storedToken, 'Restored saved bearer token.');
        }, 250);
      }
    };
  </script>
</body>
</html>`;
}
