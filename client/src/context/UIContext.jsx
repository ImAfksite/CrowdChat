import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isStartDMOpen, setIsStartDMOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState(null); // { reportedUserId, messageId, username }
  const [inspectUser, setInspectUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [themeAccent, setThemeAccent] = useState('#6366f1');

  return (
    <UIContext.Provider
      value={{
        isSearchOpen, setIsSearchOpen,
        isAdminOpen, setIsAdminOpen,
        isProfileOpen, setIsProfileOpen,
        isCreateGroupOpen, setIsCreateGroupOpen,
        isCreateChannelOpen, setIsCreateChannelOpen,
        isStartDMOpen, setIsStartDMOpen,
        reportModalData, setReportModalData,
        inspectUser, setInspectUser,
        isMobileSidebarOpen, setIsMobileSidebarOpen,
        themeAccent, setThemeAccent
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
