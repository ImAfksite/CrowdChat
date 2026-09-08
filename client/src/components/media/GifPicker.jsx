import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Search, Sparkles } from 'lucide-react';

const CATEGORIES = ['all', 'reactions', 'memes', 'gaming', 'anime', 'hype'];

export default function GifPicker({ onSelect, onClose }) {
  const [gifs, setGifs] = useState([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGifs() {
      setLoading(true);
      try {
        const cat = activeCategory === 'all' ? '' : activeCategory;
        const res = await api.get(`/media/gifs?q=${encodeURIComponent(query)}&category=${cat}`);
        setGifs(res.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(fetchGifs, 250);
    return () => clearTimeout(timeout);
  }, [query, activeCategory]);

  return (
    <div className="absolute bottom-16 right-4 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex flex-col h-96">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-crowd-400" /> Choose a GIF
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
      </div>

      <div className="relative my-2">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="w-full pl-9 pr-3 py-1.5 bg-slate-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-crowd-500"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full capitalize shrink-0 transition-colors ${
              activeCategory === cat ? 'bg-crowd-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pt-1 pr-1">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center h-40 text-xs text-slate-500">Loading GIFs...</div>
        ) : gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.url}
            alt={gif.title}
            onClick={() => onSelect(gif.url)}
            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all border border-slate-800"
          />
        ))}
      </div>
    </div>
  );
}
