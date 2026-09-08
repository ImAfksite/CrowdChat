import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import GifPicker from '../media/GifPicker';
import StickerPicker from '../media/StickerPicker';
import api from '../../api/client';
import {
  SendHorizontal,
  Image as ImageIcon,
  Sparkles,
  Smile,
  X,
  Loader2,
  Paperclip
} from 'lucide-react';

export default function MessageInput() {
  const { socket } = useSocket();
  const { activeView, replyingTo, setReplyingTo } = useChat();
  const { user } = useAuth();

  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null); // { url, type }
  const [uploading, setUploading] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-focus input on activeView change
  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeView.id]);

  const emitTyping = () => {
    if (!socket) return;
    socket.emit('typing:start', {
      channelId: activeView.type === 'channel' ? activeView.id : null,
      dmUserId: activeView.type === 'dm' ? activeView.id : null,
      groupId: activeView.type === 'group' ? activeView.id : null,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', {
        channelId: activeView.type === 'channel' ? activeView.id : null,
        dmUserId: activeView.type === 'dm' ? activeView.id : null,
        groupId: activeView.type === 'group' ? activeView.id : null,
      });
    }, 2000);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachment({ url: res.data.url, type: 'image' });
    } catch (err) {
      alert(err.response?.data?.error || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Support clipboard paste (Ctrl+V image upload)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          handleFileUpload(file);
        }
      }
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !attachment) || !socket) return;

    const payload = {
      content: text.trim() || (attachment ? 'Shared a media attachment' : ''),
      attachmentUrl: attachment?.url || null,
      attachmentType: attachment?.type || null,
      replyToId: replyingTo?.id || null,
    };

    if (activeView.type === 'channel') {
      socket.emit('chat:send_message', { ...payload, channelId: activeView.id }, (res) => {
        if (res?.error) alert(res.error);
      });
    } else if (activeView.type === 'dm') {
      socket.emit('dm:send_message', { ...payload, recipientId: activeView.id }, (res) => {
        if (res?.error) alert(res.error);
      });
    } else if (activeView.type === 'group') {
      socket.emit('group:send_message', { ...payload, groupId: activeView.id }, (res) => {
        if (res?.error) alert(res.error);
      });
    }

    setText('');
    setAttachment(null);
    setReplyingTo(null);
    setShowGifPicker(false);
    setShowStickerPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-[#13161f] border-t border-slate-800/80 relative">
      {/* Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-slate-800/80 rounded-lg text-xs border-l-4 border-crowd-500">
          <span className="text-slate-300 truncate">
            Replying to <span className="font-semibold text-white">@{replyingTo.sender_username}</span>: "{replyingTo.content}"
          </span>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="relative inline-block mb-2 rounded-lg overflow-hidden border border-slate-700 bg-black/40">
          <img src={attachment.url} alt="Upload preview" className="h-20 w-auto object-cover rounded" />
          <button
            onClick={() => setAttachment(null)}
            className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full p-1 shadow"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input container */}
      <div className="flex items-end gap-2 bg-slate-900/90 rounded-2xl p-1.5 border border-slate-800 focus-within:border-crowd-500/60 focus-within:ring-1 focus-within:ring-crowd-500/30 transition-all shadow-inner">
        {/* Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-slate-400 hover:text-crowd-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Attach an Image"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-crowd-400" /> : <Paperclip className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping();
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            activeView.type === 'channel'
              ? `Message #${activeView.data?.name || 'chat'}...`
              : activeView.type === 'dm'
              ? `Message @${activeView.data?.display_name || 'user'}...`
              : `Message group...`
          }
          rows={1}
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-32 py-2 px-1"
        />

        {/* Media Pickers (GIFs & Stickers) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => { setShowGifPicker(!showGifPicker); setShowStickerPicker(false); }}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              showGifPicker ? 'bg-crowd-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="GIF Search"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => { setShowStickerPicker(!showStickerPicker); setShowGifPicker(false); }}
            className={`p-2 rounded-xl transition-all ${
              showStickerPicker ? 'bg-crowd-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Stickers"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() && !attachment}
            className={`p-2 rounded-xl transition-all ${
              text.trim() || attachment
                ? 'bg-crowd-600 text-white hover:bg-crowd-500 shadow-md shadow-crowd-600/30 hover:scale-105'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Popovers */}
      {showGifPicker && (
        <GifPicker
          onSelect={(url) => {
            setAttachment({ url, type: 'gif' });
            setShowGifPicker(false);
          }}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      {showStickerPicker && (
        <StickerPicker
          onSelect={(url) => {
            setAttachment({ url, type: 'sticker' });
            setShowStickerPicker(false);
          }}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
}
