import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import ReactionPicker from './ReactionPicker';
import YouTubeEmbed from './YouTubeEmbed';
import LinkPreviewCard from './LinkPreviewCard';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow, format } from 'date-fns';
import { MessageSquareReply, SmilePlus, MoreHorizontal, ShieldAlert, Edit2, Trash2 } from 'lucide-react';

export default function MessageItem({ message, onReply }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { setReportModalData, setInspectUser } = useUI();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isAuthor = user?.id === message.sender_id;
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  // URLs & YouTube parser
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.content ? message.content.match(urlRegex) : null;
  const ytMatch = message.content ? message.content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i) : null;
  const ytId = ytMatch ? ytMatch[1] : null;

  const handleToggleReaction = (emoji) => {
    if (!socket) return;
    if (message.channel_id) {
      socket.emit('chat:toggle_reaction', { messageId: message.id, emoji, channelId: message.channel_id });
    } else if (message.recipient_id) {
      const otherId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
      socket.emit('dm:toggle_reaction', { messageId: message.id, emoji, otherUserId: otherId });
    } else if (message.group_id) {
      socket.emit('group:toggle_reaction', { messageId: message.id, emoji, groupId: message.group_id });
    }
  };

  const handleSaveEdit = () => {
    if (!socket || !editContent.trim()) return;
    socket.emit('chat:edit_message', { messageId: message.id, content: editContent.trim() }, () => {
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    if (!socket || !window.confirm('Delete this message?')) return;
    socket.emit('chat:delete_message', { messageId: message.id });
  };

  return (
    <div className="group relative flex gap-3 px-4 py-2.5 rounded-2xl hover:bg-[#151B2B]/60 transition-all border border-transparent hover:border-[#232D45]/40 mb-1">
      {/* User Avatar */}
      <div onClick={() => setInspectUser(message.sender_id)} className="cursor-pointer pt-0.5 shrink-0">
        <Avatar
          src={message.sender_avatar}
          username={message.sender_username}
          userId={message.sender_id}
          showPresence={true}
          size="md"
        />
      </div>

      {/* Message Content Container */}
      <div className="flex-1 min-w-0">
        {/* Reply Preview */}
        {message.reply_to_id && message.reply_content && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 pl-3 border-l-2 border-indigo-500/60 bg-[#1A2236]/30 py-1 rounded-r-lg">
            <MessageSquareReply className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-300">@{message.reply_username}:</span>
            <span className="truncate italic text-slate-400">{message.reply_content}</span>
          </div>
        )}

        {/* Sender Header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInspectUser(message.sender_id)}
            className="font-bold text-xs hover:underline tracking-tight"
            style={{ color: message.sender_color || '#F8FAFC' }}
          >
            {message.sender_display_name || message.sender_username}
          </button>

          {message.sender_role === 'admin' && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full">
              Admin
            </span>
          )}
          {message.sender_role === 'moderator' && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
              Mod
            </span>
          )}

          <span className="text-[10px] text-slate-400 ml-1 font-medium select-none" title={format(new Date(message.created_at), 'PPpp')}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>

          {message.is_edited === 1 && !message.is_deleted && (
            <span className="text-[10px] text-slate-400 italic">(edited)</span>
          )}
        </div>

        {/* Message Text or Inline Edit */}
        {isEditing ? (
          <div className="mt-2 bg-[#1A2236] p-2.5 rounded-xl border border-[#232D45]">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 bg-[#0B0E14] border border-[#232D45] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={2}
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-[#232D45] text-xs text-slate-300 rounded-lg hover:bg-[#2F3D5D]">Cancel</button>
              <button onClick={handleSaveEdit} className="px-3 py-1 bg-indigo-600 text-xs text-white rounded-lg hover:bg-indigo-500 font-semibold shadow-md shadow-indigo-600/30">Save Changes</button>
            </div>
          </div>
        ) : (
          <div className={`text-sm text-slate-200 mt-1 leading-relaxed break-words ${message.is_deleted ? 'italic text-slate-400' : ''}`}>
            {message.content}
          </div>
        )}

        {/* Media / Attachment Box */}
        {message.attachment_url && !message.is_deleted && (
          <div className="mt-2.5 max-w-sm rounded-2xl overflow-hidden border border-[#232D45] bg-[#0E121B] shadow-lg">
            <img
              src={message.attachment_url}
              alt="Media"
              className="max-h-72 w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(message.attachment_url, '_blank')}
            />
          </div>
        )}

        {/* YouTube Video Player Embed */}
        {ytId && !message.is_deleted && <YouTubeEmbed videoId={ytId} />}

        {/* Rich Link Card Preview */}
        {!ytId && urls && urls.length > 0 && !message.is_deleted && (
          <LinkPreviewCard url={urls[0]} />
        )}

        {/* Reactions List */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.values(message.reactions).map((r) => {
              const hasReacted = r.users.some(u => u.id === user?.id);
              return (
                <button
                  key={r.emoji}
                  onClick={() => handleToggleReaction(r.emoji)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    hasReacted
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300 shadow-sm'
                      : 'bg-[#1A2236] border-[#232D45] text-slate-300 hover:bg-[#222D47]'
                  }`}
                  title={r.users.map(u => u.displayName || u.username).join(', ')}
                >
                  <span>{r.emoji}</span>
                  <span className="text-[11px]">{r.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Menu Bar */}
      {!message.is_deleted && (
        <div className="absolute right-4 top-2 hidden group-hover:flex items-center gap-1 bg-[#1A2236]/95 backdrop-blur-md px-2 py-1 rounded-xl border border-[#232D45] shadow-xl z-20 animate-fade-in">
          <button
            type="button"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#232D45] rounded-lg transition-colors"
            title="Add reaction"
          >
            <SmilePlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onReply(message)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#232D45] rounded-lg transition-colors"
            title="Reply"
          >
            <MessageSquareReply className="w-4 h-4" />
          </button>

          {isAuthor && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#232D45] rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {(isAuthor || isStaff) && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#232D45] rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-[#1A2236] border border-[#232D45] rounded-xl shadow-2xl py-1 z-30">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalData({
                      reportedUserId: message.sender_id,
                      messageId: message.id,
                      username: message.sender_username
                    });
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Report
                </button>
              </div>
            )}
          </div>

          {showReactionPicker && (
            <ReactionPicker
              onSelect={handleToggleReaction}
              onClose={() => setShowReactionPicker(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
