"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const documentController_1 = require("../controllers/documentController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
router.post('/upload-resume', upload.single('resume'), documentController_1.uploadResume);
router.post('/upload-jd', upload.single('jobDescription'), documentController_1.uploadJobDescription);
router.get('/status', documentController_1.getDocumentStatus);
router.delete('/:type', documentController_1.deleteDocument);
exports.default = router;
