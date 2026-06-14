import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { TaskResponseContent, TaskStatistics } from '../services/mentorshipsContent/task';
import { getTaskById, getTaskStatistics } from '../services/mentorshipsContent/task';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useTaskDetail = () => {

    const { taskId } = useParams<{ taskId: string }>();
    const token = useAuthStore((s) => s.token);

    const [stats, setStats] = useState<TaskStatistics | null>(null);
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [taskAttachmentUrl, setTaskAttachmentUrl] = useState<string>('');
    const [uploadedAttachmentPath, setUploadedAttachmentPath] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 6;


    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'GRADED' | 'NOT_SUBMITTED'>('ALL');

    const loadData = useCallback(async () => {
        if (!token || !taskId) return;

        try {
            setLoading(true);
            setError(null);

            const [statsData, taskData] = await Promise.all([
                getTaskStatistics(Number(taskId), page, PAGE_SIZE),
                getTaskById(Number(taskId)),
            ]);

            setStats(statsData);
            const typedTask = taskData as TaskResponseContent;
            setTaskDescription(typedTask.description ?? '');
            setTaskAttachmentUrl(typedTask.attachmentUrl ?? '');
            setUploadedAttachmentPath(typedTask.uploadedAttachmentPath ?? '');


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to load task details';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [token, taskId, page]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleGraded = () => {
        loadData();
    };

    /* ─── Derived values ─── */
    const submissions = stats?.taskSubmissionResponsePageResponse?.content ?? [];
    const paginationMeta = stats?.taskSubmissionResponsePageResponse;
    const maxPoints = stats?.totalPoints ?? 100;
    const gradedCount = stats ? stats.totalSubmissions - stats.pendingReview + stats.totalStudents : 0;

    // Client-side search + filter
    const filteredSubmissions = submissions.filter((sub) => {
        const matchesName = sub.studentFullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
        return matchesName && matchesStatus;
    });

    const STATUS_OPTIONS: { label: string; value: typeof statusFilter }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Submitted', value: 'SUBMITTED' },
        { label: 'Graded', value: 'GRADED' },
        { label: 'Not Submitted', value: 'NOT_SUBMITTED' },
    ];

    return {
        stats,
        taskDescription,
        taskAttachmentUrl,
        uploadedAttachmentPath,
        loading,

        error,
        submissions: filteredSubmissions,
        paginationMeta,
        maxPoints,
        gradedCount,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        STATUS_OPTIONS,
        page,
        setPage,
        loadData,
        handleGraded,
        refetch: loadData,
    };
};

