"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysisController_1 = require("../controllers/analysisController");
const router = (0, express_1.Router)();
router.get('/fit', analysisController_1.getJobFitAnalysis);
exports.default = router;
