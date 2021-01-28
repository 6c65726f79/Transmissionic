#!/usr/bin/env node

/**
 * This script need to be run after building "dist"
 */

const fs = require('fs');

function updateHTML(filename) {
  fs.readFile(`${filename}`, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    // Set Content-Security-Policy to "script-src 'self'"
    let result = data.replace("script-src * 'unsafe-eval'", "script-src 'self'");

    // Load all href from the same directory
    result = result.replace(/="\//g, '="./');

    fs.writeFile(`${filename}`, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
}

updateHTML('./dist/index.html');