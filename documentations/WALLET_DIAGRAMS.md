# Wallet Connection - Visual Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FEEL SPACE APPLICATION                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                  useWeb3() - Central Hub                         │  │
│  │  • Manages wallet state                                          │  │
│  │  • Handles localStorage                                          │  │
│  │  • Provides connect/disconnect functions                         │  │
│  └──────────┬──────────────┬──────────────────────┬────────────────┘  │
│             │              │                      │                    │
│      ┌──────▼───┐   ┌──────▼───┐   ┌─────────────▼───┐               │
│      │ Layout   │   │ Home     │   │ WalletModal     │               │
│      │ (Header) │   │ (Landing)│   │ (Modal Dialog)  │               │
│      └──────────┘   └──────────┘   └─────────────────┘               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │            localStorage (Browser Storage)                       │  │
│  │  • feelspace_wallet_address                                     │  │
│  │  • feelspace_is_connected                                       │  │
│  │  • feelspace_history                                            │  │
│  │  • feelspace_balances                                           │  │
│  │  • feelspace_games                                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │           Wallet Extensions (Outside Browser)                   │  │
│  │  ┌─────────────┐         ┌──────────────┐                      │  │
│  │  │ MetaMask    │         │ MiniPay      │                      │  │
│  │  └─────────────┘         └──────────────┘                      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Connection State Machine

```
                           START
                            │
                            ▼
                    ┌──────────────┐
                    │ NOT_CONNECTED│
                    └──────────────┘
                            ▲
                            │
                            │ disconnect()
                            │
                    ┌──────────────────┐
                    │   CONNECTING     │  ◄─── connect() called
                    │                  │
                    │ Modal opens      │
                    │ User selects     │
                    │ wallet           │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ WALLET_EXTENSION │
                    │ AWAITING_APPROVAL│
                    │                  │
                    │ • MetaMask       │
                    │ • MiniPay        │
                    │ • Other EVM      │
                    └──────┬──────┬────┘
                           │      │
                    APPROVE│      │REJECT
                           │      │
                    ┌──────▼──┐  │
                    │CONNECTED│  │
                    └─────────┘  │
                           ▲      │
                           └──────┘
```

## Lifecycle Diagram

```
APP START
   │
   ├─ Check localStorage
   │  ├─ YES: Restore state ──► CONNECTED (Dashboard)
   │  └─ NO: Stay disconnected ──► NOT_CONNECTED (Login Gate)
   │
   ├─ User clicks "Connect Wallet"
   │  ├─ Modal opens
   │  ├─ User selects MetaMask
   │  │  ├─ Wallet extension opens
   │  │  ├─ User approves
   │  │  ├─ Get accounts: ["0x..."]
   │  │  ├─ Save to localStorage
   │  │  ├─ Set state
   │  │  ├─ Close modal ──► CONNECTED (Dashboard)
   │  │  └─ Toast: "Connected"
   │  │
   │  └─ User cancels
   │     ├─ Modal closes
   │     └─ Toast: "Cancelled"
   │
   ├─ User clicks "Logout"
   │  ├─ Clear all state
   │  ├─ Remove all localStorage
   │  ├─ Close modal
   │  ├─ Toast: "Disconnected"
   │  └─ NOT_CONNECTED (Login Gate)
   │
   └─ User refreshes page
      ├─ Check localStorage
      ├─ Restore if exists
      └─ Show same state as before
```

## Data Flow - Connection

```
USER ACTION
   │ "Connect Wallet"
   ▼
connect() function
   │
   ├─ Check if window.ethereum exists
   │  ├─ NO: Show error toast, open modal
   │  └─ YES: Continue
   │
   ├─ Request accounts
   │  │ window.ethereum.request({ method: 'eth_requestAccounts' })
   │  │
   │  └─ [WALLET EXTENSION OPENS HERE]
   │     └─ User approves ──► Returns ["0x..."]
   │
   ├─ Get chain ID
   │  └─ window.ethereum.request({ method: 'eth_chainId' })
   │
   ├─ Get balance
   │  └─ window.ethereum.request({ method: 'eth_getBalance' })
   │
   ├─ Initialize user data
   │  ├─ balances = { FEELS: 0 }
   │  ├─ games = ['bubble', 'memory', 'breathing']
   │  └─ history = [...demo entries...]
   │
   ├─ Switch network
   │  └─ wallet_switchEthereumChain or wallet_addEthereumChain
   │
   ├─ Save to localStorage
   │  ├─ feelspace_wallet_address = "0x..."
   │  ├─ feelspace_is_connected = "true"
   │  ├─ feelspace_history = "..."
   │  ├─ feelspace_balances = "..."
   │  └─ feelspace_games = "..."
   │
   ├─ Close modal
   │  └─ setShowWalletModal(false)
   │
   ├─ Show success
   │  └─ Toast: "Wallet Connected"
   │
   └─ Update UI
      └─ Header shows address + balance
```

## Data Flow - Disconnection

```
USER ACTION
   │ "Logout"
   ▼
disconnect() function
   │
   ├─ Clear all state
   │  ├─ setAddress(null)
   │  ├─ setIsConnected(false)
   │  ├─ setBalance('0')
   │  ├─ setBalances({})
   │  ├─ setOwnedGames([])
   │  ├─ setHistory([])
   │  └─ setShowWalletModal(false)
   │
   ├─ Clear localStorage
   │  ├─ removeItem('feelspace_wallet_address')
   │  ├─ removeItem('feelspace_is_connected')
   │  ├─ removeItem('feelspace_history')
   │  ├─ removeItem('feelspace_balances')
   │  └─ removeItem('feelspace_games')
   │
   ├─ Show confirmation
   │  └─ Toast: "Wallet Disconnected"
   │
   └─ Update UI
      └─ Header shows "Connect Wallet" button
```

## Component Communication

```
Layout.tsx                      Home.tsx
    │                              │
    │ isConnected                  │
    ├─► Show balance &        ├─► Show dashboard or
    │   address or            │   login gate
    │   "Connect" button       │
    │                          │
    │                          │
    └──────┬──────────────────┘
           │
           ▼
    useWeb3() Hook
           │
      ┌────┴────┐
      │          │
      ▼          ▼
 WalletModal  localStorage
      │          │
      │          │
      ├─► Open when │
      │   connect   ├─► Persist data
      │   clicked   │   Restore data
      │          │
      └────┬─────┘
           │
           ▼
    window.ethereum
    (Wallet API)
```

## Error Handling Flow

```
connect() or disconnect()
    │
    ├─ Try block
    │  ├─ Success ──► Save state ──► Show success toast
    │  │
    │  └─ Error ────┐
    │               │
    │               ├─ Code 4001 (User rejected)
    │               │  └─ Toast: "Connection Cancelled"
    │               │
    │               ├─ No wallet found
    │               │  ├─ Toast: "No Wallet Found"
    │               │  └─ Open modal
    │               │
    │               └─ Other errors
    │                  └─ Toast: "Connection Failed"
    │
    └─ Catch block
       └─ Log error, show generic error message
```

## localStorage State Diagram

```
┌────────────────────────────────────────────────────┐
│         localStorage States                        │
├────────────────────────────────────────────────────┤
│                                                    │
│  EMPTY                                             │
│  (App start)                                       │
│   └─ No feelspace keys                             │
│   └─ isConnected = false                           │
│                                                    │
│              │                                     │
│              │ User connects                       │
│              ▼                                     │
│  POPULATED                                         │
│  (Connected)                                       │
│   ├─ feelspace_wallet_address = "0x..."           │
│   ├─ feelspace_is_connected = "true"              │
│   ├─ feelspace_history = "[...]"                  │
│   ├─ feelspace_balances = "{...}"                 │
│   └─ feelspace_games = "[...]"                    │
│                                                    │
│              │                                     │
│              │ User disconnects                    │
│              ▼                                     │
│  EMPTY                                             │
│  (Disconnected)                                    │
│   └─ All keys removed                              │
│   └─ isConnected = false                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Toast Notification Timeline

```
CONNECT ACTION
│
├─ 0.5s: Modal opens
│
├─ 2.0s: User selects wallet
│
├─ 2.5s: Wallet extension opens
│
├─ 5.0s: User approves in wallet
│
├─ 5.5s: ✅ "Wallet Connected" Toast appears
│        └─ Shows for 3 seconds
│
└─ 8.5s: Toast disappears, user sees connected dashboard


DISCONNECT ACTION
│
├─ 0.5s: User clicks logout
│
├─ 1.0s: ℹ️ "Wallet Disconnected" Toast appears
│        └─ Shows for 3 seconds
│
└─ 4.0s: Toast disappears, user sees login screen
```

## Wallet Extension Integration

```
Browser Application                Wallet Extension
        │                                  │
        │  connect() called               │
        │──────────────────────────►      │
        │                           [Opens UI]
        │                                  │
        │                           [Shows account]
        │                           [Shows permissions]
        │                                  │
        │                          [User clicks approve]
        │                                  │
        │◄──────────── Returns accounts ──│
        │              ["0x..."]           │
        │                                  │
        │  Chain switch requested         │
        │──────────────────────────►      │
        │                           [Shows network]
        │                           [User approves]
        │                                  │
        │◄──────────── Confirmed ─────────│
        │  (Network switched)              │
        │                                  │
```

## Performance Timeline

```
FIRST CONNECT (2-3 seconds)
├─ 0ms: connect() called
├─ 100ms: Modal closes
├─ 200ms: Wallet extension opens
├─ 2000ms: User approves
├─ 2500ms: Get accounts
├─ 2700ms: Get chain ID
├─ 2800ms: Get balance
├─ 2900ms: Initialize data
├─ 3000ms: Switch network
├─ 3100ms: Save to localStorage
└─ 3200ms: Display connected state ✓


RETURN VISIT (<500ms)
├─ 0ms: App loads
├─ 50ms: Check localStorage
├─ 100ms: Restore state
├─ 150ms: Render dashboard
└─ 300ms: Display connected state ✓


DISCONNECT (1-2 seconds)
├─ 0ms: disconnect() called
├─ 10ms: Clear state
├─ 20ms: Clear localStorage
├─ 30ms: Show toast
└─ 100ms: Render login gate ✓
```

## Security Model

```
┌──────────────────────────────────────────┐
│       Feel Space Application              │
├──────────────────────────────────────────┤
│                                          │
│  • Never stores private keys             │
│  • Never stores seed phrases             │
│  • Only stores wallet address            │
│  • Only stores connection status         │
│                                          │
│        ⬇️                                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  localStorage (Browser)             │ │
│  │                                    │ │
│  │  • Wallet address (public)         │ │
│  │  • User data (history, etc.)       │ │
│  │  • Connection status               │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│        ⬇️                                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Wallet Extension (Separate)       │ │
│  │                                    │ │
│  │  ✅ Stores private keys            │ │
│  │  ✅ Stores seed phrases            │ │
│  │  ✅ Isolated from app              │ │
│  │  ✅ User controls access           │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

These diagrams illustrate the complete architecture, data flow, and user interactions of your wallet connection system!
