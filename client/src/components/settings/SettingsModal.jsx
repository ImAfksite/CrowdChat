import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import {
  X,
  User,
  Shield,
  Palette,
  Volume2,
  Lock,
  Mail,
  Camera,
  Upload,
  Check,
  Moon,
  Sun,
  Laptop,
  Loader2,
  LogOut
} from 'lucide-react';

const PRESET_ACCENTS = [
  '#6366f1', '#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'
];

export default function SettingsModal() {
  const { user, updateCurrentUser, logout } = useAuth();
  const { isSettingsOpen, setIsSettingsOpen, settingsTab, setSettingsTab, theme, changeTheme } = useUI();

  // Profile fields
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [customStatus, setCustomStatus] = useState(user?.custom_status || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [accentColor, setAccentColor] = useState(user?.accent_color || '#6366f1');

  // Account fields
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Audio setting
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  if (!isSettingsOpen) return null;

  const handleAvatarUpload = async (file) => {
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
      alert('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await api.put('/users/profile', {
        displayName: displayName.trim(),
        bio: bio.trim(),
        customStatus: customStatus.trim(),
        avatarUrl: avatarUrl.trim(),
        accentColor,
      });
      updateCurrentUser(res.data.user);
      setStatusMessage('Profile updated successfully!');
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    setSaving(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await api.put('/users/account', {
        email: email.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      updateCurrentUser(res.data.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage('Account details updated successfully!');
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-3xl w-full max-w-2xl h-[85vh] flex overflow-hidden shadow-2xl">
        {/* Left Settings Navigation */}
        <div className="w-56 bg-[var(--bg-panel)] border-r border-[var(--border-color)] p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="px-3 py-2 mb-3">
              <h3 className="font-extrabold text-sm text-[var(--text-main)]">User Settings</h3>
              <p className="text-[11px] text-[var(--text-muted)]">@{user?.username}</p>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => { setSettingsTab('profile'); setStatusMessage(''); setErrorMessage(''); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  settingsTab === 'profile' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <User className="w-4 h-4" /> Edit Profile
              </button>

              <button
                onClick={() => { setSettingsTab('appearance'); setStatusMessage(''); setErrorMessage(''); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  settingsTab === 'appearance' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <Palette className="w-4 h-4" /> Appearance & Theme
              </button>

              <button
                onClick={() => { setSettingsTab('account'); setStatusMessage(''); setErrorMessage(''); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  settingsTab === 'account' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <Lock className="w-4 h-4" /> Account & Security
              </button>
            </nav>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>

        {/* Right Settings Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-sidebar)]">
          {/* Header */}
          <div className="h-14 px-6 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
            <h4 className="font-bold text-sm text-[var(--text-main)] capitalize">
              {settingsTab === 'profile' && 'Profile Settings'}
              {settingsTab === 'appearance' && 'Theme & Visuals'}
              {settingsTab === 'account' && 'Account Settings'}
            </h4>
            <button onClick={() => setIsSettingsOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {statusMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium">
                {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
                {errorMessage}
              </div>
            )}

            {/* TAB 1: PROFILE */}
            {settingsTab === 'profile' && (
              <div className="space-y-4">
                {/* Accent Banner & Avatar preview */}
                <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-panel)]">
                  <div className="h-20 p-3 flex justify-end" style={{ backgroundColor: accentColor }}>
                    <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full uppercase">
                      Banner Preview
                    </span>
                  </div>
                  <div className="px-4 pb-4 flex items-end justify-between -mt-10">
                    <div className="relative group">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleAvatarUpload(e.target.files[0])}
                        accept="image/*"
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer relative rounded-full ring-4 ring-[var(--bg-panel)] shadow-xl overflow-hidden"
                      >
                        <Avatar src={avatarUrl} username={user?.username} size="lg" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                          {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Upload Real Photo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Avatar URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Custom Status</label>
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">About Me (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1.5 flex items-center justify-between">
                    <span>Accent Banner Color</span>
                    <span className="font-mono text-[10px]">{accentColor}</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap bg-[var(--bg-panel)] p-2.5 rounded-xl border border-[var(--border-color)]">
                    {PRESET_ACCENTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAccentColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                          accentColor.toLowerCase() === c.toLowerCase() ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                        }`}
                      >
                        {accentColor.toLowerCase() === c.toLowerCase() && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                    <label className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium cursor-pointer">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                      />
                      <span>Custom</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: APPEARANCE & THEME */}
            {settingsTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-main)] mb-1">Color Theme</h5>
                  <p className="text-xs text-[var(--text-muted)] mb-3">Choose the visual aesthetic for your CrowdChat interface.</p>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Midnight Dark */}
                    <button
                      type="button"
                      onClick={() => changeTheme('dark')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        theme === 'dark'
                          ? 'border-indigo-500 bg-[#151B2B] shadow-lg ring-2 ring-indigo-500/20'
                          : 'border-[var(--border-color)] bg-[var(--bg-panel)] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Moon className="w-5 h-5 text-indigo-400" />
                        {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <h6 className="text-xs font-bold text-white">Midnight Dark</h6>
                      <p className="text-[10px] text-slate-400 mt-0.5">Classic deep navy</p>
                    </button>

                    {/* Clean White Light */}
                    <button
                      type="button"
                      onClick={() => changeTheme('light')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        theme === 'light'
                          ? 'border-indigo-500 bg-white shadow-lg ring-2 ring-indigo-500/20'
                          : 'border-[var(--border-color)] bg-[var(--bg-panel)] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <h6 className="text-xs font-bold text-slate-900">Clean Light</h6>
                      <p className="text-[10px] text-slate-500 mt-0.5">Crisp white & soft gray</p>
                    </button>

                    {/* OLED Pure Black */}
                    <button
                      type="button"
                      onClick={() => changeTheme('black')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        theme === 'black'
                          ? 'border-indigo-500 bg-black shadow-lg ring-2 ring-indigo-500/20'
                          : 'border-[var(--border-color)] bg-[var(--bg-panel)] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Laptop className="w-5 h-5 text-purple-400" />
                        {theme === 'black' && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <h6 className="text-xs font-bold text-white">OLED Black</h6>
                      <p className="text-[10px] text-slate-400 mt-0.5">Pitch black high contrast</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACCOUNT & SECURITY */}
            {settingsTab === 'account' && (
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Username</label>
                  <input
                    type="text"
                    disabled
                    value={user?.username}
                    className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-muted)] cursor-not-allowed"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">Usernames are permanent unique identifiers.</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] space-y-3">
                  <h6 className="text-xs font-bold text-[var(--text-main)]">Change Password</h6>

                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full mt-1 px-3 py-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  >
                    {saving ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
