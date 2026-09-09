import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useUI } from '../../context/UIContext';
import { Hash, MessageSquare, Users, Menu } from 'lucide-react';

export default function TopNavbar() {
  const { activeView, typingUsers } = useChat();
  const { setIsMobileSidebarOpen } = useUI();

  const currentKey = `${activeView.type === 'channel' ? activeView.id : ''}_${activeView.type === 'dm' ? activeView.id : ''}_${activeView.type === 'group' ? activeView.id : ''}`;
  const typingUser = typingUsers[currentKey];

  return (
    <header className="h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-color)] px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] lg:hidden rounded-lg bg-[var(--bg-card)]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-indigo-400 flex items-center justify-center shrink-0">
            {activeView.type === 'channel' && <Hash className="w-5 h-5" />}
            {activeView.type === 'dm' && <MessageSquare className="w-5 h-5" />}
            {activeView.type === 'group' && <Users className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[var(--text-main)] truncate flex items-center gap-2">
              {activeView.type === 'channel' && `#${activeView.data?.name || 'main'}`}
              {activeView.type === 'dm' && (activeView.data?.display_name || 'Direct Message')}
              {activeView.type === 'group' && (activeView.data?.name || 'Group Chat')}
            </h2>
            {typingUser ? (
              <p className="text-[11px] text-indigo-400 animate-pulse font-medium truncate">
                ✍️ {typingUser} is typing...
              </p>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)] truncate hidden sm:block">
                {activeView.data?.topic || 'One community in one place.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
