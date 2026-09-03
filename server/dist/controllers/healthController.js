"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = void 0;
const getHealthStatus = (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'AI Career Assistant Backend',
        version: '1.0.0',
        phase: 'Phase 1 - Architecture & Foundations',
        timestamp: new Date().toISOString(),
        system: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
        },
    });
};
exports.getHealthStatus = getHealthStatus;
