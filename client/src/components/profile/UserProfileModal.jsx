import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { X, Check, Smile, Palette, Shield } from 'lucide-react';

const ACCENT_PRESETS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'];

export default function UserProfileModal() {
  const { user, updateCurrentUser } = useAuth();
  const { isProfileOpen, setIsProfileOpen } = useUI();
  const { setPresenceStatus } = useSocket();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [customStatus, setCustomStatus] = useState(user?.custom_status || '');
  const [accentColor, setAccentColor] = useState(user?.accent_color || '#6366f1');
  const [statusPresence, setLocalPresence] = useState('online');
  const [saving, setSaving] = useState(false);

  if (!isProfileOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        displayName,
        bio,
        customStatus,
        accentColor,
      });
      updateCurrentUser(res.data.user);
      setPresenceStatus(statusPresence);
      setIsProfileOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Profile save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        {/* Banner with user accent color */}
        <div className="h-24 relative p-4 flex items-start justify-end" style={{ backgroundColor: accentColor }}>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar overlay */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <Avatar
              src={user?.avatar_url}
              username={user?.username}
              userId={user?.id}
              showPresence={true}
              size="xl"
              className="ring-4 ring-slate-900 shadow-xl"
            />
            {user?.role === 'admin' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Administrator
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Custom Status</label>
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="What's happening? (e.g. Cooking pizza 🍕)"
                className="w-full mt-1 px-3 py-2 bg-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">About Me (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-2 bg-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Profile Accent Color
              </label>
              <div className="flex gap-2">
                {ACCENT_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                      accentColor === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                  >
                    {accentColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-crowd-600 hover:bg-crowd-500 text-white transition-all shadow-lg shadow-crowd-600/30"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
