import React, { useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useUI } from '../../context/UIContext';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { Users, Info, Shield, Plus, UserX, Crown } from 'lucide-react';

export default function RightSidebar() {
  const { activeView } = useChat();
  const { presenceMap } = useSocket();
  const { setInspectUser } = useUI();
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    if (activeView.type === 'group') {
      api.get(`/groups/${activeView.id}/members`).then(res => {
        setGroupMembers(res.data.members || []);
      });
    }
  }, [activeView.type, activeView.id]);

  return (
    <aside className="hidden xl:flex w-64 bg-[#11131a] border-l border-slate-800/80 flex-col">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-800/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-crowd-400" />
          {activeView.type === 'channel' ? 'About Channel' : activeView.type === 'group' ? 'Group Details' : 'User Info'}
        </h3>
        <p className="text-xs text-slate-300 mt-2">
          {activeView.type === 'channel' && (activeView.data?.topic || 'Public conversation channel.')}
          {activeView.type === 'group' && `Private group with ${groupMembers.length} members (max 10).`}
          {activeView.type === 'dm' && '1-to-1 secure private conversation.'}
        </p>
      </div>

      {/* Member List for Groups / Online Showcase */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeView.type === 'group' ? (
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span>Members ({groupMembers.length}/10)</span>
            </div>
            <div className="space-y-1">
              {groupMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setInspectUser(m.id)}
                  className="flex items-center justify-between p-1.5 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      src={m.avatar_url}
                      username={m.username}
                      userId={m.id}
                      showPresence={true}
                      size="xs"
                    />
                    <span className="text-xs text-slate-200 truncate">{m.display_name || m.username}</span>
                  </div>
                  {m.role === 'owner' && <Crown className="w-3.5 h-3.5 text-amber-400" title="Group Owner" />}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">
              Crowd Atmosphere
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Server Type:</span>
                <span className="font-semibold text-crowd-400">Single Public Space</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rate Limit:</span>
                <span className="text-emerald-400">Protected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Moderation:</span>
                <span className="text-indigo-400">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
