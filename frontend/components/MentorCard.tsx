'use client';

import { Mentor } from '@/types/mentor';

interface MentorCardProps {
  mentor: Mentor;
  isSelected: boolean;
  onToggle: (mentorId: string) => void;
}

export default function MentorCard({ mentor, isSelected, onToggle }: MentorCardProps) {
  return (
    <button
      onClick={() => onToggle(mentor.id)}
      className={`
        relative p-5 rounded-xl transition-all duration-200 text-left 
        min-w-[280px] max-w-[280px] snap-start flex-shrink-0
        ${isSelected 
          ? 'border-2 border-primary-500 bg-primary-50 shadow-lg' 
          : 'border-2 border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
        }
      `}
    >
      {/* Selection indicator */}
      <div className="absolute top-3 right-3">
        <div className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${isSelected 
            ? 'border-primary-500 bg-primary-500' 
            : 'border-gray-300 bg-white'
          }
        `}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className={`
        w-14 h-14 rounded-full ${mentor.color} flex items-center justify-center text-2xl mb-3
      `}>
        {mentor.avatar}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-gray-900">{mentor.name}</h3>
        <p className="text-xs font-medium text-primary-600">{mentor.title}</p>
        <p className="text-xs font-semibold text-gray-700 italic">&ldquo;{mentor.tagline}&rdquo;</p>
      </div>
    </button>
  );
}

