import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useUI } from '../../context/UIContext';
import { Hash, MessageCircle, Users, Menu, ShieldAlert, Sparkles } from 'lucide-react';

export default function TopNavbar() {
  const { activeView, typingUsers } = useChat();
  const { setIsMobileSidebarOpen, setReportModalData } = useUI();

  // Active typing status text
  const currentKey = `${activeView.type === 'channel' ? activeView.id : ''}_${activeView.type === 'dm' ? activeView.id : ''}_${activeView.type === 'group' ? activeView.id : ''}`;
  const typingUser = typingUsers[currentKey];

  return (
    <header className="h-14 bg-[#11131a] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-800 text-crowd-400 flex items-center justify-center shrink-0">
            {activeView.type === 'channel' && <Hash className="w-4 h-4" />}
            {activeView.type === 'dm' && <MessageCircle className="w-4 h-4" />}
            {activeView.type === 'group' && <Users className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
              {activeView.type === 'channel' && activeView.data?.name}
              {activeView.type === 'dm' && (activeView.data?.display_name || 'Direct Message')}
              {activeView.type === 'group' && (activeView.data?.name || 'Group Chat')}
            </h2>
            {typingUser ? (
              <p className="text-[11px] text-crowd-400 animate-pulse truncate font-medium">
                {typingUser} is typing...
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {activeView.data?.topic || 'Active Discussion'}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
