// 🛡️ Middleware to extract client IP address and attach it to the request object as 'clientIp'.
app.use(requestIp.mw());

// ⏳ Middleware for rate limiting to prevent abuse.
// It allows a maximum of 100 requests per IP address within a 1-minute window.
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // Max 100 requests per IP per minute
});
app.use(limiter);

// 🔒 Constants and array for tracking connected IPs.
// MAX_CONNECTIONS defines the maximum number of IP addresses to track, configurable based on operational needs.
// connectedIPs is an array to store the IP addresses of connected clients.
const MAX_CONNECTIONS = 5;
let connectedIPs = [];

// 🔍 Middleware to check for suspicious IP addresses.
// It examines if the client's IP address making the request is in the connectedIPs array.
// If the IP is flagged as suspicious, it sends a 403 Forbidden response and logs the blocked connection.
// Otherwise, it adds the IP address to the connectedIPs array and proceeds with the next middleware.
function checkSuspiciousIP(req, res, next) {
    const clientIP = req.clientIp; // Get client's IP address

    if (connectedIPs.includes(clientIP)) {
        res.status(403).send('Forbidden');
        console.log('Blocked connection from ' + clientIP);
    } else {
        connectedIPs.push(clientIP);
        if (connectedIPs.length > MAX_CONNECTIONS) {
            connectedIPs.shift(); // Remove the oldest IP
        }
        next();
    }
}

// 🌐 Route handler for the root path ('/').
// It logs the client's IP address when a request is received and sends a simple "Hello, World!" response.
app.use(checkSuspiciousIP);

app.get('/', (req, res) => {
    console.log('Client connected: ' + req.clientIp);
    res.send('Hello, World!');
});

// 🚀 Start the server on port 3000 and log a message indicating the server is running.
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
