# Wallet Connection Architecture

## Component Hierarchy and Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        useWeb3() Hook                            │
│  (Central State Management)                                      │
│                                                                  │
│  State:                                                          │
│  ├─ address: string | null                                      │
│  ├─ isConnected: boolean                                         │
│  ├─ balance: string                                              │
│  ├─ balances: { [key: string]: number }                          │
│  ├─ ownedGames: string[]                                         │
│  ├─ history: EmotionEntry[]                                      │
│  ├─ showWalletModal: boolean                                     │
│  └─ installedWallets: WalletOption[]                             │
│                                                                  │
│  Functions:                                                      │
│  ├─ connect(walletName?: string) ← TRIGGERS WALLET EXTENSION    │
│  ├─ disconnect() ← CLEARS localStorage                           │
│  ├─ saveToLocalStorage(...)                                      │
│  ├─ clearLocalStorage() ← REMOVES ALL FEELSPACE KEYS             │
│  ├─ buyGame(gameId)                                              │
│  └─ logEmotion(...)                                              │
└─────────────────────────────────────────────────────────────────┘
         △                          △                  △
         │                          │                  │
         └──────────┬───────────────┴──────────────────┘
                    │
        ┌───────────┴────────────────┐
        │                            │
   ┌────▼──────┐           ┌────────▼────────┐
   │ Layout.tsx│           │   Home.tsx      │
   │ (Header)  │           │ (Landing Page)  │
   │           │           │                 │
   │ • Button: │           │ • Button:       │
   │   Connect │           │   Connect       │
   │   Wallet  │           │   Wallet        │
   │           │           │                 │
   │ • Shows:  │           │ • Shows:        │
   │   Balance │           │   Welcome page  │
   │   Address │           │                 │
   │   Logout  │           │                 │
   └─────┬─────┘           └────────┬────────┘
         │                          │
         └──────────┬───────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   WalletModal.tsx    │
         │                      │
         │ Shows:               │
         │ • MetaMask (✓)       │
         │ • MiniPay  (✓)       │
         │ • Download links     │
         │ • Coming Soon        │
         │                      │
         │ On wallet select:    │
         │ calls connect()      │
         └─────────┬────────────┘
                   │
         ┌─────────▼──────────┐
         │ Wallet Extension   │
         │ (MetaMask/MiniPay) │
         │                    │
         │ User approves:     │
         │ Returns accounts[] │
         └────────────────────┘
```

## State Management Lifecycle

### 1. Initial Load
```
App Start
    ↓
Load localStorage
    ├─ feelspace_wallet_address
    ├─ feelspace_is_connected
    ├─ feelspace_history
    ├─ feelspace_balances
    └─ feelspace_games
    ↓
Set state from localStorage (if exists)
    ↓
User sees either:
    ├─ Connected dashboard (if was connected)
    └─ Login gate (if wasn't connected)
```

### 2. User Connects
```
User clicks "Connect Wallet"
    ↓
setShowWalletModal(true)
    ↓
WalletModal opens
    ↓
User selects wallet (e.g., "MetaMask")
    ↓
connect("MetaMask") called
    ↓
eth_requestAccounts requested
    ↓
[WALLET EXTENSION OPENS - USER APPROVES]
    ↓
Receive accounts: ["0x..."]
    ↓
Set all state:
    ├─ setAddress("0x...")
    ├─ setIsConnected(true)
    ├─ setChainId(chainId)
    ├─ setBalance(...)
    ├─ setBalances({FEELS: 0})
    ├─ setOwnedGames([...])
    └─ setHistory([...])
    ↓
saveToLocalStorage() ← PERSISTS DATA
    ├─ feelspace_wallet_address = "0x..."
    ├─ feelspace_is_connected = "true"
    ├─ feelspace_history = "[...]"
    ├─ feelspace_balances = "{...}"
    └─ feelspace_games = "[...]"
    ↓
setShowWalletModal(false)
    ↓
Toast: "Wallet Connected"
    ↓
Header updates → Shows address & balance
```

### 3. User Disconnects
```
User clicks "Logout" button
    ↓
disconnect() called
    ↓
Clear all state:
    ├─ setAddress(null)
    ├─ setIsConnected(false)
    ├─ setBalance("0")
    ├─ setBalances({})
    ├─ setOwnedGames([])
    ├─ setHistory([])
    └─ setShowWalletModal(false)
    ↓
clearLocalStorage() ← REMOVES ALL KEYS
    ├─ localStorage.removeItem('feelspace_wallet_address')
    ├─ localStorage.removeItem('feelspace_is_connected')
    ├─ localStorage.removeItem('feelspace_history')
    ├─ localStorage.removeItem('feelspace_balances')
    └─ localStorage.removeItem('feelspace_games')
    ↓
Toast: "Wallet Disconnected"
    ↓
Header updates → Shows "Connect Wallet"
```

### 4. Page Refresh (Connected)
```
User refreshes page
    ↓
Load localStorage
    ↓
Check: localStorage.getItem('feelspace_is_connected') === 'true'
    ↓
YES ✓
    ├─ Restore address
    ├─ Restore balances
    ├─ Restore history
    ├─ Restore games
    └─ setIsConnected(true)
    ↓
User sees dashboard immediately
    └─ Fast load from localStorage (no API calls)
```

## localStorage Keys

| Key | Value | Cleared On |
|-----|-------|-----------|
| `feelspace_wallet_address` | `"0x71C...9A21"` | Disconnect ✅ |
| `feelspace_is_connected` | `"true"` | Disconnect ✅ |
| `feelspace_history` | `"[{...},{...}]"` | Disconnect ✅ |
| `feelspace_balances` | `"{\"FEELS\": 100}"` | Disconnect ✅ |
| `feelspace_games` | `"[\"bubble\",\"memory\",\"breathing\"]"` | Disconnect ✅ |

## Wallet Extension Integration

### How eth_requestAccounts Works
```javascript
window.ethereum.request({ method: 'eth_requestAccounts' })
    ↓
[This is what opens the wallet extension popup]
    ↓
User sees wallet extension UI
    ↓
User approves connection
    ↓
Promise resolves with: ["0x..."]
    ↓
Ready to use wallet
```

### Supported Wallets
| Wallet | Detection | Download |
|--------|-----------|----------|
| MetaMask | `window.ethereum?.isMetaMask` | https://metamask.io/download/ |
| MiniPay | `window.ethereum?.isMiniPay` | https://minipay.celo.org/ |
| Other EVM | `typeof window.ethereum !== 'undefined'` | Show install prompts |

## Error Handling Flow

```
connect() called
    ↓
Try to request accounts
    ↓
├─ Success: Continue with connection ✓
│
├─ Error Code 4001: User rejected
│      └─ Toast: "Connection Cancelled"
│
├─ Error: No wallet found
│      ├─ Show toast: "No Wallet Found"
│      └─ Open modal
│
└─ Other error
       └─ Toast: "Connection Failed"
```

## Chain Configuration

```
Target Network: Celo Alfajores Testnet
Chain ID: 0xaef3
RPC URL: https://alfajores-forno.celo-testnet.org
Block Explorer: https://alfajores-blockscout.celo-testnet.org/

On Connect:
├─ Get current chainId
├─ If != 0xaef3:
│   ├─ Try: wallet_switchEthereumChain
│   └─ If fails with 4902 (network not found):
│       └─ Try: wallet_addEthereumChain
└─ If user rejects:
    └─ Clear localStorage and show error
```

## Benefits of Current Architecture

✅ **Centralized State** - Single source of truth via `useWeb3()` hook  
✅ **Shared UI** - `WalletModal` used everywhere, consistent UX  
✅ **Persistence** - Data survives page refreshes  
✅ **Clean Logout** - All data cleared when disconnecting  
✅ **Error Handling** - User-friendly error messages  
✅ **Toast Notifications** - Visual feedback for all actions  
✅ **Wallet Detection** - Auto-detects installed wallets  
✅ **Chain Management** - Auto-switches or adds Celo network  
