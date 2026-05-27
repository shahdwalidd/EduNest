import { useEffect, useState } from 'react';
import type { FC } from 'react';
import type { Student } from '../types';
import { useAuthStore } from '../../../../store/authStore';

interface MentorshipStudentsTableProps {
    mentorshipId: string | number;
    initialStudents?: Student[];
    initialPage?: number; // 0-based
    initialSize?: number;
}

const MentorshipStudentsTable: FC<MentorshipStudentsTableProps> = ({ mentorshipId, initialStudents = [], initialPage = 0, initialSize = 10 }) => {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [pageSize, setPageSize] = useState<number>(initialSize);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(initialStudents.length ?? 0);
    const [loading, setLoading] = useState<boolean>(false);
    const token = useAuthStore((s) => s.token);

    useEffect(() => {
        if (mentorshipId === undefined || mentorshipId === null) return;

        const controller = new AbortController();
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set('studentPage', String(currentPage));
                params.set('studentSize', String(pageSize));

                const url = `/api/v1/dashboard/mentorship/${mentorshipId}?${params.toString()}`;
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers.Authorization = `Bearer ${token}`;

                const res = await fetch(url, { signal: controller.signal, headers });
                if (!res.ok) throw new Error('Failed to fetch students');
                const data = await res.json();

                const ranks = data?.studentsRanks ?? null;
                if (ranks) {
                    setStudents(Array.isArray(ranks.content) ? ranks.content : []);
                    setTotalPages(typeof ranks.totalPages === 'number' ? ranks.totalPages : 1);
                    setTotalElements(typeof ranks.totalElements === 'number' ? ranks.totalElements : (Array.isArray(ranks.content) ? ranks.content.length : 0));
                } else {
                    // keep existing students if backend didn't return ranks
                    setTotalPages(1);
                }
            } catch (err) {
                const e = err as { name?: string };
                if (e.name === 'AbortError') return;
                // on error keep previously loaded students (initialStudents) and log
                // parent can show a toast if needed
                console.warn('Mentorship students fetch failed', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();

        return () => controller.abort();
    }, [mentorshipId, currentPage, pageSize, token]);

    const goToPage = (page: number) => {
        if (page < 0 || page >= totalPages) return;
        setCurrentPage(page);
    };

    const prev = () => goToPage(currentPage - 1);
    const next = () => goToPage(currentPage + 1);

    return (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Students on This Mentorship</h3>
                {totalElements >5 && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Per page:</label>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            {[5, 10, 20, 50].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-xs text-gray-400">
                        <tr>
                            <th className="py-3 text-center">Rank</th>
                            <th className="py-3">Student</th>
                            <th className="py-3">Email</th>
                            <th className="py-3 text-center">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-6 text-center text-sm text-gray-500">Loading...</td>
                            </tr>
                        ) : Array.isArray(students) && students.length > 0 ? (
                            students.map((s, idx) => (
                                <tr key={s.studentEmail ?? idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <td className="py-3 text-center font-medium">#{s.rank ?? idx + 1 + currentPage * pageSize}</td>
                                    <td className="py-3 font-semibold">{s.studentName ?? 'Student'}</td>
                                    <td className="py-3 text-gray-500">{s.studentEmail ?? '—'}</td>
                                    <td className="py-3 text-center text-yellow-600 font-bold">{s.totalPoints ?? 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-6 text-center text-sm text-gray-500">No students enrolled</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalElements > 5 && (
                <div className="mt-4 flex items-center justify-end">

                    <div className="flex items-center gap-2">
                        <button
                            onClick={prev}
                            disabled={loading || currentPage <= 0}
                            className={`px-3 py-1 rounded border text-sm ${loading || currentPage <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        >
                            Previous
                        </button>

                        {/* simple page numbers */}
                        <div className="hidden sm:flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToPage(i)}
                                    disabled={loading}
                                    className={`px-2 py-1 rounded text-sm ${i === currentPage ? 'bg-[var(--primary-500)] text-white' : 'border hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={next}
                            disabled={loading || currentPage >= totalPages - 1}
                            className={`px-3 py-1 rounded border text-sm ${loading || currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipStudentsTable;



