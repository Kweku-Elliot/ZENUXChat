import { useState, useCallback } from 'react';
import { offlineDb } from '@/lib/offlineDb';
import { 
  ChatMessage, 
  ChatSession, 
  TransactionRecord, 
  OfflineQueueItem, 
  AppSettings, 
  WalletBalance 
} from '@/types';

export function useOfflineStorage() {
  const [isLoading, setIsLoading] = useState(false);

  // Messages
  const saveMessage = useCallback(async (message: ChatMessage) => {
    setIsLoading(true);
    try {
      await offlineDb.put('messages', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (chatId: string): Promise<ChatMessage[]> => {
    setIsLoading(true);
    try {
      const messages = await offlineDb.getAll('messages', 'chatId', chatId);
      return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chat sessions
  const saveChat = useCallback(async (chat: ChatSession) => {
    await offlineDb.put('chats', chat);
  }, []);

  const getChats = useCallback(async (): Promise<ChatSession[]> => {
    const chats = await offlineDb.getAll('chats');
    return chats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    await offlineDb.delete('chats', chatId);
    // Also delete all messages in this chat
    const messages = await offlineDb.getAll('messages', 'chatId', chatId);
    for (const message of messages) {
      await offlineDb.delete('messages', message.id);
    }
  }, []);

  // Transactions
  const saveTransaction = useCallback(async (transaction: TransactionRecord) => {
    await offlineDb.put('transactions', transaction);
  }, []);

  const getTransactions = useCallback(async (): Promise<TransactionRecord[]> => {
    const transactions = await offlineDb.getAll('transactions');
    return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const getQueuedTransactions = useCallback(async (): Promise<TransactionRecord[]> => {
    return await offlineDb.getAll('transactions', 'offlineQueued', true);
  }, []);

  // Offline queue
  const addToQueue = useCallback(async (item: OfflineQueueItem) => {
    await offlineDb.put('offlineQueue', item);
  }, []);

  const getQueue = useCallback(async (): Promise<OfflineQueueItem[]> => {
    return await offlineDb.getAll('offlineQueue', 'timestamp');
  }, []);

  const removeFromQueue = useCallback(async (itemId: string) => {
    await offlineDb.delete('offlineQueue', itemId);
  }, []);

  // Settings
  const saveSettings = useCallback(async (settings: AppSettings) => {
    await offlineDb.put('settings', { key: 'app_settings', ...settings });
  }, []);

  const getSettings = useCallback(async (): Promise<AppSettings | null> => {
    const result = await offlineDb.get('settings', 'app_settings');
    if (result) {
      const { key, ...settings } = result;
      return settings as AppSettings;
    }
    return null;
  }, []);

  // Wallets
  const saveWallet = useCallback(async (wallet: WalletBalance) => {
    await offlineDb.put('wallets', wallet);
  }, []);

  const getWallets = useCallback(async (): Promise<WalletBalance[]> => {
    return await offlineDb.getAll('wallets');
  }, []);

  // Clear all data
  const clearAllData = useCallback(async () => {
    await offlineDb.clear('messages');
    await offlineDb.clear('chats');
    await offlineDb.clear('transactions');
    await offlineDb.clear('offlineQueue');
    await offlineDb.clear('wallets');
  }, []);

  return {
    isLoading,
    // Messages
    saveMessage,
    getMessages,
    // Chats
    saveChat,
    getChats,
    deleteChat,
    // Transactions
    saveTransaction,
    getTransactions,
    getQueuedTransactions,
    // Queue
    addToQueue,
    getQueue,
    removeFromQueue,
    // Settings
    saveSettings,
    getSettings,
    // Wallets
    saveWallet,
    getWallets,
    // Utilities
    clearAllData,
  };
}
