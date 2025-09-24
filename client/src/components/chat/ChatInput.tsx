import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Send, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text') => void;
  onSendFile: (file: File) => void;
  onStartVoiceRecording: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  onSendFile, 
  onStartVoiceRecording, 
  disabled = false,
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message, 'text');
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      e.target.value = ''; // Reset input
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    setMessage(textarea.value);
  };

  return (
    <div className="border-t border-border p-4 bg-card">
      <div className="flex items-end space-x-3">
        {/* File Upload */}
        <Button
          variant="ghost"
          size="sm"
          className="p-3 h-12 rounded-full hover:bg-muted"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          data-testid="button-attach-file"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.js,.py,.html,.css,.json"
          className="hidden"
          data-testid="input-file"
        />
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={adjustTextareaHeight}
            onKeyPress={handleKeyPress}
            className={cn(
              "w-full pr-12 bg-muted border-0 rounded-xl resize-none focus:ring-2 focus:ring-primary min-h-[48px] max-h-[120px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
            disabled={disabled}
            data-testid="input-message"
          />
          
          {/* Magic Voice Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-3 p-1 h-6 w-6 rounded-full hover:bg-background transition-colors"
            disabled={disabled}
            data-testid="button-magic-voice"
          >
            <Wand2 className="w-4 h-4 text-primary animate-pulse-glow" />
          </Button>
        </div>
        
        {/* Voice Recording */}
        <Button
          variant="ghost"
          size="sm"
          className="p-3 h-12 rounded-full hover:bg-muted"
          onClick={onStartVoiceRecording}
          disabled={disabled}
          data-testid="button-voice-record"
        >
          <Mic className="w-5 h-5" />
        </Button>
        
        {/* Send Button */}
        <Button
          size="sm"
          className={cn(
            "p-3 h-12 rounded-full gradient-primary hover:opacity-90 transition-opacity",
            !message.trim() && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          data-testid="button-send"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
