const express = require('express');
const requestIp = require('request-ip');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware to get client's IP address
app.use(requestIp.mw());

// Rate limiting middleware to restrict the number of requests per IP address
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // Max 100 requests per IP per minute
});
app.use(limiter);

const MAX_CONNECTIONS = 5;
let connectedIPs = [];

function checkSuspiciousIP(req, res, next) {
    const clientIP = req.clientIp; // Get client's IP address

    // Check if the IP is in the list of connected IPs
    if (connectedIPs.includes(clientIP)) {
        // If the IP is suspicious, block the connection
        res.status(403).send('Forbidden');
        console.log('Blocked connection from ' + clientIP);
    } else {
        // Add the IP to the list of connected IPs
        connectedIPs.push(clientIP);
        if (connectedIPs.length > MAX_CONNECTIONS) {
            connectedIPs.shift(); // Remove the oldest IP
        }
        next();
    }
}

app.use(checkSuspiciousIP);

app.get('/', (req, res) => {
    console.log('Client connected: ' + req.clientIp); // Log client's IP address
    res.send('Hello, World!');
    /*
    This code will load a file into your main index page e.g 127.0.0.0:3000
    Note: This code is for example purposes. It will cause a directory error.
    res.sendFile('index.html');
    */
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
