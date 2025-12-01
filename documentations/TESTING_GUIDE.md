# Wallet Connection Testing Guide

## Quick Test Scenarios

### Scenario 1: Connect Wallet from Header
```
1. Visit the app
2. Click "Connect Wallet" button in header (desktop) or "Connect" button (mobile)
3. ✅ Modal should open showing installed wallets
4. Click on your wallet (MetaMask or MiniPay)
5. ✅ Wallet extension should open
6. Approve connection in wallet
7. ✅ Modal closes automatically
8. ✅ Header now shows wallet address and FEELS balance
9. ✅ Success toast: "Wallet Connected"
```

### Scenario 2: Connect Wallet from Home Page
```
1. Visit the app (not connected)
2. See home page with "Connect Wallet" button
3. Click button
4. ✅ Same wallet modal opens
5. Select wallet
6. ✅ Wallet extension opens and user connects
7. ✅ Redirected to main home page (not the gated version)
```

### Scenario 3: Disconnect and Clear Data
```
1. Connected wallet (see address in header)
2. Click logout button (mobile: icon, desktop: LogOut button)
3. ✅ Confirmation toast: "Wallet Disconnected - Your wallet has been disconnected and all data cleared."
4. ✅ Header shows "Connect Wallet" again
5. Open DevTools → Application → Local Storage
6. ✅ Verify these keys are GONE:
   - feelspace_wallet_address
   - feelspace_is_connected
   - feelspace_history
   - feelspace_balances
   - feelspace_games
```

### Scenario 4: Persistence After Refresh
```
1. Connect wallet
2. See data loaded (FEELS balance, history, games)
3. Refresh page (F5 or Ctrl+R)
4. ✅ Wallet address still shown
5. ✅ FEELS balance still shown
6. ✅ Data persists
7. Open DevTools → Network tab
8. ✅ Verify localStorage was used (no new API calls for loading)
```

### Scenario 5: Cancel Connection
```
1. Click "Connect Wallet"
2. Modal opens
3. Click wallet
4. Wallet extension opens
5. Click "Cancel" in wallet extension (don't approve)
6. ✅ Modal closes
7. ✅ Toast: "Connection Cancelled - You cancelled the wallet connection."
8. ✅ Header still shows "Connect Wallet"
```

### Scenario 6: Multiple Wallets (if both installed)
```
1. Have both MetaMask and MiniPay installed
2. Click "Connect Wallet"
3. ✅ Both should appear in "Available Wallets" section
4. ✅ Connection switches when you connect to different wallet
```

## Expected Toast Notifications

| Action | Toast Title | Toast Message |
|--------|------------|---------------|
| Connect Success | "Wallet Connected" | "Your wallet has been successfully connected." |
| Connection Cancelled | "Connection Cancelled" | "You cancelled the wallet connection." |
| Connection Failed | "Connection Failed" | "Could not connect to wallet. Please try again." |
| No Wallet Found | "No Wallet Found" | "Please install MetaMask or MiniPay to continue." |
| Disconnect | "Wallet Disconnected" | "Your wallet has been disconnected and all data cleared." |

## DevTools Verification

### Check localStorage items:
```javascript
// Open DevTools Console and run:
Object.entries(localStorage).filter(([k]) => k.includes('feelspace')).forEach(([k,v]) => console.log(k, v))

// Should show (when connected):
// feelspace_wallet_address: "0x..."
// feelspace_is_connected: "true"
// feelspace_history: "[...]"
// feelspace_balances: "{...}"
// feelspace_games: "[...]"

// Should show nothing (when disconnected)
```

### Check wallet events:
```javascript
// In console, you can verify wallet listeners are working:
window.ethereum?.on('accountsChanged', (accounts) => console.log('Accounts changed:', accounts))
window.ethereum?.on('chainChanged', (chain) => console.log('Chain changed:', chain))
```

## Troubleshooting

### Wallet Modal Doesn't Open
- Check DevTools Console for errors
- Verify wallet extension is installed
- Try refreshing page

### Wallet Extension Doesn't Open
- Check if `eth_requestAccounts` error in console
- Verify wallet extension permissions
- Try clearing browser cache and reinstalling extension

### localStorage Not Clearing on Disconnect
- Open DevTools Console
- Run: `localStorage.clear()` to manual clear
- Then refresh page
- Check if issue persists

### Data Persists After Logout
- Check that all 5 localStorage keys are actually removed
- If one key remains, the disconnect function might have had an error
- Check DevTools Console for JavaScript errors

## Performance Notes
- First connection: ~2-3 seconds (chain switch + data initialization)
- Subsequent loads: <500ms (from localStorage)
- Wallet modal animation: 200ms smooth transition
- All toasts: 2-3 second display time
