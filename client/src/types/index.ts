export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: 'text' | 'voice' | 'file' | 'image';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    voiceDuration?: number;
  };
  encrypted: boolean;
  aiValidated: boolean;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface UserPlan {
  type: 'free' | 'plus' | 'pro' | 'business';
  messagesUsed: number;
  messagesLimit: number;
  filesUploaded: number;
  filesLimit: number;
  voiceMinutesUsed: number;
  voiceMinutesLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  hasApiAccess: boolean;
  hasVoiceChat: boolean;
}

export interface WalletBalance {
  id: string;
  name: string;
  balance: number;
  currency: string;
  members: WalletMember[];
}

export interface WalletMember {
  id: string;
  userId: string;
  username: string;
  role: 'admin' | 'member';
  contribution: number;
  joinedAt: string;
}

export interface TransactionRecord {
  id: string;
  fromUserId?: string;
  toUserId?: string;
  walletId?: string;
  amount: number;
  currency: string;
  type: 'p2p' | 'wallet_contribution' | 'gift_credit';
  status: 'pending' | 'confirmed' | 'failed' | 'queued';
  paymentMethod?: string;
  aiValidated: boolean;
  offlineQueued: boolean;
  createdAt: string;
  confirmedAt?: string;
}

export interface OfflineQueueItem {
  id: string;
  type: 'message' | 'transaction' | 'wallet_update';
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    enabled: boolean;
    sounds: boolean;
    messages: boolean;
    transactions: boolean;
  };
  privacy: {
    dataCollection: boolean;
    encryptionEnabled: boolean;
    postQuantumEnabled: boolean;
  };
}

export interface VoiceRecording {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: string;
}
