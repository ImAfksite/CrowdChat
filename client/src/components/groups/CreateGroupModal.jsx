import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useChat } from '../../context/ChatContext';
import api from '../../api/client';
import { Users, X } from 'lucide-react';

export default function CreateGroupModal() {
  const { isCreateGroupOpen, setIsCreateGroupOpen } = useUI();
  const { refreshGroups, setActiveView } = useChat();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!isCreateGroupOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/groups', { name: name.trim() });
      await refreshGroups();
      setActiveView({ type: 'group', id: res.data.group.id, data: res.data.group });
      setIsCreateGroupOpen(false);
      setName('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-crowd-400">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">New Private Group</h3>
          </div>
          <button onClick={() => setIsCreateGroupOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-400">
            Private groups allow up to 10 friends to chat and share media together in one shared room.
          </p>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pixel Squad, Lofi Beats"
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-crowd-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button onClick={() => setIsCreateGroupOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="px-5 py-2 text-xs font-semibold bg-crowd-600 hover:bg-crowd-500 text-white rounded-xl shadow-lg shadow-crowd-600/30 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
