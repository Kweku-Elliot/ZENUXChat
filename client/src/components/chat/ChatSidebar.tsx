import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { useApp } from '@/contexts/AppContext';
import { Plus, MessageCircle, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  onNewChat: () => void;
  onChatSelect: (chatId: string) => void;
  onBillingClick: () => void;
}

export function ChatSidebar({ onNewChat, onChatSelect, onBillingClick }: ChatSidebarProps) {
  const { chatSessions, currentChatId, user, sidebarOpen, setSidebarOpen } = useApp();

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
  };

  const usagePercentage = user ? (user.plan.messagesUsed / user.plan.messagesLimit) * 100 : 0;

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 max-w-xs bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">Zenux AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="button-close-sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button 
              className="w-full gradient-primary text-primary-foreground hover:opacity-90"
              onClick={onNewChat}
              data-testid="button-new-chat"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground uppercase font-semibold mb-3">
                Recent Chats
              </div>
              
              {chatSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No chats yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a conversation!</p>
                </div>
              ) : (
                chatSessions.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "p-3 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-colors",
                      currentChatId === chat.id && "border-l-2 border-sidebar-primary bg-sidebar-accent"
                    )}
                    onClick={() => handleChatClick(chat.id)}
                    data-testid={`chat-item-${chat.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate text-sidebar-foreground">
                        {chat.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(chat.lastMessageAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Plan Indicator */}
          <div className="p-4 border-t border-sidebar-border">
            <Glassmorphism>
              <Button
                variant="ghost"
                className="w-full p-3 h-auto justify-start hover:bg-sidebar-accent"
                onClick={onBillingClick}
                data-testid="button-billing"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="text-sm font-medium text-sidebar-foreground">
                      Plan: {user?.plan.type.charAt(0).toUpperCase() + user?.plan.type.slice(1) || 'Free'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user?.plan.messagesUsed || 0}/{user?.plan.messagesLimit || 50} messages used
                    </div>
                  </div>
                  <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                    <Progress value={usagePercentage} className="h-1" />
                  </div>
                </div>
              </Button>
            </Glassmorphism>
          </div>
        </div>
      </div>
    </>
  );
}
