import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { X, Check, Camera, Palette, Shield, Upload, Loader2 } from 'lucide-react';

const PRESET_ACCENTS = [
  '#6366f1', // Indigo
  '#3b82f6', // Sky Blue
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ef4444', // Crimson
  '#06b6d4', // Cyan
];

export default function UserProfileModal() {
  const { user, updateCurrentUser } = useAuth();
  const { isProfileOpen, setIsProfileOpen } = useUI();
  const { setPresenceStatus } = useSocket();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [customStatus, setCustomStatus] = useState(user?.custom_status || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [accentColor, setAccentColor] = useState(user?.accent_color || '#6366f1');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  if (!isProfileOpen) return null;

  // Real Image Upload Handler
  const handleAvatarFileUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarUrl(res.data.url);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload avatar image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        displayName: displayName.trim(),
        bio: bio.trim(),
        customStatus: customStatus.trim(),
        avatarUrl: avatarUrl.trim(),
        accentColor,
      });
      updateCurrentUser(res.data.user);
      setIsProfileOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Profile save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#111622] border border-[#232D45] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Dynamic Accent Header Banner */}
        <div
          className="h-28 relative p-4 flex items-start justify-between transition-colors duration-300"
          style={{ backgroundColor: accentColor }}
        >
          <span className="text-[10px] font-bold text-white/80 bg-black/30 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
            Profile Customization
          </span>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="px-6 pb-6 pt-0 overflow-y-auto space-y-5">
          {/* Avatar and Real Photo Uploader */}
          <div className="-mt-14 flex items-end justify-between">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleAvatarFileUpload(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer relative rounded-full ring-4 ring-[#111622] shadow-2xl overflow-hidden"
              >
                <Avatar
                  src={avatarUrl}
                  username={user?.username}
                  userId={user?.id}
                  showPresence={false}
                  size="xl"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">Upload</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                <Shield className="w-3.5 h-3.5" /> Crowd Admin
              </span>
            )}
          </div>

          {/* Avatar Image URL Option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Avatar Image URL</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <Upload className="w-3 h-3" /> Upload file from device
              </button>
            </div>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/my-photo.jpg"
              className="w-full px-3 py-2 bg-[#151B2B] border border-[#232D45] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full mt-1 px-3 py-2 bg-[#151B2B] border border-[#232D45] rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Custom Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Custom Status Message</label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="What are you up to? (e.g. Exploring CrowdChat 🚀)"
              className="w-full mt-1 px-3 py-2 bg-[#151B2B] border border-[#232D45] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Bio / About */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">About Me (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="A few words about yourself..."
              className="w-full mt-1 px-3 py-2 bg-[#151B2B] border border-[#232D45] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Accent Color Picker (Presets + Custom Native Hex Picker) */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Accent Color & Theme
              </span>
              <span className="font-mono text-[10px] text-slate-400 uppercase">{accentColor}</span>
            </label>
            
            <div className="flex items-center gap-2 flex-wrap bg-[#151B2B] p-3 rounded-2xl border border-[#232D45]">
              {PRESET_ACCENTS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform shadow-sm ${
                    accentColor.toLowerCase() === color.toLowerCase() ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#111622]' : 'hover:scale-110'
                  }`}
                >
                  {accentColor.toLowerCase() === color.toLowerCase() && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}

              {/* Custom Native Color Picker */}
              <div className="flex items-center gap-2 ml-auto pl-2 border-l border-[#232D45]">
                <label className="relative cursor-pointer flex items-center gap-1 text-xs text-slate-300 font-medium hover:text-white">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-[11px] text-slate-400">Custom</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0B0E14] border-t border-[#232D45] flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#1A2236] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
