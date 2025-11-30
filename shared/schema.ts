import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emotionLogs = pgTable("emotion_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  emotion: text("emotion").notNull(),
  intensity: integer("intensity").notNull(),
  notes: text("notes").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  txHash: text("tx_hash"),
  earned: integer("earned").notNull().default(10),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  gameId: text("game_id").notNull(),
  score: integer("score").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  txHash: text("tx_hash"),
});

export const insertEmotionLogSchema = createInsertSchema(emotionLogs).omit({
  id: true,
  timestamp: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  timestamp: true,
});

export type InsertEmotionLog = z.infer<typeof insertEmotionLogSchema>;
export type EmotionLog = typeof emotionLogs.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;
