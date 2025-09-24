import { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, UserPlan, ChatSession, WalletBalance } from '@/types';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  plan: UserPlan;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  chatSessions: ChatSession[];
  setChatSessions: (sessions: ChatSession[]) => void;
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  wallets: WalletBalance[];
  setWallets: (wallets: WalletBalance[]) => void;
  isOnline: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getSettings, saveSettings } = useOfflineStorage();

  const [settings, setSettingsState] = useState<AppSettings>({
    theme: 'light',
    language: 'en',
    currency: 'GHS',
    notifications: {
      enabled: true,
      sounds: true,
      messages: true,
      transactions: true,
    },
    privacy: {
      dataCollection: false,
      encryptionEnabled: true,
      postQuantumEnabled: true,
    },
  });

  const setSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getSettings();
      if (savedSettings) {
        setSettingsState(savedSettings);
      }
    };
    loadSettings();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [currentChatId]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        settings,
        setSettings,
        chatSessions,
        setChatSessions,
        currentChatId,
        setCurrentChatId,
        wallets,
        setWallets,
        isOnline,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
