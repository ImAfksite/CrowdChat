import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useChat } from '../../context/ChatContext';
import api from '../../api/client';
import { Search, X, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessageSearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const { setActiveView } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isSearchOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/messages/search?q=${encodeURIComponent(query.trim())}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl h-[70vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        <form onSubmit={handleSearch} className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-crowd-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all conversations across CrowdChat..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button type="button" onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p className="text-xs text-slate-500 text-center py-10">Searching message archives...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">
              {query ? 'No matching messages found.' : 'Enter keyword to find messages, links, and discussions.'}
            </p>
          ) : (
            results.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  if (msg.channel_id) {
                    setActiveView({ type: 'channel', id: msg.channel_id, data: { name: msg.channel_name } });
                  }
                  setIsSearchOpen(false);
                }}
                className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">@{msg.sender_username}</span>
                    {msg.channel_name && (
                      <span className="text-[11px] bg-slate-700/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {msg.channel_name}
                      </span>
                    )}
                  </div>
                  <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-slate-200">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
