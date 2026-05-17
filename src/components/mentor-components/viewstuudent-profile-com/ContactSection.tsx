
import type { FC } from 'react';

interface ContactSectionProps {
  email: string;
}

const ContactSection: FC<ContactSectionProps> = ({ email }) => {
  return (
    <div className="px-6 py-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact</h3>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0f5e8b15' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#0f5e8b' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
          <a
            href={`mailto:${email}`}
            className="text-sm text-gray-800 font-medium transition-colors truncate block"
            style={{ color: '#0f5e8b' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;

