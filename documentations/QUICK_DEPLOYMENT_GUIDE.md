# Quick Deployment & Setup Reference

## 🚀 One-Command Deployment

### 1. Environment Setup

```bash
# Go to project root
cd /home/masterchiefff/Downloads/Feel-Space

# Create .env file
cat > .env << 'EOF'
# Smart Contract Deployment
PRIVATE_KEY=your_wallet_private_key_here
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
CELO_ALFAJORES_CHAIN_ID=44787

# After deployment, add:
EMOTION_TRACKER_CONTRACT_ADDRESS=0x...

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feelspace?retryWrites=true&w=majority
DATABASE_NAME=feelspace

# API
PORT=3000
API_HOST=localhost
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0x...
EOF
```

### 2. Deploy Smart Contract

```bash
# Install dependencies if needed
npm install

# Compile contract
npx hardhat compile

# Deploy to Alfajores testnet
npx hardhat run scripts/deploy.ts --network alfajores

# Output will show:
# ✅ EmotionTracker deployed to: 0xAbCd...
# ✅ Contract address saved to deployed-addresses.json
```

### 3. Update Addresses

After deployment, update these files:

**`.env`:**
```
EMOTION_TRACKER_CONTRACT_ADDRESS=0xYourContractAddressFromDeployment
```

**`client/src/contracts/deployed-addresses.json`:**
```json
{
  "emotionTrackerAddress": "0xYourContractAddressFromDeployment",
  "deployedAt": "2025-12-01T10:00:00.000Z",
  "network": "alfajores"
}
```

### 4. Start Services

**Terminal 1 - Start MongoDB:**
```bash
mongod
# Should show: "waiting for connections on port 27017"
```

**Terminal 2 - Start Backend:**
```bash
cd /home/masterchiefff/Downloads/Feel-Space
npm run dev
# Should show: "✅ Server running on http://localhost:3000"
```

**Terminal 3 - Start Frontend:**
```bash
cd /home/masterchiefff/Downloads/Feel-Space/client
npm run dev
# Should show: "Local: http://localhost:5173"
```

---

## 🧪 Testing the Integration

### Test 1: Wallet Connection
```bash
# Open browser: http://localhost:5173
# Click "Connect Wallet"
# Select wallet and approve
# Verify: Address shows in top-right corner
```

### Test 2: Emotion Logging
```bash
# On home page, click any emotion (e.g., "Happy")
# Set intensity slider (1-10)
# Add optional notes
# Click "Log Emotion"
# Verify:
# - Notification appears
# - Entry shows in History page
# - FEELS balance increased by 10

# Check database:
mongo feelspace
db.emotionlogs.find().pretty()
```

### Test 3: Game Sessions
```bash
# Click "Arcade" in navigation
# Play a game (e.g., Breathing)
# Complete the game
# Verify:
# - Notification appears
# - Entry shows in Sessions page
# - Game stats update

# Check database:
mongo feelspace
db.gamesessions.find().pretty()
```

### Test 4: API Endpoints Directly
```bash
# Get wallet address from browser console or top-right display
# Should be format: 0x1234567890123456789012345678901234567890

# Test emotion API
curl -X POST http://localhost:3000/api/emotions/log \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "emotion": "happy",
    "intensity": 8,
    "notes": "Test emotion",
    "earned": 10,
    "txHash": "0x' + $(openssl rand -hex 32)'"
  }'

# Should return 201 Created:
# {
#   "success": true,
#   "data": { ... }
# }
```

---

## 🔍 Troubleshooting

### Issue: "Cannot find module"
```bash
# Install dependencies
npm install
pnpm install  # if using pnpm
```

### Issue: "Port 3000 already in use"
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: "MongoDB connection failed"
```bash
# Start MongoDB
mongod

# Or verify connection string in .env
# Connection string should be:
# mongodb://localhost:27017/feelspace (local)
# OR
# mongodb+srv://user:pass@cluster.mongodb.net/feelspace (Atlas)
```

### Issue: "Wallet address validation error"
```bash
# Wallet address must be:
# - 42 characters long
# - Start with 0x
# - Format: 0x + 40 hexadecimal characters

# Example valid address:
# 0x1234567890123456789012345678901234567890

# Check address in browser console:
# Open DevTools > Console
# Type: window.ethereum?.selectedAddress
# Or check top-right of Feel Space app
```

### Issue: "API returns 400 Bad Request"
```bash
# Check request body has all required fields:
# - walletAddress (42 chars, starts with 0x)
# - emotion (string, non-empty)
# - intensity (1-10)
# - notes (optional)
# - earned (optional)
# - txHash (optional)

# For game sessions, required fields:
# - walletAddress
# - gameId
# - score (>= 0)
# - txHash (optional)
```

### Issue: "Emotion not appearing in database"
```bash
# Check MongoDB directly
mongo feelspace
db.emotionlogs.count()  # Should increase after logging

# If count doesn't increase:
# 1. Check browser console for errors
# 2. Verify wallet is connected
# 3. Check wallet address format (see above)
# 4. Check server logs for API errors
# 5. Verify MongoDB connection string
```

---

## 📊 Database Queries

```bash
# Connect to MongoDB
mongo

# Use feelspace database
use feelspace

# Check all emotions for a wallet
db.emotionlogs.find({
  "walletAddress": "0x..."
}).pretty()

# Check all game sessions
db.gamesessions.find().pretty()

# Count total entries
db.emotionlogs.countDocuments()
db.gamesessions.countDocuments()

# Get recent entries (last 5)
db.emotionlogs.find().sort({ timestamp: -1 }).limit(5).pretty()

# Get average intensity
db.emotionlogs.aggregate([
  {
    $group: {
      _id: null,
      averageIntensity: { $avg: "$intensity" }
    }
  }
])

# Get emotions by type
db.emotionlogs.aggregate([
  {
    $group: {
      _id: "$emotion",
      count: { $sum: 1 }
    }
  }
])
```

---

## 📋 Navigation Structure

### Desktop Navigation (when connected):
```
Feel Space Logo  |  (spacer)  |  Arcade  |  Sessions  |  History  |  (divider)  |  FEELS Balance  |  Wallet Address  |  Logout
```

### Mobile Navigation:
```
Header: Feel Space Logo              |  FEELS Balance  Logout Button
Bottom: Home | Arcade | Sessions | History
```

### When Not Connected:
```
Desktop: Feel Space Logo  |  (spacer)  |  Connect Wallet Button
Mobile:  Feel Space Logo  |  Connect Button
```

---

## 🎯 Contract Address Locations

After deployment, update these 3 places:

1. **`.env` file:**
   ```
   EMOTION_TRACKER_CONTRACT_ADDRESS=0x...
   ```

2. **`client/src/contracts/deployed-addresses.json`:**
   ```json
   {
     "emotionTrackerAddress": "0x..."
   }
   ```

3. **`server/config/env.ts`** (if using):
   ```typescript
   export const EMOTION_TRACKER_ADDRESS = process.env.EMOTION_TRACKER_CONTRACT_ADDRESS;
   ```

---

## ✅ Final Checklist Before Production

- [ ] Smart contract deployed to Alfajores
- [ ] Contract address saved in all 3 locations
- [ ] `.env` file configured with all variables
- [ ] MongoDB database created and accessible
- [ ] Backend starts without errors: `npm run dev`
- [ ] Frontend starts without errors: `cd client && npm run dev`
- [ ] Wallet connects successfully
- [ ] Emotions log to database
- [ ] Game sessions log to database
- [ ] History page shows entries
- [ ] Sessions page shows stats
- [ ] Navigation appears when connected
- [ ] Navigation hides when disconnected
- [ ] Logout redirects to home
- [ ] Transaction hashes visible in History

---

## 🚀 Production Deployment

### Before Going Live:

1. **Switch Network:**
   ```
   # In .env, change from Alfajores to Mainnet
   CELO_MAINNET_RPC=https://forno.celo.org
   CHAIN_ID=42220
   ```

2. **Update Frontend:**
   ```
   # In client/.env
   VITE_NETWORK_NAME=mainnet
   VITE_CHAIN_ID=42220
   ```

3. **Deploy New Contract:**
   ```bash
   npx hardhat run scripts/deploy.ts --network celo
   ```

4. **Update Database:**
   - Use production MongoDB URI
   - Create backups before switching

5. **Deploy Services:**
   - Use production hosting (Vercel, Railway, etc.)
   - Configure environment variables
   - Test all flows end-to-end

---

## 📞 Support Links

- [Celo Documentation](https://docs.celo.org)
- [Hardhat Documentation](https://hardhat.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Celo Block Explorer - Alfajores](https://alfajores-blockscout.celo-testnet.org/)
- [MetaMask Support](https://support.metamask.io/)
- [MiniPay Documentation](https://docs.minipay.celo.org/)

