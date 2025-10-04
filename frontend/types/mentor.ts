export interface Mentor {
  id: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  avatar: string;
  color: string;
}

export interface Message {
  id: string;
  mentorId: string | 'user';
  mentorName: string;
  content: string;
  timestamp: Date;
  avatar?: string;
}

export interface Chat {
  id: string;
  title: string;
  question: string;
  messages: Message[];
  selectedMentors: string[];
  createdAt: Date;
}

