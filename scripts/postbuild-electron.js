#!/usr/bin/env node

/**
 * This script need to be run after copying web assets to electron
 */

const fs = require('fs');

function updateHTML(filename) {
  fs.readFile(`${filename}`, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    // Set Content-Security-Policy to "script-src 'self'"
    let result = data.replace("script-src * 'unsafe-eval'", "script-src 'self'");

    fs.writeFile(`${filename}`, result, 'utf8', function(error) {
      if (error) return console.log(error);
    });
  });
}

updateHTML('./electron/app/index.html');