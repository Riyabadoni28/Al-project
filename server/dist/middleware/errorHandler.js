"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[Error] ${req.method} ${req.originalUrl}: ${message}`, err.stack);
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        timestamp: new Date().toISOString(),
    });
};
exports.errorHandler = errorHandler;
