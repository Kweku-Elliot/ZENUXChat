import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatView } from '@/components/chat/ChatView';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { Menu, Sun, Moon, Settings, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HomeProps {
  onNavigate: (page: 'billing' | 'settings' | 'group-wallet' | 'qr-code' | 'image-generation') => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { 
    currentChatId, 
    setCurrentChatId, 
    chatSessions, 
    setChatSessions, 
    isOnline, 
    sidebarOpen, 
    setSidebarOpen 
  } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { saveChat } = useOfflineStorage();
  const { toast } = useToast();

  const handleNewChat = async () => {
    const newChatId = crypto.randomUUID();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Add to local state
    setChatSessions(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    
    // Save offline
    await saveChat(newChat);

    toast({
      title: "New chat started",
      description: "You can now start a conversation!",
    });
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen max-w-6xl mx-auto border-x border-border relative bg-background">
      {/* Chat Sidebar */}
      <ChatSidebar
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onBillingClick={() => onNavigate('billing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isOnline ? 'Online • Synced' : 'Offline • Queued'}
              </span>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('settings')}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Chat View */}
        <ChatView />
      </div>
    </div>
  );
}
