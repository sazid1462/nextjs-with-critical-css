const parser = require("body-parser");
const dotenv = require('dotenv');
const express = require('express');
const expressHealthcheck = require('express-healthcheck');
const { existsSync, mkdirSync, readdir, readFileSync, writeFile } = require("fs");
const { memoize } = require("lodash");
const { resolve } = require('path');
const CriticalCSS = require("./criticalcss");
dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const cssFilesPath = resolve(process.env.CSS_FILES_PATH || 'out/css/');
const criticalCSSPath = resolve(process.env.CRITCAL_CSS_FILES_PATH || 'out/critical-css/');

const cache = {};
const inProgress = {};
const doGetContent = (file) => readFileSync(file, "utf8");
const getContent = process.env.NODE_ENV === "production" ? memoize(doGetContent) : doGetContent;

const isExists = (file) => {
  if (cache[file]) return true;
  cache[file] = existsSync(file);
  return cache[file];
}

function readCSSFiles(onFileContent, onError) {
  const dirname = cssFilesPath;
  readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    let content = "";
    filenames.forEach(function(filename) {
      const fcontent = getContent(resolve(cssFilesPath, filename));
      content += fcontent+"\n";
    });
    onFileContent(content);
  });
}

function generateCriticalCss(pagePath, callback) {
  const host = process.env.NEXT_APP_BASE_URL;
  const url = host + pagePath.substr(1);

  if (pagePath.startsWith('/_') || pagePath.includes('.')) {
    // console.log('Skipping CSS generation for:', url);
    return callback(false);
  }

  let critCSSFilename = pagePath.replace(/\//, '').replace(/\//g, '-');
  if (!critCSSFilename) critCSSFilename = 'home';
  critCSSFilename = `${critCSSFilename}.css`;

  if (inProgress[critCSSFilename] || isExists(critCSSFilename)) return callback(false);
  inProgress[critCSSFilename] = true;
  console.log('Generating CSS for:', url);

  readCSSFiles((content) => {
    if (!content) {
      console.log(`No CSS files found in "${cssFilesPath}" folder'`);
      return callback(false);
    }
    CriticalCSS.generate(url, content).then((critcss) => {
      writeFile(resolve(criticalCSSPath, critCSSFilename), critcss, () => {
        console.log('Generated css for:', url, critCSSFilename);
        inProgress[critCSSFilename] = false;
        cache[critCSSFilename] = true;
        callback(true);
      });
    }).catch((e) => {
      console.error(e.message);
      inProgress[critCSSFilename] = false;
      callback(false);
    });
  }, (err)=>{
    console.error(err.message);
    inProgress[critCSSFilename] = false;
    callback(false);
  });
}

const getCriticalCSS = (pathname) => {
  let page = pathname.replace(/\//, '').replace(/\//g, '-');
  if (!page) page = 'home';
  const fileName = `${page}.css`;
  const criticalCSSPath = process.env.CRITCAL_CSS_FILES_PATH || '/usr/src/app/critical-css/';
  const file = resolve(criticalCSSPath, fileName);

  if (!isExists(file)) return null;

  const content = getContent(file);
  return content;
}

const createServer = () => {
  const server = express();

  !existsSync(cssFilesPath) && mkdirSync(cssFilesPath, {recursive: true});
  !existsSync(criticalCSSPath) && mkdirSync(criticalCSSPath, {recursive: true});

  server.use(parser.urlencoded({ extended: true }));
  server.use(parser.json());

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

  server.get('/', (req, res) => {
    let pagePath = req.query.pagePath;
    if (!pagePath) pagePath = '/';
    const cssString = getCriticalCSS(pagePath);
    if (!cssString) return res.status(404).send("Not Found");
    res.send(cssString);
    // res.status(404).send("Not Found");
  });

  server.post('/', (req, res) => {
    let pagePath = req.body.pagePath;
    if (!pagePath) pagePath = '/';
    generateCriticalCss(pagePath, (generated) => {
      res.send(generated ? "Skiped" : "Generated");
    });
  });

  return server;
};

const server = createServer();
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
