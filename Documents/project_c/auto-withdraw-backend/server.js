/**
 * Server Startup File
 * Production-ready server with graceful shutdown handling
 */

const app = require('./dist/app.js');
const http = require('http');

// Configuration
const PORT = process.env.PORT || 3001;
const ENV = process.env.NODE_ENV || 'production';

// Create HTTP server
const server = http.createServer(app);

// Server startup
server.listen(PORT, () => {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║        AUTO WITHDRAW BACKEND - PAYMENT GATEWAY           ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server Status:     ONLINE`);
    console.log(`🌍 Environment:       ${ENV.toUpperCase()}`);
    console.log(`📡 Port:             ${PORT}`);
    console.log(`📅 Started At:        ${new Date().toISOString()}`);
    console.log('');
    console.log(`📍 Health Check:      http://localhost:${PORT}/health`);
    console.log(`📍 API Base:         http://localhost:${PORT}`);
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

        // Close database connections if needed
        // Add your database cleanup here if you have any

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

// Handle process warnings (optional, can be commented out in production)
if (ENV === 'development') {
    process.on('warning', (warning) => {
        console.warn('⚠️  Warning:', warning.name, warning.message);
        console.warn('Stack:', warning.stack);
    });
}

// Export server for testing purposes
module.exports = server;