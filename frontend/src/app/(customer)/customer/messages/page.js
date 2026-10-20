'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  MoreVertical,
  Image as ImageIcon,
  Check,
  CheckCheck,
  ChevronLeft,
  X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import * as api from '@/lib/api';
import { getRealtimeSocket } from '@/lib/realtime';
import { useToast } from '@/components/ui/ToastProvider';
import { SkeletonBlock } from '@/components/ui/LoadingStates';

const MAX_CHAT_IMAGE_SIZE = 5 * 1024 * 1024;
const CHAT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showMobileList, setShowMobileMobileList] = useState(true);
  const [myUserId, setMyUserId] = useState(null);
  const [typingState, setTypingState] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingResetRef = useRef(null);
  const typingConversationRef = useRef(null);
  const imageInputRef = useRef(null);
  const { push: showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const searchParams = new URLSearchParams(window.location.search);
    api.getMe().then((data) => setMyUserId((data.user || data)._id)).catch(() => {});
    api.getConversations()
      .then((data) => {
        if (cancelled) return;
        const convs = data.conversations || [];
        setConversations(convs);
        if (searchParams.get('conversation')) {
          const requested = convs.find((conversation) => conversation._id === searchParams.get('conversation'));
          if (requested) {
            setIsMessagesLoading(true);
            setActiveConv(requested);
          }
        } else if (convs.length > 0) {
          setIsMessagesLoading(true);
          setActiveConv(convs[0]);
        }
        if (searchParams.get('participantId')) {
          api.getOrCreateConversation({
            participantId: searchParams.get('participantId'),
            jobId: searchParams.get('jobId') || undefined,
          }).then(({ conversation }) => {
            setConversations((current) => [
              conversation,
              ...current.filter((item) => item._id !== conversation._id),
            ]);
            setIsMessagesLoading(true);
            setActiveConv(conversation);
          }).catch((err) => showToast(err.message || 'Unable to start conversation.', 'error'));
        }
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message || 'Unable to load conversations.', 'error');
      })
      .finally(() => {
        if (!cancelled) setIsConversationsLoading(false);
      });
    return () => { cancelled = true; };
  }, [showToast]);

  useEffect(() => {
    if (!activeConv) return;
    const socket = getRealtimeSocket();
    socket.emit('conversation:join', activeConv._id);
    const onMessage = ({ conversationId, message: incoming }) => {
      setConversations((current) => current.map((conversation) => (
        String(conversation._id) === String(conversationId)
          ? {
            ...conversation,
            lastMessage: incoming.text || (incoming.imageUrl ? 'Image attachment' : ''),
            lastMessageAt: incoming.createdAt || new Date().toISOString(),
            unreadCount: String(conversationId) === String(activeConv._id)
              ? 0
              : (conversation.unreadCount || 0) + 1,
          }
          : conversation
      )));
      if (String(conversationId) !== String(activeConv._id)) return;
      setMessages((current) => (
        current.some((item) => item._id === incoming._id) ? current : [...current, incoming]
      ));
      socket.emit('message:delivered', {
        conversationId,
        messageIds: [incoming._id],
      });
      api.getMessages(activeConv._id)
        .then((data) => setMessages(data.messages || []))
        .catch((err) => showToast(err.message || 'Unable to update read status.', 'error'));
    };
    const onMessageSent = ({ conversationId, message: outgoing }) => {
      if (String(conversationId) !== String(activeConv._id)) return;
      setMessages((current) => (
        current.some((item) => item._id === outgoing._id) ? current : [...current, outgoing]
      ));
    };
    const onMessageStatus = ({ conversationId, messageIds, status }) => {
      if (String(conversationId) !== String(activeConv._id) || !Array.isArray(messageIds)) return;
      const ids = new Set(messageIds.map(String));
      setMessages((current) => current.map((item) => (
        ids.has(String(item._id))
          ? { ...item, deliveryStatus: status, isRead: status === 'read' || item.isRead }
          : item
      )));
    };
    const onTyping = ({ conversationId, userId, role, isTyping }) => {
      if (String(conversationId) !== String(activeConv._id) || String(userId) === String(myUserId)) return;
      if (typingResetRef.current) clearTimeout(typingResetRef.current);
      if (!isTyping) {
        setTypingState(null);
        return;
      }
      setTypingState({
        conversationId: String(conversationId),
        role: role === 'customer' ? 'Customer' : 'Worker',
      });
      typingResetRef.current = setTimeout(() => setTypingState(null), 2500);
    };
    socket.on('message:created', onMessage);
    socket.on('message:sent', onMessageSent);
    socket.on('message:status', onMessageStatus);
    socket.on('conversation:typing', onTyping);
    return () => {
      if (typingConversationRef.current === String(activeConv._id)) {
        socket.emit('conversation:typing', { conversationId: activeConv._id, isTyping: false });
        typingConversationRef.current = null;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('conversation:leave', activeConv._id);
      socket.off('message:created', onMessage);
      socket.off('message:sent', onMessageSent);
      socket.off('message:status', onMessageStatus);
      socket.off('conversation:typing', onTyping);
    };
  }, [activeConv, myUserId, showToast]);

  useEffect(() => {
    if (!activeConv) return;
    let cancelled = false;
    api.getMessages(activeConv._id)
      .then((data) => {
        if (cancelled) return;
        setMessages(data.messages || []);
        setConversations((current) => current.map((conversation) => (
          String(conversation._id) === String(activeConv._id)
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )));
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message || 'Unable to load messages.', 'error');
      })
      .finally(() => {
        if (!cancelled) setIsMessagesLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeConv, showToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => {
    if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl);
  }, [selectedImage]);

  const handleSend = async () => {
    if ((!message.trim() && !selectedImage) || !activeConv || isSending) return;
    const text = message.trim();
    const image = selectedImage;
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticId,
      sender: { _id: myUserId },
      text,
      imageUrl: image?.previewUrl,
      createdAt: new Date().toISOString(),
      deliveryStatus: 'sent',
      pending: true,
    };
    setMessages((current) => [...current, optimisticMessage]);
    setMessage('');
    setIsSending(true);
    const socket = getRealtimeSocket();
    socket.emit('conversation:typing', { conversationId: activeConv._id, isTyping: false });
    typingConversationRef.current = null;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    try {
      let body = { text };
      if (image) {
        body = new FormData();
        if (text) body.append('text', text);
        body.append('image', image.file);
      }
      const data = await api.sendMessage(activeConv._id, body);
      const outgoing = data.message || optimisticMessage;
      setMessages((current) => {
        const withoutOptimistic = current.filter((item) => item._id !== optimisticId);
        return withoutOptimistic.some((item) => item._id === outgoing._id)
          ? withoutOptimistic
          : [...withoutOptimistic, outgoing];
      });
      setSelectedImage(null);
      setConversations((current) => current.map((conversation) => (
        String(conversation._id) === String(activeConv._id)
          ? { ...conversation, lastMessage: text || (image ? 'Image attachment' : ''), lastMessageAt: outgoing.createdAt }
          : conversation
      )));
    } catch (err) {
      setMessages((current) => current.filter((item) => item._id !== optimisticId));
      setMessage(text);
      showToast(err.message || 'Unable to send message.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelection = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!CHAT_IMAGE_TYPES.includes(file.type)) {
      showToast('Choose a PNG, JPEG, or WebP image.', 'error');
      return;
    }
    if (file.size > MAX_CHAT_IMAGE_SIZE) {
      showToast('Images must be 5 MB or smaller.', 'error');
      return;
    }
    setSelectedImage({
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const handleMessageChange = (event) => {
    const nextMessage = event.target.value;
    setMessage(nextMessage);
    if (!activeConv) return;
    const socket = getRealtimeSocket();
    const conversationId = String(activeConv._id);
    if (nextMessage.trim() && typingConversationRef.current !== conversationId) {
      typingConversationRef.current = conversationId;
      socket.emit('conversation:typing', { conversationId, isTyping: true });
    } else if (!nextMessage.trim() && typingConversationRef.current === conversationId) {
      typingConversationRef.current = null;
      socket.emit('conversation:typing', { conversationId, isTyping: false });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (nextMessage.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        if (typingConversationRef.current !== conversationId) return;
        typingConversationRef.current = null;
        socket.emit('conversation:typing', { conversationId, isTyping: false });
      }, 1500);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== myUserId) || conv.participants?.[0] || {};
  };
  const typingRole = typingState?.conversationId === String(activeConv?._id)
    ? typingState.role
    : '';

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
          {isConversationsLoading ? (
            <div className="space-y-4 p-4" role="status" aria-label="Loading conversations">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-2/3" />
                    <SkeletonBlock className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-tertiary">No conversations yet.</div>
          ) : conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const lastMsg = conv.lastMessage;
            return (
              <button
                key={conv._id}
                onClick={() => {
                  if (activeConv?._id !== conv._id) setIsMessagesLoading(true);
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
                    {lastMsg?.text || lastMsg?.content || (typeof lastMsg === 'string' ? lastMsg : 'No messages yet')}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="self-center flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-white" aria-label={`${conv.unreadCount} unread messages`}>
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
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
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${typingRole ? 'text-primary-600' : 'text-text-tertiary'}`} aria-live="polite">
                      {typingRole ? `${typingRole} is typing…` : (other.serviceCategory || other.role || 'User')}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
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

          {isMessagesLoading ? (
            <div className="space-y-5 py-6" role="status" aria-label="Loading messages">
              <SkeletonBlock className="h-12 w-3/5 max-w-md rounded-2xl" />
              <SkeletonBlock className="ml-auto h-16 w-2/3 max-w-lg rounded-2xl" />
              <SkeletonBlock className="h-14 w-1/2 max-w-sm rounded-2xl" />
            </div>
          ) : messages.length === 0 ? (
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
                  {msg.imageUrl && (
                    <button
                      type="button"
                      className="mb-2 block overflow-hidden rounded-xl"
                      onClick={() => setPreviewImage(api.getImageUrl(msg.imageUrl))}
                      aria-label="View image attachment"
                    >
                      <img
                        src={api.getImageUrl(msg.imageUrl)}
                        alt="Chat attachment"
                        className="max-h-72 max-w-full rounded-xl object-contain"
                        loading="lazy"
                      />
                    </button>
                  )}
                  {(msg.text || msg.content) && (
                    <p className="text-sm font-medium leading-relaxed">{msg.text || msg.content}</p>
                  )}
                  <div className={`flex items-center gap-1 mt-2 ${isMe ? 'justify-end text-primary-light' : 'justify-start text-text-tertiary'}`}>
                    <span className="text-[9px] font-bold uppercase">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {isMe && (msg.deliveryStatus === 'read' || msg.isRead
                      ? <CheckCheck className="w-4 h-4 text-emerald-300" aria-label="Read" />
                      : msg.deliveryStatus === 'delivered'
                        ? <CheckCheck className="w-4 h-4 text-primary-light" aria-label="Delivered" />
                        : <Check className="w-3 h-3" aria-label="Sent" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-6 bg-white border-t border-neutral-100">
          {selectedImage && (
            <div className="mx-auto mb-3 flex max-w-5xl items-center gap-3 rounded-xl border border-border bg-neutral-50 p-2">
              <img src={selectedImage.previewUrl} alt="Selected attachment preview" className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{selectedImage.file.name}</p>
                <p className="text-xs text-text-tertiary">{(selectedImage.file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-lg p-2 text-text-tertiary hover:bg-neutral-200"
                aria-label="Remove selected image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-1 mb-1 shrink-0">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelection}
                className="hidden"
                aria-label="Choose an image to attach"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="rounded-xl p-2 text-text-tertiary transition-colors hover:text-primary"
                aria-label="Attach an image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 bg-neutral-50 border border-border rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-primary transition-all">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-text-primary placeholder:text-text-tertiary"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={(!message.trim() && !selectedImage) || isSending}
              className="mb-1 p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
            onClick={() => setPreviewImage(null)}
            aria-label="Close image preview"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="Full-size chat attachment"
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
