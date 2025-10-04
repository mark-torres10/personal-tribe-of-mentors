'use client';

import { Chat } from '@/types/mentor';

interface ChatHistoryProps {
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
}

export default function ChatHistory({ chats, activeChat, onSelectChat, onNewChat }: ChatHistoryProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4 flex flex-col shadow-2xl z-40">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tribe of Mentors</h1>
        <p className="text-sm text-gray-400">Your AI Council</p>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Consultation
      </button>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Chats</h3>
        {chats.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No conversations yet</p>
        ) : (
          chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`
                w-full text-left p-3 rounded-lg transition-all
                ${activeChat?.id === chat.id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                }
              `}
            >
              <p className="text-sm font-medium truncate">{chat.title}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(chat.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs opacity-60 mt-1 truncate">
                {chat.messages.length} messages
              </p>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          AI-powered mentorship
        </p>
      </div>
    </div>
  );
}

