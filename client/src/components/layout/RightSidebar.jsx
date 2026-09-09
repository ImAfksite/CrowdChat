import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useUI } from '../../context/UIContext';
import Avatar from '../common/Avatar';
import { Users, Crown, Shield } from 'lucide-react';

export default function RightSidebar() {
  const { activeView, activeChatMembers } = useChat();
  const { setInspectUser } = useUI();

  return (
    <aside className="hidden xl:flex w-64 bg-[var(--bg-sidebar)] border-l border-[var(--border-color)] flex-col">
      {/* Header */}
      <div className="h-16 px-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>In This Chat ({activeChatMembers.length})</span>
        </h3>
      </div>

      {/* Member Roster for Active Room */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {activeChatMembers.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--text-muted)] italic">
            Connecting to room...
          </div>
        ) : (
          activeChatMembers.map((m) => (
            <div
              key={m.id}
              onClick={() => setInspectUser(m.id)}
              className="flex items-center justify-between p-2 hover:bg-[var(--bg-card)] rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  src={m.avatar_url}
                  username={m.username}
                  userId={m.id}
                  showPresence={true}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                    {m.display_name || m.username}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">@{m.username}</p>
                </div>
              </div>

              {m.role === 'admin' && (
                <span className="text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                  Admin
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
