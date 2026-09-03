"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const environment_1 = require("./config/environment");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: environment_1.config.clientUrl,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
// API Routes
app.use('/api', routes_1.default);
// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to AI Career Assistant API Engine',
        documentation: '/api/health',
    });
});
// Centralized Error Handler
app.use(errorHandler_1.errorHandler);
// Start Server
app.listen(environment_1.config.port, () => {
    console.log(`=================================`);
    console.log(`🚀 AI Career Assistant Backend Server`);
    console.log(`📡 Running on port: ${environment_1.config.port}`);
    console.log(`🌍 Environment: ${environment_1.config.nodeEnv}`);
    console.log(`=================================`);
});
