import React, { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { Search, MessageSquare, X } from 'lucide-react';

export default function StartDMModal() {
  const { isStartDMOpen, setIsStartDMOpen } = useUI();
  const { setActiveView, refreshDMs } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!isStartDMOpen) return null;

  const handleSelectUser = (targetUser) => {
    setActiveView({
      type: 'dm',
      id: targetUser.id,
      data: { display_name: targetUser.display_name, username: targetUser.username }
    });
    refreshDMs();
    setIsStartDMOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in flex flex-col h-96">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-crowd-400">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Direct Message</h3>
          </div>
          <button onClick={() => setIsStartDMOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative my-3">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a username or display name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Searching users...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              {query ? 'No matching users found' : 'Search for someone on CrowdChat to start chatting'}
            </p>
          ) : (
            results.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className="flex items-center justify-between p-2 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar_url} username={u.username} userId={u.id} size="sm" showPresence={true} />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{u.display_name}</h4>
                    <p className="text-xs text-slate-400">@{u.username}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
