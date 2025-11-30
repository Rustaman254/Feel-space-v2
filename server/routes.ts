import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmotionLogSchema, insertGameSessionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/emotions/log", async (req, res) => {
    try {
      const validatedData = insertEmotionLogSchema.parse(req.body);
      const result = await storage.logEmotion(validatedData);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/emotions/history/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const history = await storage.getEmotionHistory(walletAddress);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/games/complete", async (req, res) => {
    try {
      const validatedData = insertGameSessionSchema.parse(req.body);
      const result = await storage.recordGameSession(validatedData);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/games/history/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const history = await storage.getGameHistory(walletAddress);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
