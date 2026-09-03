"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterviewPrepQuestions = void 0;
const documentService_1 = require("../services/documents/documentService");
const getInterviewPrepQuestions = (req, res) => {
    const resume = documentService_1.documentService.getResume();
    const jd = documentService_1.documentService.getJobDescription();
    const questions = [
        {
            id: '1',
            category: 'Technical Architecture',
            question: 'How do Angular Standalone Components differ from classic NgModule architecture, and what performance benefits do they offer?',
            suggestedAnswer: 'Standalone components streamline Angular applications by removing the need for NgModules. They simplify dependency management, enable granular lazy loading at the component level, and reduce bundle sizes.',
        },
        {
            id: '2',
            category: 'Project Deep-Dive',
            question: 'Can you explain how your application handles backend API failures or network latency using RxJS Interceptors?',
            suggestedAnswer: 'We utilize an Angular HttpInterceptorFn (`errorInterceptor`) that catches HTTP errors via RxJS `catchError`. It sanitizes error messages and presents real-time notifications via Angular Material SnackBar without crashing the UI.',
        },
        {
            id: '3',
            category: 'Skill Gap & Testing',
            question: 'How would you write a unit test for an Angular service that depends on HttpClient?',
            suggestedAnswer: 'Using `ProvideHttpClientTesting` or `HttpTestingController` to mock backend API responses, verify requested endpoints/methods, and assert that Observables emit expected payloads.',
        },
        {
            id: '4',
            category: 'AI & Systems Engineering',
            question: 'Why is it critical to route all LLM requests through a Node/Express backend rather than calling the API directly from Angular?',
            suggestedAnswer: 'Calling LLM APIs directly from the browser exposes secret API keys, bypasses CORS, prevents rate-limiting, and makes vector context construction insecure. The Node backend acts as a secure proxy and RAG engine.',
        },
    ];
    res.status(200).json({
        status: 'success',
        data: {
            resumeFilename: resume ? resume.filename : 'Not uploaded',
            jobDescriptionFilename: jd ? jd.filename : 'Not uploaded',
            questions,
        },
    });
};
exports.getInterviewPrepQuestions = getInterviewPrepQuestions;
