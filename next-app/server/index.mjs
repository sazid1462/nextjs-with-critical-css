const dev = process.env.NODE_ENV !== 'production';
import fetch from 'cross-fetch';
import dotenv from 'dotenv';
import express from 'express';
import expressHealthcheck from 'express-healthcheck';
import next from 'next';
const { copyFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } = require('fs');
const { resolve } = require('path');
dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

function generateCriticalCss(req) {
  const critCSSBaseUrl = process.env.CRITICAL_CSS_BASE_URL;
  const originalPath = req.originalUrl.split('?')[0];

  if (originalPath.startsWith('/_') || originalPath.includes('.')) {
    // console.log('Skipping CSS generation for:', url);
    return;
  }
  (async () => {
    try {
      const res = await fetch(critCSSBaseUrl, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pagePath: originalPath })
      });

      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
    } catch (err) {
      console.error(err);
    }
  })();
  return;
}

function setupServiceWorker(server) {
  server.get('/service-worker.js', (req, res) => {
    // Don't cache service worker is a best practice (otherwise clients wont get emergency bug fix)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Content-Type', 'application/javascript');
    app.serveStatic(req, res, resolve('./.next/service-worker.js'));
  });
}

const createServer = () => {
  const server = express();

  // Logging
  server.use((req, res, next) => {
    console.log(`Logged  ${req.method}  ${req.path} -- ${new Date().toISOString()}`);
    next();
  });

  // Handle trailing slash
  server.use(function (req, res, next) {
    if (req.path.substr(-1) == '/' && req.path.length > 1) {
      var query = req.url.slice(req.path.length);
      res.redirect(301, req.path.slice(0, -1) + query);
    } else {
      next();
    }
  });

  server.use('/health', expressHealthcheck());

  // Service worker file gets created by next-offline
  // If you test in production mode, remember to manually unregister the production service worker after
  setupServiceWorker(server);

  server.get('*', (req, res) => {
    // process.env.NODE_ENV === "production" &&
    generateCriticalCss(req);
    return handle(req, res);
  });

  return server;
};

// cleanup
const dataPath = resolve('.data');
const cssPath = resolve('.next/static/css');

!existsSync(dataPath) && mkdirSync(dataPath);
readdirSync(dataPath).forEach((d) => {
  unlinkSync(resolve(dataPath, d));
})
readdirSync(cssPath).forEach((d) => {
  copyFileSync(resolve(cssPath, d), resolve(dataPath, d));
})

// prepare server
const server = createServer();
app.prepare()
  .then(() => {
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
