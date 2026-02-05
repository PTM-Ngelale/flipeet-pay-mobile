# Balance Display Fix (Mobile App)

## Problem

The mobile app was showing **0.00** balance even though the web app displayed the correct balance.

## Root Cause Analysis

The issue was a **missing authentication state initialization on app startup**:

### What happens on the web app ✅

- Auth token persists in browser storage or state management
- Token remains available across page reloads
- Balances are fetched when component mounts

### What was happening on the mobile app ❌

1. App starts → Redux state is **fresh/empty**
2. `token` in Redux is **null**
3. `home.tsx` (line 95-98) only fetches balances IF `token` exists:
   ```typescript
   useEffect(() => {
     if (token) {
       dispatch(fetchUserBalances());
     }
   }, [dispatch, token]);
   ```
4. Since `token` is null → `fetchUserBalances()` is **never called**
5. Balances remain **empty** → display shows **0.00**

The token **WAS** saved to AsyncStorage after login (in `authSlice.ts` line 391), but it was **never restored** on app startup.

---

## Solution Implemented

Created a new **`AuthInitializer` component** that:

1. **Runs on app startup** (dispatches `loadAuthState` on mount)
2. **Restores the token & user** from AsyncStorage
3. **Triggers the balance fetch** via the dependency chain:
   - `loadAuthState` → updates Redux `state.token`
   - `home.tsx` detects `token` change → calls `fetchUserBalances()`
   - `fetchUserBalances()` → API returns balances
   - Balance displays correctly

### Files Changed

#### 1. Created: `app/contexts/AuthInitializer.tsx` (NEW)

```typescript
export function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log("[AuthInitializer] Restoring auth state from AsyncStorage...");
    dispatch(loadAuthState());
  }, [dispatch]);

  return null;
}
```

#### 2. Modified: `app/_layout.tsx`

- Added import: `import { AuthInitializer } from "./contexts/AuthInitializer";`
- Added component inside Redux Provider:
  ```tsx
  <ReduxProvider store={store}>
    <AuthInitializer /> // ← Restores auth on app startup
    <BankAccountProvider>{/* ... rest of providers ... */}</BankAccountProvider>
  </ReduxProvider>
  ```

---

## Why This Works

**Execution Flow on App Startup:**

```
App Starts
  ↓
RootLayout renders
  ↓
ReduxProvider initialized
  ↓
AuthInitializer mounts
  ↓
Dispatches loadAuthState() ← Reads from AsyncStorage
  ↓
Redux state updated with token ✅
  ↓
home.tsx detects token changed
  ↓
fetchUserBalances() dispatched ← Now token exists!
  ↓
API returns balances
  ↓
Balance displays correctly ✅
```

---

## Testing Steps

1. **Log in** (token saved to AsyncStorage)
2. **Close the app** completely
3. **Reopen the app**
4. **Verify:** Balance now displays correctly (not 0.00)
5. **Check console logs:** Look for `[AuthInitializer] Restoring auth state from AsyncStorage...`

---

## Related Code References

- **Auth State Loading:** [app/store/authSlice.ts](app/store/authSlice.ts#L299) - `loadAuthState` thunk
- **Balance Fetching:** [app/home.tsx](app/home.tsx#L95) - dependency on `token`
- **Token Persistence:** [app/store/authSlice.ts](app/store/authSlice.ts#L390) - saves to AsyncStorage
