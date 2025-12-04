import type { Express } from "express";
import { createServer, type Server } from "http";
import { emotionController, gameController } from "./controllers/index.js";
import { validateEmotionLog, validateGameSession, validateWalletAddress } from "./middlewares/index.js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Emotion routes
  app.post("/api/emotions/log", validateEmotionLog, emotionController.logEmotion);

  app.get("/api/emotions/history/:walletAddress", validateWalletAddress, emotionController.getEmotionHistory);

  // Analytics routes
  app.get("/api/emotions/analytics/:walletAddress", validateWalletAddress, emotionController.getEmotionAnalytics);

  app.get("/api/emotions/insights/:walletAddress", validateWalletAddress, emotionController.getEmotionInsights);

  app.get("/api/emotions/trends/:walletAddress", validateWalletAddress, emotionController.getEmotionTrends);

  // Game routes
  app.post("/api/games/complete", validateGameSession, gameController.completeGame);

  app.get("/api/games/history/:walletAddress", validateWalletAddress, gameController.getGameHistory);

  return httpServer;
}

