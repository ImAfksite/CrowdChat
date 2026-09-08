import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Smile } from 'lucide-react';

export default function StickerPicker({ onSelect, onClose }) {
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    api.get('/media/stickers').then(res => setStickers(res.data.stickers || []));
  }, []);

  return (
    <div className="absolute bottom-16 right-16 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex flex-col h-80">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Smile className="w-4 h-4 text-crowd-400" /> Sticker Packs
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 pt-3">
        {stickers.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.url)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 hover:scale-105 transition-all flex flex-col items-center justify-center group"
          >
            <img src={s.url} alt={s.name} className="w-12 h-12 object-contain" />
            <span className="text-[10px] text-slate-400 mt-1 truncate max-w-full">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
