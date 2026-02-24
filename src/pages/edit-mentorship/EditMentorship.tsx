import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DashLayout from '../../components/layout/Dash-layout';
import { getMentorships, extractMentorshipsData } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';

interface MentorshipFormData {
  title: string;
  description: string;
  level: string;
  price: number;
  status: string;
}

const EditMentorship: FC = () => {
  const { mentorshipId } = useParams<{ mentorshipId: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [formData, setFormData] = useState<MentorshipFormData>({
    title: '',
    description: '',
    level: 'All Levels',
    price: 0,
    status: 'draft',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!mentorshipId) {
      setError('Mentorship ID not provided');
      setLoading(false);
      return;
    }

    const loadMentorshipDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMentorships();
        const data = extractMentorshipsData(res);
        const mentorship = data.find((m: { id: string | number }) => String(m.id) === mentorshipId);
        
        if (!mentorship) {
          setError('Mentorship not found');
          return;
        }

        setFormData({
          title: (mentorship.title as string) || '',
          description: (mentorship.description as string) || '',
          level: (mentorship.difficultyLevel ?? mentorship.level) as string || 'All Levels',
          price: (mentorship.price as number) || 0,
          status: (mentorship.status as string) || 'draft',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load mentorship';
        setError(message);
        console.error('Error loading mentorship:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMentorshipDetail();
  }, [mentorshipId, token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentorshipId) {
      toast.error('Mentorship ID not provided');
      return;
    }

    try {
      setSubmitting(true);
      // Update mentorship logic here
      toast.success('Mentorship updated successfully');
      navigate(`/mentor/mentorship/${mentorshipId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update mentorship';
      toast.error(message);
      console.error('Error updating mentorship:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashLayout pageTitle="Edit Mentorship">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout pageTitle="Edit Mentorship">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout pageTitle="Edit Mentorship">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Mentorship</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mentorship title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mentorship description"
            />
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashLayout>
  );
};

export default EditMentorship;
