const fs = require('fs')
const webpack = require('webpack')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
module.exports = {
    transpileDependencies: ['@vue/reactivity'],
    productionSourceMap: false,
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.PACKAGE_VERSION': '"' + version + '"'
            }),
            new NodePolyfillPlugin()
        ]
    },
    devServer: {
        onBeforeSetupMiddleware(devServer) {
            const app = devServer.app;
            const http = require('http');
            const https = require('https');

            app.post('/trpc/:host/:port/*', (req, res) => {
                const host = req.params.host;
                const port = parseInt(req.params.port, 10);
                const isHttps = req.query && (req.query.https === '1' || req.query.https === 'true');
                const targetPath = '/' + req.params[0];

                let body = '';
                req.on('data', (chunk) => { body += chunk; });
                req.on('end', () => {
                    const headers = Object.assign({}, req.headers);
                    // Ensure content type
                    headers['content-type'] = 'application/json';
                    // Override host header for target
                    headers['host'] = host + ':' + port;
                    // Avoid gzip to simplify proxying
                    headers['accept-encoding'] = 'identity';

                    const options = {
                        hostname: host,
                        port: port,
                        path: targetPath,
                        method: 'POST',
                        headers: headers,
                    };

                    const client = isHttps ? https : http;
                    const proxyReq = client.request(options, (proxyRes) => {
                        // Forward status and headers
                        res.status(proxyRes.statusCode || 500);
                        const respHeaders = Object.assign({}, proxyRes.headers);
                        // Allow same-origin in dev server
                        respHeaders['access-control-allow-origin'] = '*';
                        // Remove content-encoding/length to prevent decoding mismatch
                        delete respHeaders['content-encoding'];
                        delete respHeaders['Content-Encoding'];
                        delete respHeaders['content-length'];
                        delete respHeaders['Content-Length'];
                        for (const [key, value] of Object.entries(respHeaders)) {
                            if (typeof value !== 'undefined') {
                                res.setHeader(key, Array.isArray(value) ? value.join(', ') : value);
                            }
                        }

                        // Stream response as-is to avoid corruption
                        const chunks = [];
                        proxyRes.on('data', (chunk) => { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); });
                        proxyRes.on('end', () => {
                            res.send(Buffer.concat(chunks));
                        });
                    });

                    proxyReq.on('error', (err) => {
                        res.status(502).json({ errorMessage: err.message || String(err) });
                    });

                    proxyReq.write(body || '');
                    proxyReq.end();
                });
            });
        }
    }
}