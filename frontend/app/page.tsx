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

  const handleStartChat = (e: React.FormEvent) => {
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

    // Generate initial mentor responses
    setTimeout(() => {
      const responses: Message[] = selectedMentors.map((mentorId, index) => {
        const mentor = mentors.find(m => m.id === mentorId)!;
        return {
          id: `${Date.now()}-${mentorId}-${index}`,
          mentorId: mentor.id,
          mentorName: mentor.name,
          content: generateInitialResponse(mentor.name, question.trim()),
          timestamp: new Date(Date.now() + index * 1000),
          avatar: mentor.avatar,
        };
      });

      setChats(prev => {
        const updated = prev.map(chat =>
          chat.id === newChat.id
            ? { ...chat, messages: [...chat.messages, ...responses] }
            : chat
        );
        return updated;
      });

      const updatedChat = { ...newChat, messages: [...newChat.messages, ...responses] };
      setActiveChat(updatedChat);
    }, 1000);

    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setQuestion('');
  };

  const generateInitialResponse = (mentorName: string, question: string): string => {
    const responses = {
      'Dr. Elena Cortez': `Thank you for bringing this question to the table. From a strategic viewpoint, "${question}" requires us to think about the long-term implications and how this aligns with your overall vision. Let me break down my thoughts:\n\nFirst, consider the strategic context - what are your key objectives and how does this decision support them? Second, think about stakeholder impact and organizational alignment. Finally, I'd recommend creating a phased approach with clear success metrics at each stage.`,
      'Marcus Chen': `Interesting technical challenge! When thinking about "${question}", I immediately consider the architectural implications and system design patterns that would best serve you here.\n\nFrom an engineering perspective, I'd focus on: 1) Scalability - how will this perform under load? 2) Maintainability - can your team support this long-term? 3) Technical debt - are we building on solid foundations?\n\nLet me share some specific technical recommendations based on my experience...`,
      'Sarah Thompson': `Love this question! When it comes to "${question}", let's think about the user impact and growth opportunities.\n\nFrom a product perspective, I'd start by asking: What problem are we really solving? What does the data tell us about user behavior here? How can we validate our assumptions quickly?\n\nMy recommendation is to approach this iteratively - ship fast, measure everything, and let user feedback drive your next moves. Let me outline a growth-focused strategy...`,
    };
    
    return responses[mentorName as keyof typeof responses] || `Great question about: "${question}". Let me share my perspective based on my experience...`;
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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Your Personal Tribe of Mentors
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the mentors you&apos;d like to consult and ask your question. Get diverse perspectives from world-class experts.
            </p>
          </div>

          {/* Question Input */}
          <div className="max-w-4xl mx-auto mb-12">
            <form onSubmit={handleStartChat}>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 focus-within:border-primary-500 transition-colors">
                <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-3">
                  What would you like to ask your mentors?
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., How should I approach scaling my startup? What tech stack should I use for my next project? How do I balance growth with sustainability?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    {selectedMentors.length > 0 
                      ? `${selectedMentors.length} mentor${selectedMentors.length > 1 ? 's' : ''} selected`
                      : 'Select at least one mentor below'
                    }
                  </p>
                  <button
                    type="submit"
                    disabled={!question.trim() || selectedMentors.length === 0}
                    className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Start Consultation</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Mentor Selection */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Mentors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
