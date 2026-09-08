import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function YouTubeEmbed({ videoId }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) return null;

  return (
    <div className="mt-2.5 max-w-lg rounded-xl overflow-hidden bg-black/40 border border-slate-800 shadow-lg">
      {!isPlaying ? (
        <div
          onClick={() => setIsPlaying(true)}
          className="relative group cursor-pointer aspect-video bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)` }}
        >
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
          <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all z-10">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
          <span className="absolute bottom-2 left-2 text-xs bg-black/80 px-2 py-0.5 rounded font-mono text-white">
            Watch YouTube Video
          </span>
        </div>
      ) : (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title="YouTube player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
