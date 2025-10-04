'use client';

import { useState } from 'react';
import { Chat, Message } from '@/types/mentor';
import { mentors } from '@/data/mentors';
import MentorCard from '@/components/MentorCard';
import ChatInterface from '@/components/ChatInterface';
import ChatHistory from '@/components/ChatHistory';

export default function Home() {
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const toggleMentor = (mentorId: string) => {
    setSelectedMentors(prev =>
      prev.includes(mentorId)
        ? prev.filter(id => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || selectedMentors.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      mentorId: 'user',
      mentorName: 'You',
      content: question.trim(),
      timestamp: new Date(),
    };

    const newChat: Chat = {
      id: Date.now().toString(),
      title: question.trim().slice(0, 50) + (question.length > 50 ? '...' : ''),
      question: question.trim(),
      messages: [userMessage],
      selectedMentors: [...selectedMentors],
      createdAt: new Date(),
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setQuestion('');

    // Generate initial mentor responses from backend
    for (const mentorId of selectedMentors) {
      const mentor = mentors.find(m => m.id === mentorId)!;
      
      try {
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mentor_id: mentorId,
            mentor_name: mentor.name,
            question: question.trim(),
            conversation_history: []
          })
        });

        if (!response.ok) throw new Error('Failed to get response');
        
        const data = await response.json();
        
        const mentorMessage: Message = {
          id: `${Date.now()}-${mentorId}`,
          mentorId: mentor.id,
          mentorName: mentor.name,
          content: data.content,
          timestamp: new Date(),
          avatar: mentor.avatar,
        };

        setChats(prev => {
          return prev.map(chat =>
            chat.id === newChat.id
              ? { ...chat, messages: [...chat.messages, mentorMessage] }
              : chat
          );
        });

        setActiveChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, mentorMessage]
        } : prev);
      } catch (error) {
        console.error('Error getting mentor response:', error);
      }
    }
  };


  const handleUpdateChat = (updatedChat: Chat | ((prev: Chat) => Chat)) => {
    if (typeof updatedChat === 'function' && activeChat) {
      const newChat = updatedChat(activeChat);
      setActiveChat(newChat);
      setChats(prev => prev.map(chat => chat.id === newChat.id ? newChat : chat));
    } else if (typeof updatedChat !== 'function') {
      setActiveChat(updatedChat);
      setChats(prev => prev.map(chat => chat.id === updatedChat.id ? updatedChat : chat));
    }
  };

  const handleNewChat = () => {
    setActiveChat(null);
    setSelectedMentors([]);
    setQuestion('');
  };

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Chat History Sidebar */}
      {chats.length > 0 && (
        <ChatHistory
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      )}

      {/* Main Content */}
      <div className={`${chats.length > 0 ? 'ml-64' : ''} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Your Personal Tribe of Mentors
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select mentors and ask your question to get diverse expert perspectives
            </p>
          </div>

          {/* Mentor Gallery - Scrollable */}
          <div className="max-w-6xl mx-auto mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 px-4">Choose Your Mentors</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide">
              {mentors.map(mentor => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  isSelected={selectedMentors.includes(mentor.id)}
                  onToggle={toggleMentor}
                />
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleStartChat}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask your question here..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-base"
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    {selectedMentors.length > 0 
                      ? `${selectedMentors.length} mentor${selectedMentors.length > 1 ? 's' : ''} selected`
                      : 'Select at least one mentor'
                    }
                  </p>
                  <button
                    type="submit"
                    disabled={!question.trim() || selectedMentors.length === 0}
                    className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Ask Mentors
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Chat Interface Modal */}
      {activeChat && (
        <ChatInterface
          chat={activeChat}
          onClose={handleNewChat}
          onUpdateChat={handleUpdateChat}
        />
      )}
    </div>
  );
}
