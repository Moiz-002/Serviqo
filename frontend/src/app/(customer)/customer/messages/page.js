'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import * as api from '@/lib/api';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showMobileList, setShowMobileMobileList] = useState(true);
  const [myUserId, setMyUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.getMe().then((data) => setMyUserId((data.user || data)._id)).catch(() => {});
    api.getConversations()
      .then((data) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0) setActiveConv(convs[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    api.getMessages(activeConv._id)
      .then((data) => setMessages(data.messages || []))
      .catch(() => {});
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !activeConv) return;
    const text = message.trim();
    setMessage('');
    try {
      const data = await api.sendMessage(activeConv._id, { content: text });
      setMessages((prev) => [...prev, data.message || { _id: Date.now(), sender: { _id: myUserId }, content: text, createdAt: new Date() }]);
    } catch {}
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== myUserId) || conv.participants?.[0] || {};
  };

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
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-tertiary">No conversations yet.</div>
          ) : conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const lastMsg = conv.lastMessage;
            return (
              <button
                key={conv._id}
                onClick={() => {
                  setActiveConv(conv);
                  setShowMobileMobileList(false);
                }}
                className={`
                  w-full p-4 flex gap-4 transition-all border-l-4
                  ${activeConv?._id === conv._id
                    ? 'bg-primary-subtle border-primary'
                    : 'bg-white border-transparent hover:bg-neutral-50'}
                `}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50">
                    {other.profilePicture ? (
                      <img src={other.profilePicture} alt={other.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary font-black">
                        {(other.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-text-primary text-sm truncate">{other.name || 'Unknown'}</h4>
                    <span className="text-[10px] font-bold text-text-tertiary uppercase">
                      {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-medium mb-1 uppercase tracking-widest">{other.serviceCategory || other.role || ''}</p>
                  <p className="text-xs truncate font-medium text-text-tertiary">
                    {lastMsg?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
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
            {activeConv && (() => {
              const other = getOtherParticipant(activeConv);
              return (
                <>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
                    {other.profilePicture ? (
                      <img src={other.profilePicture} alt={other.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary font-black">
                        {(other.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-text-primary leading-tight">{other.name || 'Unknown'}</h3>
                    <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest mt-0.5">
                      {other.serviceCategory || other.role || 'User'}
                    </p>
                  </div>
                </>
              );
            })()}
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

          {messages.length === 0 ? (
            <div className="text-center text-sm text-text-tertiary py-12">No messages yet. Say hello!</div>
          ) : messages.map((msg) => {
            const isMe = msg.sender?._id === myUserId || msg.sender === myUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm
                  ${isMe
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white border border-neutral-100 text-text-primary rounded-tl-none'}
                `}>
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-2 ${isMe ? 'justify-end text-primary-light' : 'justify-start text-text-tertiary'}`}>
                    <span className="text-[9px] font-bold uppercase">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
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
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-text-primary placeholder:text-text-tertiary"
              />
              <button className="text-text-tertiary hover:text-warning transition-colors"><Smile className="w-5 h-5" /></button>
            </div>

            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="mb-1 p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
