import type { ChangeEvent } from 'react';
import { Upload, Link, Send } from 'lucide-react';

interface ProjectSubmissionFormProps {
  file: File | null;
  fileUrl: string;
  isSubmitting: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const ProjectSubmissionForm = ({
  file,
  fileUrl,
  isSubmitting,
  onFileChange,
  onUrlChange,
  onSubmit
}: ProjectSubmissionFormProps) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Project</h3>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload File (Optional)
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={onFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 hover:border-[var(--primary-500)] rounded-2xl cursor-pointer transition-colors"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {file ? file.name : 'Click to upload file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">You can also add a project link below</p>
              </div>
            </label>
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Project Link / Repository URL (Optional)
          </label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              value={fileUrl}
              onChange={onUrlChange}
              placeholder="https://github.com/project or https://drive.google.com/..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">You can also upload a file above</p>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting || (!file && !fileUrl.trim())}
          className="w-full bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Project'}
        </button>
      </div>
    </div>
  );
};

export default ProjectSubmissionForm;
