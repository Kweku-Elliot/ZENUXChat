import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: text("avatar"),
  plan: text("plan").default("free").notNull(), // free, plus, pro, business
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  messagesUsed: integer("messages_used").default(0),
  filesUploaded: integer("files_uploaded").default(0),
  voiceMinutesUsed: integer("voice_minutes_used").default(0),
  apiCallsUsed: integer("api_calls_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").references(() => chats.id).notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, voice, file, image
  metadata: jsonb("metadata"), // file info, voice duration, etc.
  encrypted: boolean("encrypted").default(false),
  aiValidated: boolean("ai_validated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupWallets = pgTable("group_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
  currency: text("currency").default("GHS"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  encrypted: boolean("encrypted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletMembers = pgTable("wallet_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => groupWallets.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: text("role").default("member"), // admin, member
  contribution: decimal("contribution", { precision: 12, scale: 2 }).default("0.00"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id),
  walletId: varchar("wallet_id").references(() => groupWallets.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("GHS"),
  type: text("type").notNull(), // p2p, wallet_contribution, gift_credit
  status: text("status").default("pending"), // pending, confirmed, failed, queued
  paymentMethod: text("payment_method"), // mtn_momo, vodafone_cash, airtel_tigo, card
  aiValidated: boolean("ai_validated").default(false),
  offlineQueued: boolean("offline_queued").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const giftCredits = pgTable("gift_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id).notNull(),
  toUserId: varchar("to_user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  message: text("message"),
  status: text("status").default("pending"), // pending, claimed, expired
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertGroupWalletSchema = createInsertSchema(groupWallets).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export const insertGiftCreditSchema = createInsertSchema(giftCredits).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type GroupWallet = typeof groupWallets.$inferSelect;
export type InsertGroupWallet = z.infer<typeof insertGroupWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type GiftCredit = typeof giftCredits.$inferSelect;
export type InsertGiftCredit = z.infer<typeof insertGiftCreditSchema>;
