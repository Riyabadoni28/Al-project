"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatMessage = void 0;
const llmService_1 = require("../services/llm/llmService");
const handleChatMessage = async (req, res, next) => {
    try {
        const { message, history } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ status: 'error', message: 'Message content is required.' });
        }
        const response = await llmService_1.llmService.generateResponse(message, history || []);
        res.status(200).json({
            status: 'success',
            data: response,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.handleChatMessage = handleChatMessage;
