import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('crowdchat_theme') || 'dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile'); // 'profile' | 'account' | 'appearance' | 'audio'
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isStartDMOpen, setIsStartDMOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState(null);
  const [inspectUser, setInspectUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-black');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('crowdchat_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <UIContext.Provider
      value={{
        theme,
        changeTheme,
        isSettingsOpen,
        setIsSettingsOpen,
        settingsTab,
        setSettingsTab,
        isSearchOpen,
        setIsSearchOpen,
        isAdminOpen,
        setIsAdminOpen,
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        isCreateChannelOpen,
        setIsCreateChannelOpen,
        isStartDMOpen,
        setIsStartDMOpen,
        reportModalData,
        setReportModalData,
        inspectUser,
        setInspectUser,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
