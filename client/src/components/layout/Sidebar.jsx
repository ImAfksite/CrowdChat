import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Avatar from '../common/Avatar';
import {
  Hash,
  MessageSquare,
  Users,
  Plus,
  Search,
  Shield,
  Settings,
  LogOut,
  Radio,
  Lock
} from 'lucide-react';

export default function Sidebar() {
  const { activeView, setActiveView, channels, dms, groups } = useChat();
  const { user, logout } = useAuth();
  const {
    setIsSearchOpen,
    setIsAdminOpen,
    setIsProfileOpen,
    setIsCreateChannelOpen,
    setIsCreateGroupOpen,
    setIsStartDMOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useUI();

  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#11131a] border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-crowd-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-crowd-600/30">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              CrowdChat
              <span className="text-[10px] font-bold text-crowd-400 bg-crowd-500/10 px-1.5 py-0.2 rounded border border-crowd-500/20">LIVE</span>
            </h1>
            <p className="text-[11px] text-slate-400">One Shared Community</p>
          </div>
        </div>
      </div>

      {/* Global Quick Actions */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" /> Search messages...
          </span>
          <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
        </button>
      </div>

      {/* Main Channel & Conversation Lists */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Public Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-slate-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Public Channels</span>
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsCreateChannelOpen(true)}
                className="hover:text-white p-0.5"
                title="Create public channel (Admin only)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {channels.map((chan) => (
              <button
                key={chan.id}
                onClick={() => {
                  setActiveView({ type: 'channel', id: chan.id, data: chan });
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeView.type === 'channel' && activeView.id === chan.id
                    ? 'bg-crowd-600 text-white shadow-md shadow-crowd-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Hash className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{chan.name}</span>
                </span>
                {chan.is_read_only === 1 && <Lock className="w-3 h-3 text-slate-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-slate-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Direct Messages</span>
            <button
              onClick={() => setIsStartDMOpen(true)}
              className="hover:text-white p-0.5"
              title="Start a Direct Message"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {dms.length === 0 ? (
              <p className="px-2 text-[11px] text-slate-400 italic">No DMs yet</p>
            ) : (
              dms.map((dm) => (
                <button
                  key={dm.conversation_id}
                  onClick={() => {
                    setActiveView({
                      type: 'dm',
                      id: dm.other_user_id,
                      data: { display_name: dm.display_name, username: dm.username }
                    });
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeView.type === 'dm' && activeView.id === dm.other_user_id
                      ? 'bg-crowd-600 text-white shadow-md shadow-crowd-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Avatar
                      src={dm.avatar_url}
                      username={dm.username}
                      userId={dm.other_user_id}
                      showPresence={true}
                      size="xs"
                    />
                    <span className="truncate">{dm.display_name || dm.username}</span>
                  </span>
                  {dm.has_unread && (
                    <span className="w-2 h-2 rounded-full bg-crowd-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Private Groups (Up to 10 members) */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-slate-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Private Groups</span>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="hover:text-white p-0.5"
              title="Create private group (max 10)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {groups.length === 0 ? (
              <p className="px-2 text-[11px] text-slate-400 italic">No groups joined</p>
            ) : (
              groups.map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => {
                    setActiveView({ type: 'group', id: grp.id, data: grp });
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeView.type === 'group' && activeView.id === grp.id
                      ? 'bg-crowd-600 text-white shadow-md shadow-crowd-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{grp.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{grp.member_count}/10</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Staff Admin Panel Quick Link */}
      {isStaff && (
        <div className="px-3 py-2 border-t border-slate-800/80">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-all"
          >
            <Shield className="w-4 h-4" /> Moderation & Admin
          </button>
        </div>
      )}

      {/* Current User Bar */}
      <div className="p-3 bg-[#0d0f15] border-t border-slate-800/80 flex items-center justify-between">
        <div
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
        >
          <Avatar
            src={user?.avatar_url}
            username={user?.username}
            userId={user?.id}
            showPresence={true}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.display_name || user?.username}</p>
            <p className="text-[10px] text-slate-400 truncate">@{user?.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
