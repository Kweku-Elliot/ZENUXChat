import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Square, X } from 'lucide-react';

interface VoiceRecordingModalProps {
  open: boolean;
  onClose: () => void;
  onSendRecording: (blob: Blob, duration: number) => void;
}

export function VoiceRecordingModal({ open, onClose, onSendRecording }: VoiceRecordingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (open) {
      startRecording();
    } else {
      stopRecording();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [open]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      onClose();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRecording(false);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendRecording(audioBlob, duration);
    }
    onClose();
  };

  const handleCancel = () => {
    stopRecording();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-8 text-center" data-testid="voice-recording-modal">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto gradient-primary rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isRecording ? 'Recording...' : 'Recording Complete'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRecording ? 'Speak clearly into your microphone' : 'Review your recording'}
          </p>
        </div>

        {/* Voice Waveform Animation */}
        {isRecording && (
          <div className="flex justify-center items-center space-x-1 mb-6">
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
        )}

        {/* Duration Display */}
        <div className="text-2xl font-mono mb-6" data-testid="recording-duration">
          {formatDuration(duration)}
        </div>

        {/* Controls */}
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            data-testid="button-cancel-recording"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          {isRecording ? (
            <Button
              className="flex-1 gradient-primary"
              onClick={stopRecording}
              data-testid="button-stop-recording"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button
              className="flex-1 gradient-primary"
              onClick={handleSend}
              disabled={!audioBlob}
              data-testid="button-send-recording"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
