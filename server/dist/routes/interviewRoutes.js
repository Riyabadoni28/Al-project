"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interviewController_1 = require("../controllers/interviewController");
const router = (0, express_1.Router)();
router.get('/questions', interviewController_1.getInterviewPrepQuestions);
exports.default = router;
