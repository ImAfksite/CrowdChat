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
  Lock,
  Sparkles
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
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111622] border-r border-[#232D45] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#232D45] flex items-center justify-between bg-[#111622]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              CrowdChat
              <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20">LIVE</span>
            </h1>
            <p className="text-[11px] text-slate-400">One Shared Space</p>
          </div>
        </div>
      </div>

      {/* Global Quick Search Button */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#151B2B] hover:bg-[#1A2236] border border-[#232D45] rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner group"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span>Search messages...</span>
          </span>
          <kbd className="text-[10px] bg-[#232D45] text-slate-300 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Public Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Public Channels</span>
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsCreateChannelOpen(true)}
                className="w-5 h-5 rounded-md hover:bg-[#1A2236] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Create Channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {channels.map((chan) => {
              const isActive = activeView.type === 'channel' && activeView.id === chan.id;
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    setActiveView({ type: 'channel', id: chan.id, data: chan });
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-[#1A2236]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Hash className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{chan.name}</span>
                  </span>
                  {chan.is_read_only === 1 && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Direct Messages</span>
            <button
              onClick={() => setIsStartDMOpen(true)}
              className="w-5 h-5 rounded-md hover:bg-[#1A2236] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="New DM"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {dms.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-slate-400 italic bg-[#151B2B]/40 rounded-xl">No active DMs</p>
            ) : (
              dms.map((dm) => {
                const isActive = activeView.type === 'dm' && activeView.id === dm.other_user_id;
                return (
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-[#1A2236]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
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
                      <span className="w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-indigo-900" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Private Groups */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Private Groups</span>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="w-5 h-5 rounded-md hover:bg-[#1A2236] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="New Group (Max 10)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {groups.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-slate-400 italic bg-[#151B2B]/40 rounded-xl">No groups joined</p>
            ) : (
              groups.map((grp) => {
                const isActive = activeView.type === 'group' && activeView.id === grp.id;
                return (
                  <button
                    key={grp.id}
                    onClick={() => {
                      setActiveView({ type: 'group', id: grp.id, data: grp });
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-[#1A2236]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Users className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{grp.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#232D45] text-slate-300">{grp.member_count}/10</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Staff Action Button */}
      {isStaff && (
        <div className="px-3 py-2 border-t border-[#232D45]">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Shield className="w-4 h-4" /> Moderation Suite
          </button>
        </div>
      )}

      {/* Current User Card */}
      <div className="p-3 bg-[#0E121B] border-t border-[#232D45] flex items-center justify-between">
        <div
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity min-w-0 flex-1 pr-2"
        >
          <Avatar
            src={user?.avatar_url}
            username={user?.username}
            userId={user?.id}
            showPresence={true}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.display_name || user?.username}</p>
            <p className="text-[10px] text-slate-400 truncate">@{user?.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 hover:text-white hover:bg-[#1A2236] rounded-lg transition-colors"
            title="Edit Profile"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
