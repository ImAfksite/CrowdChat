import React from 'react';

const COMMON_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '👀', '🤯', '💯', '✨'];

export default function ReactionPicker({ onSelect, onClose }) {
  return (
    <div className="absolute right-0 bottom-full mb-1 z-50 flex items-center gap-1 p-1.5 bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl animate-fade-in">
      {COMMON_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 hover:scale-125 rounded-xl transition-all text-base"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
