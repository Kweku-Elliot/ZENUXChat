import { 
  type User, 
  type InsertUser, 
  type Chat, 
  type InsertChat,
  type Message,
  type InsertMessage,
  type Transaction,
  type InsertTransaction,
  type GroupWallet,
  type InsertGroupWallet,
  type GiftCredit,
  type InsertGiftCredit
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Chat methods
  getChat(id: string): Promise<Chat | undefined>;
  getChatsByUserId(userId: string): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChat(id: string, updates: Partial<Chat>): Promise<Chat>;
  deleteChat(id: string): Promise<void>;
  
  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByChatId(chatId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, updates: Partial<Message>): Promise<Message>;
  deleteMessage(id: string): Promise<void>;
  
  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getTransactionsByWalletId(walletId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  
  // Group wallet methods
  getGroupWallet(id: string): Promise<GroupWallet | undefined>;
  getGroupWalletsByUserId(userId: string): Promise<GroupWallet[]>;
  createGroupWallet(wallet: InsertGroupWallet): Promise<GroupWallet>;
  updateGroupWallet(id: string, updates: Partial<GroupWallet>): Promise<GroupWallet>;
  
  // Gift credit methods
  getGiftCredit(id: string): Promise<GiftCredit | undefined>;
  getGiftCreditsByUserId(userId: string): Promise<GiftCredit[]>;
  createGiftCredit(giftCredit: InsertGiftCredit): Promise<GiftCredit>;
  updateGiftCredit(id: string, updates: Partial<GiftCredit>): Promise<GiftCredit>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private chats: Map<string, Chat> = new Map();
  private messages: Map<string, Message> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private groupWallets: Map<string, GroupWallet> = new Map();
  private giftCredits: Map<string, GiftCredit> = new Map();

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create a default user for testing
    const defaultUser: User = {
      id: randomUUID(),
      username: "testuser",
      email: "test@zenux.ai",
      password: "hashed_password",
      displayName: "Test User",
      bio: "AI enthusiast and early adopter",
      avatar: null,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      messagesUsed: 28,
      filesUploaded: 1,
      voiceMinutesUsed: 0,
      apiCallsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(defaultUser.id, defaultUser);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      messagesUsed: 0,
      filesUploaded: 0,
      voiceMinutesUsed: 0,
      apiCallsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Chat methods
  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    return Array.from(this.chats.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = randomUUID();
    const chat: Chat = {
      ...insertChat,
      id,
      lastMessageAt: new Date(),
      createdAt: new Date(),
    };
    
    this.chats.set(id, chat);
    return chat;
  }

  async updateChat(id: string, updates: Partial<Chat>): Promise<Chat> {
    const chat = this.chats.get(id);
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    const updatedChat = { ...chat, ...updates };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }

  async deleteChat(id: string): Promise<void> {
    this.chats.delete(id);
    
    // Also delete all messages in this chat
    const messages = Array.from(this.messages.values()).filter(msg => msg.chatId === id);
    for (const message of messages) {
      this.messages.delete(message.id);
    }
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      encrypted: insertMessage.encrypted || false,
      aiValidated: insertMessage.aiValidated || false,
      createdAt: new Date(),
    };
    
    this.messages.set(id, message);
    
    // Update chat's last message time
    const chat = this.chats.get(message.chatId);
    if (chat) {
      await this.updateChat(chat.id, { lastMessageAt: new Date() });
    }
    
    return message;
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    const message = this.messages.get(id);
    if (!message) {
      throw new Error("Message not found");
    }
    
    const updatedMessage = { ...message, ...updates };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<void> {
    this.messages.delete(id);
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.fromUserId === userId || tx.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getTransactionsByWalletId(walletId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.walletId === walletId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: insertTransaction.status || "pending",
      aiValidated: insertTransaction.aiValidated || false,
      offlineQueued: insertTransaction.offlineQueued || false,
      createdAt: new Date(),
      confirmedAt: insertTransaction.status === "confirmed" ? new Date() : null,
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    
    const updatedTransaction = { 
      ...transaction, 
      ...updates,
      confirmedAt: updates.status === "confirmed" ? new Date() : transaction.confirmedAt
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Group wallet methods
  async getGroupWallet(id: string): Promise<GroupWallet | undefined> {
    return this.groupWallets.get(id);
  }

  async getGroupWalletsByUserId(userId: string): Promise<GroupWallet[]> {
    return Array.from(this.groupWallets.values())
      .filter(wallet => wallet.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createGroupWallet(insertWallet: InsertGroupWallet): Promise<GroupWallet> {
    const id = randomUUID();
    const wallet: GroupWallet = {
      ...insertWallet,
      id,
      balance: insertWallet.balance || "0.00",
      currency: insertWallet.currency || "GHS",
      encrypted: insertWallet.encrypted !== false,
      createdAt: new Date(),
    };
    
    this.groupWallets.set(id, wallet);
    return wallet;
  }

  async updateGroupWallet(id: string, updates: Partial<GroupWallet>): Promise<GroupWallet> {
    const wallet = this.groupWallets.get(id);
    if (!wallet) {
      throw new Error("Group wallet not found");
    }
    
    const updatedWallet = { ...wallet, ...updates };
    this.groupWallets.set(id, updatedWallet);
    return updatedWallet;
  }

  // Gift credit methods
  async getGiftCredit(id: string): Promise<GiftCredit | undefined> {
    return this.giftCredits.get(id);
  }

  async getGiftCreditsByUserId(userId: string): Promise<GiftCredit[]> {
    return Array.from(this.giftCredits.values())
      .filter(credit => credit.fromUserId === userId || credit.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createGiftCredit(insertGiftCredit: InsertGiftCredit): Promise<GiftCredit> {
    const id = randomUUID();
    const giftCredit: GiftCredit = {
      ...insertGiftCredit,
      id,
      status: insertGiftCredit.status || "pending",
      aiGenerated: insertGiftCredit.aiGenerated || false,
      createdAt: new Date(),
      expiresAt: insertGiftCredit.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
    
    this.giftCredits.set(id, giftCredit);
    return giftCredit;
  }

  async updateGiftCredit(id: string, updates: Partial<GiftCredit>): Promise<GiftCredit> {
    const giftCredit = this.giftCredits.get(id);
    if (!giftCredit) {
      throw new Error("Gift credit not found");
    }
    
    const updatedGiftCredit = { ...giftCredit, ...updates };
    this.giftCredits.set(id, updatedGiftCredit);
    return updatedGiftCredit;
  }
}

export const storage = new MemStorage();
