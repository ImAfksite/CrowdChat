import React from 'react';
import { useSocket } from '../../context/SocketContext';

export default function Avatar({ src, username, size = 'md', userId, showPresence = false, className = '' }) {
  const { presenceMap } = useSocket();
  const presence = userId ? (presenceMap[userId] || 'offline') : 'offline';

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }[size] || 'w-10 h-10';

  const presenceDotSize = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }[size] || 'w-3 h-3';

  const presenceColors = {
    online: 'bg-emerald-500 ring-2 ring-[#0f1117]',
    idle: 'bg-amber-400 ring-2 ring-[#0f1117]',
    dnd: 'bg-rose-500 ring-2 ring-[#0f1117]',
    offline: 'bg-slate-500 ring-2 ring-[#0f1117]',
  };

  const fallback = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={username || 'Avatar'}
          className={`${sizeClasses} rounded-full object-cover bg-slate-800 ring-1 ring-white/10`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'user'}`;
          }}
        />
      ) : (
        <div className={`${sizeClasses} rounded-full bg-gradient-to-tr from-crowd-600 to-indigo-500 text-white font-bold flex items-center justify-center ring-1 ring-white/10`}>
          {fallback}
        </div>
      )}

      {showPresence && userId && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ${presenceDotSize} ${presenceColors[presence] || presenceColors.offline}`}
          title={`Status: ${presence}`}
        />
      )}
    </div>
  );
}
