import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import api from '../../api/client';
import { ShieldAlert, X } from 'lucide-react';

const REASONS = [
  { id: 'harassment', label: 'Harassment or Bullying' },
  { id: 'nsfw_content', label: 'Inappropriate or NSFW Content' },
  { id: 'personal_info_leak', label: 'Sharing Private Personal Information' },
  { id: 'spam_flooding', label: 'Spam or Automated Flooding' },
  { id: 'dangerous_content', label: 'Dangerous or Harmful Activity' },
  { id: 'other', label: 'Other Violation' },
];

export default function ReportModal() {
  const { reportModalData, setReportModalData } = useUI();
  const [selectedReason, setSelectedReason] = useState(REASONS[0].id);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!reportModalData) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/users/report', {
        reportedUserId: reportModalData.reportedUserId,
        messageId: reportModalData.messageId || null,
        reason: selectedReason,
        details
      });
      alert('Thank you for helping keep CrowdChat safe. Your report has been submitted to the moderation team.');
      setReportModalData(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Report Content</h3>
          </div>
          <button onClick={() => setReportModalData(null)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-300">
            Reporting user: <strong className="text-white">@{reportModalData.username}</strong>
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Select Reason</label>
            {REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedReason === r.id
                    ? 'bg-rose-500/10 border-rose-500/50 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  checked={selectedReason === r.id}
                  onChange={() => setSelectedReason(r.id)}
                  className="accent-rose-500"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Additional Context (Optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional details for the moderators..."
              rows={2}
              className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
          <button
            onClick={() => setReportModalData(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-lg shadow-rose-600/30"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
