import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = config.clientUrls;

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/api', apiRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AI Career Assistant API Engine',
    documentation: '/api/health',
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`=================================`);
  console.log(`🚀 AI Career Assistant Backend Server`);
  console.log(`📡 Running on port: ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`=================================`);
});
