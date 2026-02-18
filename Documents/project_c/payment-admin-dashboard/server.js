/**
 * Next.js Production Server Startup File
 * Production-ready server with graceful shutdown handling
 */

const { createServer } = require('http');
const next = require('next');

// Configuration
const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;
const HOSTNAME = '0.0.0.0';
const ENV = process.env.NODE_ENV || 'development';

// Initialize Next.js app
const app = next({ dev, hostname: HOSTNAME, port: PORT });
const handle = app.getRequestHandler();

// Prepare the Next.js app
app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            await handle(req, res);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Server startup
    server.listen(PORT, HOSTNAME, () => {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                                                           ║');
        console.log('║        PAYMENT ADMIN DASHBOARD - NEXT.JS                  ║');
        console.log('║                                                           ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`🚀 Server Status:     ONLINE`);
        console.log(`🌍 Environment:       ${ENV.toUpperCase()}`);
        console.log(`📡 Port:             ${PORT}`);
        console.log(`🌐 Hostname:         ${HOSTNAME}`);
        console.log(`📅 Started At:        ${new Date().toISOString()}`);
        console.log('');
        console.log(`📍 Local URL:         http://localhost:${PORT}`);
        console.log(`📍 Network URL:       http://${HOSTNAME}:${PORT}`);
        console.log('');

        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log(`🔌 Backend API:       ${process.env.NEXT_PUBLIC_API_URL}`);
        }

        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║  Press Ctrl+C to stop the server gracefully            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal) => {
        console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

        // Stop accepting new connections
        server.close((err) => {
            if (err) {
                console.error('❌ Error closing server:', err);
                process.exit(1);
            }

            console.log('✅ Server closed successfully');
            console.log('👋 Shutdown complete. Goodbye!');
            process.exit(0);
        });

        // Force shutdown after 10 seconds if graceful shutdown fails
        setTimeout(() => {
            console.error('⚠️  Force shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.error('💥 Uncaught Exception:', err);
        gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
        gracefulShutdown('unhandledRejection');
    });

    // Handle process warnings in development
    if (dev) {
        process.on('warning', (warning) => {
            console.warn('⚠️  Warning:', warning.name, warning.message);
            if (warning.stack) {
                console.warn('Stack:', warning.stack);
            }
        });
    }
}).catch((err) => {
    console.error('❌ Error starting Next.js app:', err);
    process.exit(1);
});

// Export server for testing purposes
module.exports = { server, app };