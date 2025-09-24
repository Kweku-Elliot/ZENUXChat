import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { VoiceRecordingModal } from './VoiceRecordingModal';
import { useApp } from '@/contexts/AppContext';
import { useAI } from '@/hooks/useAI';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { ChatMessage } from '@/types';
import { Wand2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ChatView() {
  const { currentChatId, user, isOnline } = useApp();
  const { sendMessage, processFile, transcribeAudio } = useAI();
  const { getMessages, saveMessage, saveChat } = useOfflineStorage();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load messages for current chat
  useEffect(() => {
    if (currentChatId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!currentChatId) return;
    
    setIsLoading(true);
    try {
      const chatMessages = await getMessages(currentChatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string, type: 'text') => {
    if (!currentChatId || !user) return;

    // Check usage limits
    if (user.plan.messagesUsed >= user.plan.messagesLimit) {
      toast({
        title: "Message limit reached",
        description: `You've used all ${user.plan.messagesLimit} messages for this month. Upgrade your plan to continue.`,
        variant: "destructive",
      });
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: currentChatId,
      role: 'user',
      content,
      messageType: type,
      encrypted: false,
      aiValidated: false,
      createdAt: new Date().toISOString(),
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, userMessage]);

    // Save to offline storage
    await saveMessage(userMessage);

    // Send to AI if online
    if (isOnline) {
      try {
        const response = await sendMessage.mutateAsync({
          message: content,
          chatId: currentChatId,
        });

        // Create AI response message
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          chatId: currentChatId,
          role: 'assistant',
          content: response.content,
          messageType: 'text',
          encrypted: false,
          aiValidated: true,
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(aiMessage);

        // Update chat timestamp
        await saveChat({
          id: currentChatId,
          title: messages.length === 0 ? content.slice(0, 50) + '...' : `Chat ${currentChatId.slice(0, 8)}`,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });

      } catch (error) {
        toast({
          title: "Failed to send message",
          description: "Your message was saved offline and will be sent when connection is restored.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Offline Mode",
        description: "Your message was saved and will be sent when you're back online.",
      });
    }
  };

  const handleSendFile = async (file: File) => {
    if (!currentChatId || !user) return;

    // Check file upload limits
    if (user.plan.filesUploaded >= user.plan.filesLimit) {
      toast({
        title: "File upload limit reached",
        description: `You've used all ${user.plan.filesLimit} file uploads for this month.`,
        variant: "destructive",
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "File uploads require an internet connection.",
        variant: "destructive",
      });
      return;
    }

    // Create file message
    const fileMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: currentChatId,
      role: 'user',
      content: `Uploaded file: ${file.name}`,
      messageType: 'file',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      encrypted: false,
      aiValidated: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, fileMessage]);
    await saveMessage(fileMessage);

    try {
      const response = await processFile.mutateAsync({ file });
      
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        chatId: currentChatId,
        role: 'assistant',
        content: response.analysis || 'File processed successfully.',
        messageType: 'text',
        encrypted: false,
        aiValidated: true,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(aiMessage);

    } catch (error) {
      toast({
        title: "File processing failed",
        description: "There was an error processing your file.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob, duration: number) => {
    if (!currentChatId || !user) return;

    // Check voice limits
    if (user.plan.voiceMinutesUsed >= user.plan.voiceMinutesLimit) {
      toast({
        title: "Voice limit reached",
        description: `You've used all ${user.plan.voiceMinutesLimit} voice minutes for this month.`,
        variant: "destructive",
      });
      return;
    }

    // Create voice message
    const voiceMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: currentChatId,
      role: 'user',
      content: 'Voice message',
      messageType: 'voice',
      metadata: { voiceDuration: Math.ceil(duration / 60) },
      encrypted: false,
      aiValidated: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, voiceMessage]);
    await saveMessage(voiceMessage);

    if (isOnline) {
      try {
        const response = await transcribeAudio.mutateAsync({ audioBlob });
        
        if (response.text) {
          // Send transcribed text to AI
          handleSendMessage(response.text, 'text');
        }
      } catch (error) {
        toast({
          title: "Voice transcription failed",
          description: "Could not process your voice message.",
          variant: "destructive",
        });
      }
    }
  };

  if (!currentChatId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center animate-float">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Welcome to Zenux AI</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Your intelligent assistant for everything
            </p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start a new conversation or select an existing chat from the sidebar to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 p-4"
        data-testid="messages-area"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center mb-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center animate-float">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Start the conversation</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Ask me anything or upload a file to get started
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onStartVoiceRecording={() => setIsVoiceModalOpen(true)}
        disabled={sendMessage.isPending || processFile.isPending}
      />

      {/* Voice Recording Modal */}
      <VoiceRecordingModal
        open={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendRecording={handleVoiceRecording}
      />
    </div>
  );
}
