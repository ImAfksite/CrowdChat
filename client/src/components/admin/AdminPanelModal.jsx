import React, { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import api from '../../api/client';
import { Shield, AlertTriangle, UserCheck, FileText, X, CheckCircle, Ban, VolumeX } from 'lucide-react';

export default function AdminPanelModal() {
  const { isAdminOpen, setIsAdminOpen } = useUI();
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdminOpen) return;
    setLoading(true);

    Promise.all([
      api.get('/admin/reports'),
      api.get('/admin/audit-logs'),
      api.get('/admin/stats')
    ]).then(([repRes, logRes, statRes]) => {
      setReports(repRes.data.reports || []);
      setAuditLogs(logRes.data.logs || []);
      setStats(statRes.data);
    }).finally(() => setLoading(false));
  }, [isAdminOpen]);

  if (!isAdminOpen) return null;

  const handleResolveReport = async (reportId, note, status = 'resolved') => {
    await api.post(`/admin/reports/${reportId}/resolve`, { note, status });
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const handleMute = async (userId, minutes) => {
    await api.post(`/admin/users/${userId}/mute`, { minutes });
    alert(`User muted for ${minutes} minutes`);
  };

  const handleBan = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently ban this user?')) return;
    await api.post(`/admin/users/${userId}/ban`, { reason: 'Violation of community safety standards' });
    alert('User permanently banned');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">CrowdChat Moderation Suite</h2>
              <p className="text-xs text-slate-400">Community Safety & System Auditing</p>
            </div>
          </div>
          <button onClick={() => setIsAdminOpen(false)} className="text-slate-400 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs & Stats bar */}
        <div className="px-6 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tab === 'reports' ? 'bg-crowd-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Reports Queue ({reports.length})
            </button>
            <button
              onClick={() => setTab('audit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tab === 'audit' ? 'bg-crowd-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Audit Trail
            </button>
          </div>

          {stats && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
              <span>Total Members: <strong className="text-white">{stats.totalUsers}</strong></span>
              <span>Total Messages: <strong className="text-white">{stats.totalMessages}</strong></span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'reports' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
                  <p className="text-sm font-semibold">Reports queue is clear</p>
                  <p className="text-xs">No pending moderation reports at this time.</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {rep.reason.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">Reported by <strong>@{rep.reporter_username}</strong></span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{rep.created_at}</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl text-sm border border-slate-800">
                      <p className="text-xs text-slate-400 font-medium mb-1">Reported User: <span className="text-white font-bold">@{rep.reported_username}</span></p>
                      {rep.message_content && (
                        <p className="text-slate-200 italic">"{rep.message_content}"</p>
                      )}
                      {rep.details && (
                        <p className="text-xs text-slate-400 mt-2">Notes: {rep.details}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => handleMute(rep.reported_user_id, 30)}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5"
                      >
                        <VolumeX className="w-3.5 h-3.5" /> Mute 30m
                      </button>
                      <button
                        onClick={() => handleBan(rep.reported_user_id)}
                        className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" /> Ban User
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'Dismissed by moderator', 'dismissed')}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'Actioned')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'audit' && (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-crowd-400">@{log.actor_username}</span>
                    <span className="text-slate-300 ml-2">{log.action}</span>
                    <span className="text-slate-400 ml-2 font-mono">[{log.target_type}: {log.target_id}]</span>
                    {log.details && <span className="text-slate-400 italic ml-2">- {log.details}</span>}
                  </div>
                  <span className="text-slate-400 shrink-0 ml-4 font-mono">{log.created_at}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
