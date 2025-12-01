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

  // Game routes
  app.post("/api/games/complete", validateGameSession, gameController.completeGame);

  app.get("/api/games/history/:walletAddress", validateWalletAddress, gameController.getGameHistory);

  return httpServer;
}

