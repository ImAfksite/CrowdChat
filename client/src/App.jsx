import React from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';
import MessageList from './components/chat/MessageList';
import MessageInput from './components/chat/MessageInput';
import RightSidebar from './components/layout/RightSidebar';
import AuthModal from './components/auth/AuthModal';
import UserProfileModal from './components/profile/UserProfileModal';
import AdminPanelModal from './components/admin/AdminPanelModal';
import ReportModal from './components/modals/ReportModal';
import CreateGroupModal from './components/groups/CreateGroupModal';
import StartDMModal from './components/dms/StartDMModal';
import MessageSearchModal from './components/search/MessageSearchModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0e1015] flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-crowd-500" />
        <span className="font-semibold text-sm">Initializing CrowdChat Platform...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#0e1015] overflow-hidden">
      {/* Navigation Left Sidebar */}
      <Sidebar />

      {/* Main Chat Workstation */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar />
        <MessageList />
        <MessageInput />
      </div>

      {/* Contextual Right Sidebar */}
      <RightSidebar />

      {/* Interactive Global Modals */}
      <UserProfileModal />
      <AdminPanelModal />
      <ReportModal />
      <CreateGroupModal />
      <StartDMModal />
      <MessageSearchModal />
    </div>
  );
}
