#!/usr/bin/env node

/**
 * This script need to be run before building the WebUI
 */

const fs = require('fs');

function updateJS(filename) {
  fs.readFile(`${filename}`, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    // Force Vue.js/webpack to load scripts from the same directory (to use the WebUI from /transmission/web/)
    const result = data.replace(/= jsonpScriptSrc\(chunkId\)/g, "= '.'+jsonpScriptSrc(chunkId)");

    fs.writeFile(`${filename}`, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
}

updateJS('./node_modules/webpack/lib/web/JsonpMainTemplatePlugin.js')