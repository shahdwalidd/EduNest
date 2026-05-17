
import type { FC } from 'react';
import type { SocialMedia } from '../../../types/viewStudent.types';
import type { JSX } from 'react/jsx-runtime';

interface SocialMediaSectionProps {
  socialMedia: SocialMedia[];
}

const ALLOWED: SocialMedia['platform'][] = ['LinkedIn', 'GitHub'];

const PLATFORM_CONFIG: Record<string, {
  icon: JSX.Element;
  bg: string;
  color: string;
  label: string;
}> = {
  LinkedIn: {
    bg: '#0A66C2',
    color: '#fff',
    label: 'LinkedIn',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  GitHub: {
    bg: '#24292F',
    color: '#fff',
    label: 'GitHub',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
};

const SocialMediaSection: FC<SocialMediaSectionProps> = ({ socialMedia }) => {
  const filtered = socialMedia.filter(s => ALLOWED.includes(s.platform));

  return (
    <div className="px-6 py-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Social</h3>
      <div className="flex flex-col gap-2.5">
        {filtered.map((social) => {
          const cfg = PLATFORM_CONFIG[social.platform];
          const hasUrl = !!social.url;

          const inner = (
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              hasUrl
                ? 'border-gray-100 hover:border-gray-200 hover:shadow-sm cursor-pointer'
                : 'border-dashed border-gray-200 opacity-60 cursor-default'
            }`}>
              {/* Icon bubble */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: hasUrl ? cfg.bg : '#f3f4f6', color: hasUrl ? cfg.color : '#9ca3af' }}
              >
                {cfg.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-500">{cfg.label}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {hasUrl ? social.url : 'Not provided'}
                </p>
              </div>

              {/* Arrow if linked */}
              {hasUrl && (
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </div>
          );

          return hasUrl ? (
            <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
              {inner}
            </a>
          ) : (
            <div key={social.platform}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaSection;

