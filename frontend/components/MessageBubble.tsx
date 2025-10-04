'use client';

import { Message } from '@/types/mentor';
import { mentors } from '@/data/mentors';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.mentorId === 'user';
  const mentor = mentors.find(m => m.id === message.mentorId);

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg
        ${isUser ? 'bg-gray-700' : mentor?.color || 'bg-gray-400'}
      `}>
        {isUser ? '👤' : mentor?.avatar || '🤖'}
      </div>

      {/* Message content */}
      <div className={`
        flex flex-col max-w-[70%]
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <div className={`
          px-4 py-3 rounded-2xl
          ${isUser 
            ? 'bg-primary-500 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }
        `}>
          {!isUser && (
            <p className="text-xs font-semibold mb-1 opacity-75">{message.mentorName}</p>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

