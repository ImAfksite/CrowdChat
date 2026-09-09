import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useUI } from '../../context/UIContext';
import { Hash, MessageSquare, Users, Menu, Sparkles } from 'lucide-react';

export default function TopNavbar() {
  const { activeView, typingUsers } = useChat();
  const { setIsMobileSidebarOpen } = useUI();

  const currentKey = `${activeView.type === 'channel' ? activeView.id : ''}_${activeView.type === 'dm' ? activeView.id : ''}_${activeView.type === 'group' ? activeView.id : ''}`;
  const typingUser = typingUsers[currentKey];

  return (
    <header className="h-16 bg-[#111622]/90 backdrop-blur-md border-b border-[#232D45] px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white lg:hidden rounded-lg bg-[#1A2236]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#1A2236] border border-[#232D45] text-indigo-400 flex items-center justify-center shrink-0">
            {activeView.type === 'channel' && <Hash className="w-5 h-5" />}
            {activeView.type === 'dm' && <MessageSquare className="w-5 h-5" />}
            {activeView.type === 'group' && <Users className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
              {activeView.type === 'channel' && `#${activeView.data?.name || 'main'}`}
              {activeView.type === 'dm' && (activeView.data?.display_name || 'Direct Message')}
              {activeView.type === 'group' && (activeView.data?.name || 'Group Chat')}
            </h2>
            {typingUser ? (
              <p className="text-[11px] text-indigo-400 animate-pulse font-medium truncate">
                ✍️ {typingUser} is typing...
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {activeView.data?.topic || 'One community in one place.'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#1A2236] border border-[#232D45] text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          CrowdChat Online
        </span>
      </div>
    </header>
  );
}
