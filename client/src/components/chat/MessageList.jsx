import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { useChat } from '../../context/ChatContext';
import { Hash, MessageCircle, Users, Loader2 } from 'lucide-react';

export default function MessageList() {
  const { messages, loadingMessages, activeView, setReplyingTo } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loadingMessages) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-crowd-400" />
        <span className="text-sm">Connecting to CrowdChat stream...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {/* Welcome header for new chats */}
      <div className="px-4 py-8 mb-4 border-b border-slate-800/80 select-none">
        <div className="w-12 h-12 rounded-2xl bg-crowd-600/20 text-crowd-400 flex items-center justify-center mb-3">
          {activeView.type === 'channel' && <Hash className="w-6 h-6" />}
          {activeView.type === 'dm' && <MessageCircle className="w-6 h-6" />}
          {activeView.type === 'group' && <Users className="w-6 h-6" />}
        </div>
        <h2 className="text-xl font-bold text-white">
          {activeView.type === 'channel' && `Welcome to #${activeView.data?.name || 'main'}!`}
          {activeView.type === 'dm' && `This is the start of your 1-to-1 conversation with @${activeView.data?.display_name || 'user'}`}
          {activeView.type === 'group' && `Welcome to ${activeView.data?.name || 'Group'}`}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {activeView.type === 'channel' && (activeView.data?.topic || 'One large community in one place. Keep it fun and respectful!')}
          {activeView.type === 'dm' && 'Direct and private messages between the two of you.'}
          {activeView.type === 'group' && 'Private group for up to 10 friends.'}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No messages here yet. Be the first to start the conversation!
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onReply={(msg) => setReplyingTo(msg)}
          />
        ))
      )}

      <div ref={bottomRef} />
    </div>
  );
}
