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