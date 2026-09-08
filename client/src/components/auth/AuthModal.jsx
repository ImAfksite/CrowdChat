import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Radio, Sparkles, User, Lock, Mail } from 'lucide-react';

export default function AuthModal() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { username, displayName, email, password }
        : { login: username, password };

      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // One-click demo login for fast multiplayer testing
  const handleDemoLogin = async (demoUsername) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/demo-login', { username: demoUsername });
      login(res.data.token, res.data.user);
    } catch {
      setError('Demo account error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0c10] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-crowd-600 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-crowd-600/30 mb-3">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CrowdChat</h1>
          <p className="text-xs text-slate-400 mt-1">One massive public community in one shared space.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Username / Handle</label>
            <div className="relative mt-1">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="your_handle"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Cool Alias"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-crowd-600 hover:bg-crowd-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-crowd-600/30 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create CrowdChat Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-crowd-400 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Demo Test Accounts Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Demo Accounts (One-Click Testing)
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] hover:bg-rose-500/20 font-medium"
            >
              🛡️ Admin
            </button>
            <button
              onClick={() => handleDemoLogin('pixel_sam')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] hover:bg-slate-700 font-medium"
            >
              👾 Sammy
            </button>
            <button
              onClick={() => handleDemoLogin('elena_dev')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] hover:bg-slate-700 font-medium"
            >
              👩‍💻 Elena
            </button>
            <button
              onClick={() => handleDemoLogin('kai_beats')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] hover:bg-slate-700 font-medium"
            >
              🎧 Kai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
