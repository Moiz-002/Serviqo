'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Paperclip,
  Smile,
  CheckCheck,
  User,
  ChevronLeft
} from 'lucide-react';
import Card from '@/components/ui/Card';

const DUMMY_CHATS = [
  {
    id: 1,
    name: 'Ahmad Hassan',
    role: 'Electrician',
    avatar: '/profile_1.png',
    lastMessage: 'I can come over at 4 PM today to check the wiring.',
    time: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Maria S.',
    role: 'Deep Cleaning',
    avatar: '/profile_2.png',
    lastMessage: 'The quote for the full house cleaning is attached.',
    time: '1h ago',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Usman K.',
    role: 'Plumber',
    avatar: '',
    lastMessage: 'Fixed! Please check the sink now.',
    time: 'Yesterday',
    unread: 0,
    online: false,
  }
];

const DUMMY_MESSAGES = [
  { id: 1, senderId: 'worker', text: 'Hello Zainab! I saw your request for the ceiling fan installation.', time: '10:05 AM' },
  { id: 2, senderId: 'me', text: 'Hi Ahmad! Yes, I need two fans installed in the bedrooms.', time: '10:07 AM' },
  { id: 3, senderId: 'worker', text: 'I have experience with all major brands. Do you already have the fans or should I bring them?', time: '10:08 AM' },
  { id: 4, senderId: 'me', text: 'I already bought them. Just need the installation and some basic testing of the switches.', time: '10:10 AM' },
  { id: 5, senderId: 'worker', text: 'Perfect. I can come over at 4 PM today to check the wiring.', time: '10:12 AM' },
];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(DUMMY_CHATS[0]);
  const [message, setMessage] = useState('');
  const [showMobileList, setShowMobileMobileList] = useState(true);

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex gap-6 animate-in fade-in duration-500">
      {/* Contact List */}
      <Card className={`
        w-full md:w-80 lg:w-96 p-0 border-neutral-200/60 overflow-hidden flex flex-col shrink-0
        ${!showMobileList ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-6 border-b border-neutral-100">
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Messages</h1>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {DUMMY_CHATS.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChat(chat);
                setShowMobileMobileList(false);
              }}
              className={`
                w-full p-4 flex gap-4 transition-all border-l-4
                ${activeChat.id === chat.id 
                  ? 'bg-primary-subtle border-primary' 
                  : 'bg-white border-transparent hover:bg-neutral-50'}
              `}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50">
                  {chat.avatar ? (
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary font-black">
                      {chat.name.charAt(0)}
                    </div>
                  )}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-text-primary text-sm truncate">{chat.name}</h4>
                  <span className="text-[10px] font-bold text-text-tertiary uppercase">{chat.time}</span>
                </div>
                <p className="text-xs text-text-secondary font-medium mb-1 uppercase tracking-widest">{chat.role}</p>
                <p className={`text-xs truncate ${chat.unread > 0 ? 'font-black text-text-primary' : 'font-medium text-text-tertiary'}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 self-center">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Window */}
      <Card className={`
        flex-1 p-0 border-neutral-200/60 overflow-hidden flex flex-col
        ${showMobileList ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-neutral-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMobileMobileList(true)}
              className="md:hidden p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
              {activeChat.avatar ? (
                <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary font-black">
                  {activeChat.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-black text-text-primary leading-tight">{activeChat.name}</h3>
              <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest mt-0.5">
                {activeChat.role} • {activeChat.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-text-secondary hover:bg-neutral-100 rounded-xl transition-colors hidden sm:block">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-text-secondary hover:bg-neutral-100 rounded-xl transition-colors hidden sm:block">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-text-secondary hover:bg-neutral-100 rounded-xl transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/30">
          <div className="flex justify-center">
            <span className="px-4 py-1.5 bg-white border border-border rounded-full text-[10px] font-black text-text-tertiary uppercase tracking-widest shadow-sm">
              Today
            </span>
          </div>

          {DUMMY_MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm
                ${msg.senderId === 'me' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-neutral-100 text-text-primary rounded-tl-none'}
              `}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-2 ${msg.senderId === 'me' ? 'justify-end text-primary-light' : 'justify-start text-text-tertiary'}`}>
                  <span className="text-[9px] font-bold uppercase">{msg.time}</span>
                  {msg.senderId === 'me' && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-6 bg-white border-t border-neutral-100">
          <div className="flex items-end gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-1 mb-1 shrink-0">
              <button className="p-2 text-text-tertiary hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
              <button className="p-2 text-text-tertiary hover:text-primary transition-colors hidden sm:block"><ImageIcon className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 bg-neutral-50 border border-border rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-primary transition-all">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-text-primary placeholder:text-text-tertiary"
              />
              <button className="text-text-tertiary hover:text-warning transition-colors"><Smile className="w-5 h-5" /></button>
            </div>

            <button className="mb-1 p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
