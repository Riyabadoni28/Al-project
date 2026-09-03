"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const getDashboardStats = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                name: 'Alex Johnson',
                role: 'Senior Frontend Developer',
                avatarUrl: 'assets/avatar-placeholder.png',
            },
            stats: {
                resumesUploaded: 1,
                jobDescriptionsUploaded: 2,
                aiAnalysesRun: 3,
                interviewSessions: 1,
            },
            systemStatus: {
                apiStatus: 'Healthy',
                llmService: 'Ready (Phase 2)',
                vectorDatabase: 'Ready (Phase 4)',
                agentService: 'Ready (Phase 7)',
            },
            recentActivity: [
                {
                    id: '1',
                    type: 'DOCUMENT_UPLOAD',
                    title: 'Uploaded Resume_Alex_2026.pdf',
                    timestamp: '2026-08-26T14:30:00Z',
                    status: 'Processed',
                },
                {
                    id: '2',
                    type: 'JOB_DESCRIPTION',
                    title: 'Senior Frontend Engineer - TechCorp',
                    timestamp: '2026-08-26T15:10:00Z',
                    status: 'Ready for Analysis',
                },
            ],
        },
    });
};
exports.getDashboardStats = getDashboardStats;
