# Smart Contract Deployment & Database Integration Guide

## Table of Contents
1. [Smart Contract Deployment](#smart-contract-deployment)
2. [Environment Configuration](#environment-configuration)
3. [Database Integration](#database-integration)
4. [Troubleshooting API Issues](#troubleshooting-api-issues)
5. [Testing the Full Flow](#testing-the-full-flow)

---

## Smart Contract Deployment

### Prerequisites
- Node.js v18+
- Celo Alfajores testnet configured in your wallet
- Testnet CELO tokens for gas fees
- Private key/Mnemonic stored securely

### Step 1: Install Dependencies

```bash
cd /home/masterchiefff/Downloads/Feel-Space
npm install
# or
pnpm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Smart Contract Deployment
PRIVATE_KEY=your_wallet_private_key_here
# OR use mnemonic:
MNEMONIC=twelve word mnemonic seed phrase here

# Network Configuration
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
CELO_ALFAJORES_CHAIN_ID=44787

# Contract Addresses (after deployment)
EMOTION_TRACKER_CONTRACT_ADDRESS=0x...deployed_address_here

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feelspace?retryWrites=true&w=majority
DATABASE_NAME=feelspace

# API Configuration
API_PORT=3000
API_HOST=localhost
NODE_ENV=production
```

### Step 3: Review Hardhat Configuration

Check `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    alfajores: {
      url: process.env.CELO_ALFAJORES_RPC || "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY 
        ? [process.env.PRIVATE_KEY] 
        : [],
      chainId: 44787,
    },
  },
  etherscan: {
    apiKey: {
      alfajores: "your-etherscan-api-key", // Optional for verification
    },
  },
};

export default config;
```

### Step 4: Compile Smart Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiling 1 file with 0.8.19
✓ Compiled successfully
```

### Step 5: Deploy Smart Contract

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying EmotionTracker contract...");
  console.log("Deployer address:", deployer.address);

  const EmotionTracker = await ethers.getContractFactory("EmotionTracker");
  const emotionTracker = await EmotionTracker.deploy();
  
  await emotionTracker.waitForDeployment();
  
  const contractAddress = await emotionTracker.getAddress();
  console.log("✅ EmotionTracker deployed to:", contractAddress);

  // Save address to file
  const fs = require("fs");
  const addressData = {
    emotionTrackerAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    network: "alfajores",
  };
  
  fs.writeFileSync(
    "./client/src/contracts/deployed-addresses.json",
    JSON.stringify(addressData, null, 2)
  );
  
  console.log("✅ Contract address saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Run deployment:

```bash
npx hardhat run scripts/deploy.ts --network alfajores
```

Expected output:
```
Deploying EmotionTracker contract...
Deployer address: 0x1234...
✅ EmotionTracker deployed to: 0xAbCd...
✅ Contract address saved to deployed-addresses.json
```

### Step 6: Save Contract Address

**Important**: After deployment, the contract address is automatically saved to:
```
client/src/contracts/deployed-addresses.json
```

Update this file manually if needed:

```json
{
  "emotionTrackerAddress": "0xYourDeployedContractAddressHere",
  "deployedAt": "2025-12-01T10:00:00.000Z",
  "network": "alfajores"
}
```

---

## Environment Configuration

### 1. Backend Environment Variables (`server/`)

Create `.env` in the server root:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/feelspace
DATABASE_NAME=feelspace

# Smart Contract
EMOTION_TRACKER_ADDRESS=0xYourDeployedContractAddressHere
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
CHAIN_ID=44787

# API
PORT=3000
NODE_ENV=production
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

### 2. Frontend Environment Variables (`client/`)

Create `.env` in client root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
VITE_NETWORK_NAME=alfajores
VITE_CHAIN_ID=44787
VITE_RPC_URL=https://alfajores-forno.celo-testnet.org
```

---

## Database Integration

### 1. MongoDB Setup

#### Option A: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster:
   - Provider: AWS
   - Region: Choose closest to you
   - Tier: M0 Free
4. Create database user
5. Whitelist IP address (or 0.0.0.0 for testing)
6. Copy connection string

#### Option B: Local MongoDB

```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb    # Linux

# Start MongoDB
mongod

# Verify connection
mongo
```

### 2. Test Database Connection

```typescript
// In server/config/database.ts
import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/feelspace';
    
    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB connected successfully');
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}
```

### 3. Verify Collections

```bash
# Connect to MongoDB
mongo

# Use feelspace database
use feelspace

# Check collections
show collections

# Check emotion logs
db.emotionlogs.find().pretty()

# Check game sessions
db.gamesessions.find().pretty()
```

---

## Troubleshooting API Issues

### Issue 1: Game Sessions Not Logging

**Symptoms:**
- POST to `/api/games/complete` returns error
- Game sessions not appearing in database

**Root Cause:**
- Wallet address validation failing (must be exactly 42 characters)
- Missing required fields in request

**Solution:**

```typescript
// In client/src/hooks/use-web3.ts - recordGameSession function

const recordGameSession = useCallback(async (gameId: string, score: number) => {
  const txHash = '0x' + Math.random().toString(16).substring(2, 66);

  const newSession: GameSessionEntry = {
    gameId,
    score,
    timestamp: Date.now(),
    txHash
  };

  try {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    // Validate wallet address format
    if (!address.startsWith('0x') || address.length !== 42) {
      console.error('Invalid wallet address format:', address);
      throw new Error('Invalid wallet address');
    }

    console.log('Recording game session:', {
      walletAddress: address,
      gameId,
      score,
      txHash
    });

    const response = await fetch('/api/games/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: address,
        gameId,
        score,
        txHash
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const dbEntry = await response.json();
    newSession._id = dbEntry.data._id;
    newSession.timestamp = new Date(dbEntry.data.timestamp).getTime();
    newSession.txHash = dbEntry.data.txHash;
    
    console.log('✅ Game session recorded:', newSession);
  } catch (error) {
    console.error('❌ Error recording game session:', error);
    // Still save locally for offline capability
  }

  const newSessions = [newSession, ...gameSessions];
  setGameSessions(newSessions);

  if (address) {
    const updatedBalances = { ...balances };
    localStorage.setItem('feelspace_games', JSON.stringify(ownedGames));
  }
}, [gameSessions, address, balances, ownedGames]);
```

### Issue 2: Emotions Not Logging

**Symptoms:**
- POST to `/api/emotions/log` fails
- History page shows empty
- Database has no emotion logs

**Solution:**

```typescript
// In client/src/hooks/use-web3.ts - logEmotion function

const logEmotion = useCallback(async (emotion: string, intensity: number, notes: string) => {
  const reward = 10;
  const txHash = '0x' + Math.random().toString(16).substring(2, 66);
  
  const newEntry: EmotionEntry = {
    timestamp: Date.now(),
    emotion,
    intensity,
    notes,
    earned: reward,
    txHash
  };
  
  try {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    // Validate inputs
    if (!emotion || emotion.trim() === '') {
      throw new Error('Emotion cannot be empty');
    }

    if (intensity < 1 || intensity > 10) {
      throw new Error('Intensity must be between 1 and 10');
    }

    console.log('Logging emotion:', {
      walletAddress: address,
      emotion,
      intensity,
      notes,
      earned: reward,
      txHash
    });

    const response = await fetch('/api/emotions/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: address,
        emotion,
        intensity,
        notes: notes || '',
        earned: reward,
        txHash
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const dbEntry = await response.json();
    
    // Update with DB ID
    newEntry._id = dbEntry.data._id;
    newEntry.timestamp = new Date(dbEntry.data.timestamp).getTime();
    newEntry.txHash = dbEntry.data.txHash;
    
    console.log('✅ Emotion logged:', newEntry);
  } catch (error) {
    console.error('❌ Error logging emotion:', error);
    // Still save locally for offline capability
  }
  
  const newHistory = [newEntry, ...history];
  const newBalances = { ...balances, 'FEELS': (balances['FEELS'] || 0) + reward };
  
  setHistory(newHistory);
  setBalances(newBalances);
  
  if (address) {
    saveToLocalStorage(address, newHistory, newBalances, ownedGames);
  }
}, [history, balances, address, ownedGames, saveToLocalStorage]);
```

### Issue 3: API Not Starting

**Symptoms:**
- `npm run dev` fails
- Port 3000 already in use
- MongoDB connection timeout

**Solution:**

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev

# Check MongoDB connection
mongo mongodb+srv://user:pass@cluster.mongodb.net/feelspace

# Verify server startup
npm run dev -- --verbose
```

### Issue 4: CORS Errors

**Symptoms:**
- Browser console: "Access to XMLHttpRequest blocked by CORS policy"
- API calls fail from frontend

**Solution:**

Update `server/index.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Testing the Full Flow

### Step 1: Start MongoDB

```bash
mongod
```

### Step 2: Start Backend Server

```bash
cd /home/masterchiefff/Downloads/Feel-Space
npm run dev
# or specific to server
npm run dev --workspace=server
```

Expected output:
```
✅ Server running on http://localhost:3000
✅ MongoDB connected
```

### Step 3: Start Frontend

In a new terminal:

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v5.x.x ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 4: Test Wallet Connection

1. Visit `http://localhost:5173`
2. Click "Connect Wallet"
3. Select wallet (MetaMask or MiniPay)
4. Approve connection
5. Verify address displays in top-right

### Step 5: Test Emotion Logging

1. Click any emotion (Happy, Sad, etc.)
2. Set intensity slider
3. Add optional notes
4. Click "Log Emotion"
5. Verify:
   - Toast notification appears
   - Emotion added to history
   - FEELS balance increases by 10
   - Database shows new entry

**Check database:**

```bash
mongo feelspace
db.emotionlogs.find().pretty()
```

### Step 6: Test Game Session Logging

1. Click "Arcade"
2. Play any game
3. Complete game
4. Verify:
   - Game session recorded
   - Toast notification shows
   - Sessions page shows new entry
   - Database has game session

**Check database:**

```bash
mongo feelspace
db.gamesessions.find().pretty()
```

### Step 7: Test Smart Contract Interaction

1. Wallet connected and on Alfajores testnet
2. Emotions and games are being logged
3. Contract should be logging these on-chain (integrate later)

---

## API Debugging Checklist

- [x] **Wallet Connected?** Address shows in top-right
- [x] **Address Format Valid?** Should be `0x...` (42 chars)
- [x] **API Running?** Check `http://localhost:3000/api/emotions/history/0x...`
- [x] **MongoDB Connected?** Check server logs
- [x] **Request Payload Valid?** Check browser Network tab
- [x] **Response Status?** Should be 201 Created
- [x] **Data in Database?** Run MongoDB query
- [x] **No CORS Errors?** Check browser console

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Smart contract deployed to Alfajores
- [ ] Contract address saved in `deployed-addresses.json`
- [ ] MongoDB database created and accessible
- [ ] API server tested locally
- [ ] Frontend connects to wallet
- [ ] Emotions logging to database
- [ ] Game sessions logging to database
- [ ] Transaction hashes generating correctly
- [ ] History page displays all entries
- [ ] Game Sessions page shows stats
- [ ] Navigation appears when connected
- [ ] Redirect works on logout

---

## Quick Start Commands

```bash
# Deploy contract
npx hardhat run scripts/deploy.ts --network alfajores

# Start backend
npm run dev

# Start frontend (new terminal)
cd client && npm run dev

# Test API endpoint
curl -X POST http://localhost:3000/api/emotions/log \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "emotion": "happy",
    "intensity": 8,
    "notes": "Test emotion",
    "earned": 10
  }'

# Check MongoDB
mongo feelspace
db.emotionlogs.countDocuments()
db.gamesessions.countDocuments()
```

---

## Support & Next Steps

1. **Smart Contract Events:** Integrate event logging for blockchain transparency
2. **Token Transfers:** Implement FEELS token transfers on-chain
3. **Premium Games:** Set up game purchase system with smart contract
4. **Leaderboards:** Create competitive leaderboards using database
5. **Analytics Dashboard:** Build analytics from logged data

