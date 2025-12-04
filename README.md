# Feel Space

**Feel Space** is an innovative emotion journaling platform and arcade built on the **Celo** blockchain. It combines mental wellness tracking with gamification to provide a secure, user-friendly way for individuals to track their emotional health and earn rewards.

## 🌟 Features

- **Emotion Journaling**: Log your daily emotions (Happy, Excited, Grateful, Calm, Tired, Anxious, Sad, Angry) with intensity ratings and notes.
- **Emotional Insights & Analytics**: Track patterns, identify triggers, and receive personalized recommendations based on your emotional data.
  - Pattern detection for time-of-day and day-of-week correlations
  - Trend visualization with interactive charts
  - Personalized insights and actionable recommendations
  - Data export functionality (JSON)
- **On-Chain History**: Your emotion logs and game sessions are stored on the Celo blockchain, ensuring data permanence and user ownership.
- **Arcade Games**: Play mini-games designed to regulate emotions:
  - **Bubble Pop**: Stress relief through satisfying physics.
  - **Mind Match**: Focus enhancement via memory training.
  - **Box Breathing**: Calm regulation with guided breathing exercises.
  - **Tic-Tac-Toe**: Strategy session against the platform.
- **Token Rewards**: Earn **FEELS** tokens for every game you complete.
- **Wallet Integration**: Seamless connection with Celo-compatible wallets (Metamask, MiniPay, etc.).

## 🛠 Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Blockchain**: Celo (Sepolia Testnet)
- **Smart Contracts**: Solidity, Hardhat
- **Backend/DB**: Node.js, Express, MongoDB (for additional user data)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- A Celo-compatible wallet (e.g., Metamask) configured for **Celo Sepolia Testnet**.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/feel-space.git
    cd feel-space
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and add the following:
    ```env
    # Required for backend/database
    MONGODB_URI=your_mongodb_connection_string
    NODE_ENV=development
    PORT=5500

    # Required for smart contract deployment (optional for frontend only)
    PRIVATE_KEY=your_wallet_private_key
    ```

### Running the Application

1.  **Start the Frontend Client:**
    This runs the React application on `http://localhost:5000`.
    ```bash
    pnpm run dev:client
    ```

2.  **Start the Backend Server (Optional):**
    If you are working on features that require the backend API.
    ```bash
    pnpm run dev
    ```

## 🔗 Smart Contracts

The application interacts with the **EmotionTracker** smart contract deployed on Celo Sepolia.

- **Contract Address**: `0xCf2C7347e437781d560ED9C503658100fED69E03`
- **Network**: Celo Sepolia Testnet
- **Explorer**: [Celo Sepolia Blockscout](https://sepolia.celoscan.io/)

### Deployment (Devs Only)

To deploy updates to the smart contract:

```bash
npx hardhat run script/deploy.ts --network celo-sepolia
```

*Note: Ensure you have funded your deployer wallet with Celo Sepolia ETH.*

## 🎮 How to Play

1.  **Connect Wallet**: Click the "Connect Wallet" button in the top right.
2.  **Log Emotion**: Go to the Home page and select how you feel to log it on-chain.
3.  **Play Games**: Navigate to the **Arcade** tab.
    - Select a game (e.g., Tic-Tac-Toe).
    - Complete the game to earn **FEELS** tokens.
4.  **View History**: Check the **History** tab for your emotion logs and **Sessions** tab for your game history and rewards.

## 📄 License

MIT

## 📂 Project Structure

```
feel-space/
├── client/                 # Frontend Application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # React components (Games, Layout, UI)
│       ├── contracts/      # ABI and address configs
│       ├── hooks/          # Custom hooks (useWeb3)
│       ├── lib/            # Utilities and Web3 service
│       └── pages/          # Application pages (Home, Games, History)
├── contracts/              # Smart Contracts
│   └── EmotionTracker.sol  # Main Celo contract
├── script/                 # Build scripts
│   └── build.ts            # Full stack build script
├── server/                 # Backend API (Express)
├── .env                    # Environment variables
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Vite configuration
```

## ☁️ Deployment on Vercel

This project is optimized for deployment on **Vercel**.

1.  **Push to GitHub**: Ensure your project is pushed to a GitHub repository.
2.  **Import Project**:
    - Go to your Vercel Dashboard.
    - Click **"Add New..."** -> **"Project"**.
    - Import your `feel-space` repository.
3.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **Vite**.
    - **Root Directory**: Leave as `./` (Root).
    - **Build Command**: `pnpm run build` (or `npm run build`).
    - **Output Directory**: `dist/public`
      - *Note: Our build script outputs the frontend to `dist/public`, so you must override the default `dist` setting.*
    - **Environment Variables**: Add the necessary variables from your `.env` file (e.g., `VITE_...` variables if you have any, though currently most are backend-focused).
4.  **Deploy**: Click **Deploy**.

Your application will be live in a few minutes! 🚀

## 🚀 Deployment on Render

Feel-Space can be deployed on **Render** with separate services for the frontend and backend.

### Backend Deployment (Node.js API + MongoDB)

1.  **Create a Web Service**:
    - Go to your [Render Dashboard](https://dashboard.render.com/).
    - Click **"New +"** -> **"Web Service"**.
    - Connect your GitHub repository.

2.  **Configure Backend Service**:
    - **Name**: `feel-space-api` (or your preferred name)
    - **Region**: Choose closest to your users
    - **Branch**: `main` (or your deployment branch)
    - **Root Directory**: Leave blank (uses repository root)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm run dev` (or `node server/index.ts` for production)
    - **Instance Type**: Free or Starter (depending on your needs)

3.  **Environment Variables**:
    Add the following environment variables in the Render dashboard:
    ```
    NODE_ENV=production
    PORT=5500
    MONGODB_URI=your_mongodb_atlas_connection_string
    PRIVATE_KEY=your_wallet_private_key_for_deployment
    ```
    - **MongoDB**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a free cloud database
    - Get your connection string from Atlas and add it to `MONGODB_URI`

4.  **Deploy**: Click **"Create Web Service"**
    - Render will automatically deploy your backend
    - Note the service URL (e.g., `https://feel-space-api.onrender.com`)

### Frontend Deployment (Static Site)

1.  **Create a Static Site**:
    - In Render Dashboard, click **"New +"** -> **"Static Site"**.
    - Connect the same GitHub repository.

2.  **Configure Frontend Service**:
    - **Name**: `feel-space` (or your preferred name)
    - **Branch**: `main`
    - **Root Directory**: Leave blank
    - **Build Command**: `npm run build`
    - **Publish Directory**: `dist/public`

3.  **Environment Variables** (if needed):
    ```
    VITE_API_URL=https://feel-space-api.onrender.com
    ```
    - Update your frontend code to use `import.meta.env.VITE_API_URL` instead of `http://localhost:5500`

4.  **Deploy**: Click **"Create Static Site"**

### Post-Deployment Configuration

1.  **Update API URLs in Frontend**:
    - Replace hardcoded `http://localhost:5500` with your Render backend URL
    - Use environment variables for flexibility:
    ```typescript
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';
    ```

2.  **CORS Configuration**:
    - Update your backend to allow requests from your Render frontend URL
    - In `server/index.ts`, configure CORS:
    ```typescript
    app.use(cors({
      origin: ['https://feel-space.onrender.com', 'http://localhost:5000'],
      credentials: true
    }));
    ```

3.  **MongoDB Atlas Setup**:
    - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    - Whitelist Render's IP addresses (or use `0.0.0.0/0` for all IPs)
    - Create a database user and get the connection string

### Important Notes

- **Free Tier Limitations**: Render's free tier spins down after 15 minutes of inactivity. First request may take 30-60 seconds.
- **Upgrade for Production**: Consider upgrading to a paid plan for always-on services and better performance.
- **Auto-Deploy**: Render automatically redeploys when you push to your connected branch.
- **Logs**: View real-time logs in the Render dashboard for debugging.

Your Feel-Space application will be live at your Render URLs! 🎉