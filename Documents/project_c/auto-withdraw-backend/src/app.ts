import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import withdrawRoutes from './routes/withdraw.routes';
import webhookRoutes from './routes/webhook.routes';
import transactionRoutes from './routes/transaction.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow all origins for development
app.use(cors({
    origin: '*', // Allow all origins for development
    credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[Request] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });

    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Auto Withdraw Backend',
    });
});

// Routes
app.use('/', withdrawRoutes);
app.use('/', webhookRoutes);
app.use('/', transactionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('[Error]', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Auto Withdraw Backend`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Port: ${PORT}`);
    console.log(`=================================`);
});

export default app;