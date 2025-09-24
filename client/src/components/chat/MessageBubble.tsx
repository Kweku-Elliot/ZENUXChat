import { ChatMessage } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, Play, FileText, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'voice':
        return (
          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              className="w-10 h-10 rounded-full bg-primary hover:opacity-80"
              data-testid="button-play-voice"
            >
              <Play className="w-4 h-4 fill-current" />
            </Button>
            <div className="flex-1">
              <div className="flex space-x-1 items-center h-8">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full voice-wave"
                    style={{
                      height: `${20 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {message.metadata?.voiceDuration || '0:00'}
            </span>
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">
                {message.metadata?.fileName || 'Uploaded file'}
              </p>
              <p className="text-xs opacity-80">
                {message.metadata?.fileSize 
                  ? `${(message.metadata.fileSize / 1024).toFixed(1)} KB • ${message.metadata.fileType}`
                  : 'File attachment'
                }
              </p>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="mb-2">
            <img
              src={message.content}
              alt="Generated image"
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          </div>
        );

      default:
        return <p>{message.content}</p>;
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4" data-testid={`message-${message.id}`}>
        <div className="message-bubble bg-primary text-primary-foreground p-4 rounded-2xl rounded-br-lg">
          {renderMessageContent()}
          {message.messageType === 'file' && message.content && (
            <p className="mt-2">{message.content}</p>
          )}
          <div className="flex items-center justify-end mt-2 text-xs opacity-80 space-x-2">
            <span data-testid="message-time">{formatTime(message.createdAt)}</span>
            <CheckCheck className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-4" data-testid={`message-${message.id}`}>
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/ai-avatar.png" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            AI
          </AvatarFallback>
        </Avatar>
        
        <div className="message-bubble bg-card border border-border p-4 rounded-2xl rounded-bl-lg">
          {renderMessageContent()}
          
          {message.messageType === 'text' && message.content.includes('1.') && (
            <div className="mt-3 space-y-2 text-sm">
              {message.content.split('\n').filter(line => line.match(/^\d+\./)).map((item, index) => (
                <div key={index} className="p-2 bg-muted rounded-lg">
                  <div className="font-medium">{item.split(':')[0]}</div>
                  {item.includes(':') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.split(':').slice(1).join(':').trim()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              {message.aiValidated && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1 text-green-500" />
                  AI Validated
                </Badge>
              )}
              {message.encrypted && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1 text-blue-500" />
                  Encrypted
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground" data-testid="message-time">
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
