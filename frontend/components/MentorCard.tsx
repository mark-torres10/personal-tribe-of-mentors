'use client';

import { Mentor } from '@/types/mentor';
import { useState } from 'react';

interface MentorCardProps {
  mentor: Mentor;
  isSelected: boolean;
  onToggle: (mentorId: string) => void;
}

export default function MentorCard({ mentor, isSelected, onToggle }: MentorCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onToggle(mentor.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-200 text-left w-full
        ${isSelected 
          ? 'border-primary-500 bg-primary-50 shadow-lg scale-[1.02]' 
          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
        }
      `}
    >
      {/* Selection indicator */}
      <div className="absolute top-3 right-3">
        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
          ${isSelected 
            ? 'border-primary-500 bg-primary-500' 
            : 'border-gray-300 bg-white'
          }
        `}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className={`
        w-16 h-16 rounded-full ${mentor.color} flex items-center justify-center text-3xl mb-4
        transition-transform duration-200 ${isHovered ? 'scale-110' : 'scale-100'}
      `}>
        {mentor.avatar}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
        <p className="text-sm font-medium text-primary-600">{mentor.title}</p>
        <p className="text-sm font-semibold text-gray-700 italic">&ldquo;{mentor.tagline}&rdquo;</p>
        <p className="text-sm text-gray-600 leading-relaxed">{mentor.description}</p>
      </div>
    </button>
  );
}

