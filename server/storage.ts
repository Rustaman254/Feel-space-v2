import { db } from "@db";
import { type EmotionLog, type InsertEmotionLog, type GameSession, type InsertGameSession, emotionLogs, gameSessions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  logEmotion(log: InsertEmotionLog): Promise<EmotionLog>;
  getEmotionHistory(walletAddress: string): Promise<EmotionLog[]>;
  recordGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameHistory(walletAddress: string): Promise<GameSession[]>;
}

export class DatabaseStorage implements IStorage {
  async logEmotion(log: InsertEmotionLog): Promise<EmotionLog> {
    const [result] = await db.insert(emotionLogs).values(log).returning();
    return result;
  }

  async getEmotionHistory(walletAddress: string): Promise<EmotionLog[]> {
    return await db
      .select()
      .from(emotionLogs)
      .where(eq(emotionLogs.walletAddress, walletAddress))
      .orderBy(desc(emotionLogs.timestamp));
  }

  async recordGameSession(session: InsertGameSession): Promise<GameSession> {
    const [result] = await db.insert(gameSessions).values(session).returning();
    return result;
  }

  async getGameHistory(walletAddress: string): Promise<GameSession[]> {
    return await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.walletAddress, walletAddress))
      .orderBy(desc(gameSessions.timestamp));
  }
}

export const storage = new DatabaseStorage();
