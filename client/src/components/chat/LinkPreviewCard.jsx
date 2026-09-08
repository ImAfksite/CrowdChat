import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { ExternalLink } from 'lucide-react';

export default function LinkPreviewCard({ url }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await api.get(`/links/preview?url=${encodeURIComponent(url)}`);
        if (isMounted && res.data.preview) {
          setPreview(res.data.preview);
        }
      } catch {
        // silent fail
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [url]);

  if (loading || !preview) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2.5 flex flex-col sm:flex-row max-w-xl rounded-xl bg-slate-900/90 border border-slate-800 hover:border-crowd-500/50 transition-all overflow-hidden group shadow-md"
    >
      {preview.image && (
        <div className="sm:w-36 h-28 shrink-0 bg-slate-800 overflow-hidden">
          <img src={preview.image} alt={preview.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[11px] font-semibold text-crowd-400 flex items-center gap-1 uppercase tracking-wider">
            {preview.siteName || 'Link Preview'}
            <ExternalLink className="w-3 h-3 inline" />
          </span>
          <h4 className="text-sm font-medium text-slate-100 group-hover:text-crowd-300 line-clamp-1 transition-colors">
            {preview.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
            {preview.description}
          </p>
        </div>
      </div>
    </a>
  );
}
