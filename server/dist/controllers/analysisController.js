"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobFitAnalysis = void 0;
const documentService_1 = require("../services/documents/documentService");
const getJobFitAnalysis = (req, res) => {
    const resume = documentService_1.documentService.getResume();
    const jd = documentService_1.documentService.getJobDescription();
    if (!resume || !jd) {
        return res.status(200).json({
            status: 'success',
            data: {
                isComplete: false,
                message: 'Please upload both your Resume and Job Description to calculate AI match analysis.',
                resumeUploaded: !!resume,
                jobDescriptionUploaded: !!jd,
            },
        });
    }
    // Structured Job Fit Analysis Response
    res.status(200).json({
        status: 'success',
        data: {
            isComplete: true,
            overallMatch: 84,
            matchGrade: 'Strong Candidate Match',
            matchingSkills: [
                'Angular / TypeScript',
                'RxJS & Async State Management',
                'REST API & JSON Contracts',
                'Component Architecture',
                'SCSS / Responsive Design',
            ],
            missingSkills: [
                'Automated E2E Testing (Jest / Cypress)',
                'Docker Containerization',
                'Cloud Deployments (AWS/GCP)',
            ],
            relevantExperience: [
                {
                    project: 'AI Career Assistant Web App',
                    relevance: 'High',
                    description: 'Demonstrates end-to-end fullstack Angular & Express integration with AI prompt engineering.',
                },
                {
                    project: 'Enterprise Dashboard Design System',
                    relevance: 'High',
                    description: 'Custom SCSS design tokens, Angular Material UI, and responsive layouts.',
                },
            ],
            recommendations: [
                'Review unit testing patterns with Jest before the interview.',
                'Highlight your experience creating scalable Angular standalone component structures.',
                'Prepare to explain your REST API security and interceptor setup.',
            ],
        },
    });
};
exports.getJobFitAnalysis = getJobFitAnalysis;
