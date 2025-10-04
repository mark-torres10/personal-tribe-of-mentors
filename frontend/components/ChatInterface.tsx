'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat, Message } from '@/types/mentor';
import { mentors } from '@/data/mentors';
import MessageBubble from './MessageBubble';

interface ChatInterfaceProps {
  chat: Chat;
  onClose: () => void;
  onUpdateChat: (chat: Chat | ((prev: Chat) => Chat)) => void;
}

export default function ChatInterface({ chat, onClose, onUpdateChat }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      mentorId: 'user',
      mentorName: 'You',
      content: input.trim(),
      timestamp: new Date(),
    };

    const question = input.trim();
    const updatedChat = { ...chat, messages: [...chat.messages, userMessage] };
    onUpdateChat(updatedChat);
    setInput('');
    setIsLoading(true);

    // Get responses from backend for each selected mentor
    const selectedMentors = mentors.filter(m => chat.selectedMentors.includes(m.id));
    
    for (const mentor of selectedMentors) {
      try {
        // Build conversation history for this mentor
        const conversationHistory = chat.messages
          .filter(m => m.mentorId === 'user' || m.mentorId === mentor.id)
          .map(m => ({
            role: m.mentorId === 'user' ? 'user' : 'assistant',
            content: m.content
          }));

        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mentor_id: mentor.id,
            mentor_name: mentor.name,
            question: question,
            conversation_history: conversationHistory
          })
        });

        if (!response.ok) throw new Error('Failed to get response');
        
        const data = await response.json();
        
        const mentorMessage: Message = {
          id: `${Date.now()}-${mentor.id}`,
          mentorId: mentor.id,
          mentorName: mentor.name,
          content: data.content,
          timestamp: new Date(),
          avatar: mentor.avatar,
        };

        onUpdateChat((prevChat: Chat) => ({
          ...prevChat,
          messages: [...prevChat.messages, mentorMessage]
        }));
      } catch (error) {
        console.error('Error getting mentor response:', error);
      }
    }
    
    setIsLoading(false);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{chat.title}</h2>
            <p className="text-sm opacity-90">
              Consulting with: {chat.selectedMentors.map(id => 
                mentors.find(m => m.id === id)?.name.split(' ')[0]
              ).join(', ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat.messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>Mentors are thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

