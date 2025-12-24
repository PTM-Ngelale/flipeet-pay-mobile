# Testing Bank API Integration

## Quick Diagnostics

### 1. Check Console Logs
When you open the Add Bank Account screen, you should see these logs in your console:

```
[AddBankAccount] Dispatching fetchBanks
[fetchBanks] Starting bank fetch...
[fetchBanks] Token available: true
[fetchBanks] Calling API: https://api.pay.flipeet.io/api/v1/ramp/banks
[fetchBanks] Response status: 200
[fetchBanks] Full API response: {...}
[AddBankAccount] Banks loaded: 44
```

### 2. Check Debug Info
At the top of the Add Bank Account screen, you'll see a gray debug box showing:
- Number of banks loaded
- Loading state
- Token availability

### 3. Common Issues & Solutions

#### Issue: "No banks available" with Retry button
**Possible Causes:**
- No internet connection
- Backend API is down
- Authentication token is invalid/expired
- CORS issues (if testing on web)

**To Diagnose:**
1. Check console logs for the actual error
2. Look for `[fetchBanks]` logs
3. Check if token is available in debug info

**To Fix:**
- Click "Retry Loading Banks" button
- Restart the app
- Check your internet connection
- Verify you're logged in (token should show ✓)

#### Issue: Banks loading forever
**Possible Causes:**
- API taking too long to respond
- Network timeout

**To Fix:**
- Check console for error logs
- Force close and restart the app
- Check backend API status

#### Issue: "No banks match your search"
**This is normal** - it means banks loaded successfully but your search didn't match any bank names. Clear the search to see all banks.

### 4. Manual API Test

You can test the API directly using curl or Postman:

```bash
# Replace YOUR_TOKEN with your actual auth token
curl -X GET "https://api.pay.flipeet.io/api/v1/ramp/banks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Access Bank",
      "code": "044"
    }
    // ... more banks
  ]
}
```

### 5. Test Account Verification

After selecting a bank and entering a 10-digit account number, you should see:
- "Verifying account..." message
- Then account name appears if valid
- Or error message if invalid

Console logs to watch for:
```
[BankComponent] Verifying account: {...}
[verifyBankAccount] Response: {...}
```

### 6. Getting Your Auth Token

To manually test the API, you need your auth token. Add this temporary code to see it:

In `add-bank-account.tsx`, add after the other useEffect:
```typescript
useEffect(() => {
  console.log("AUTH TOKEN:", token);
}, [token]);
```

Then check console when you open the screen.

### 7. Expected Behavior

**When it works correctly:**
1. Open "Add Bank Account" screen
2. Debug info shows: "X banks loaded | Loading: No | Token: ✓"
3. Tap "Bank Name" dropdown
4. See full list of Nigerian banks
5. Search works to filter banks
6. Select a bank
7. Enter 10-digit account number
8. See "Verifying account..." briefly
9. Account name appears if valid

**If you see:**
- "0 banks loaded" → API call failed, check logs
- "Loading: Yes" forever → Network timeout, retry
- "Token: ✗" → Not logged in, go back and log in
- "No banks available" with retry → API error, check backend

### 8. Quick Fixes

**Fix 1: Clear cache and restart**
```bash
# Stop the app
# Clear metro cache
npx expo start -c
```

**Fix 2: Check Redux store directly**
Add this to any component to see full state:
```typescript
const fullState = useSelector((state: RootState) => state);
console.log("FULL REDUX STATE:", JSON.stringify(fullState, null, 2));
```

**Fix 3: Force fetch banks**
Add a button to manually trigger fetch:
```typescript
<TouchableOpacity onPress={() => dispatch(fetchBanks())}>
  <Text>Force Refresh Banks</Text>
</TouchableOpacity>
```

### 9. Backend Checklist

Ask backend team to verify:
- [ ] GET /ramp/banks endpoint is working
- [ ] Returns array of banks with id, name, code
- [ ] Authentication is working correctly
- [ ] CORS is configured for your domain
- [ ] No rate limiting blocking your requests
- [ ] Response format matches expected structure

### 10. Emergency Fallback

If API is completely down, you can temporarily add fallback banks:

In `bankAccountSlice.ts`, modify fetchBanks:
```typescript
if (Array.isArray(bankList) && bankList.length > 0) {
  // existing code
} else {
  // Temporary fallback
  console.warn("[fetchBanks] Using fallback bank list");
  return [
    { id: 1, name: "Access Bank", code: "044" },
    { id: 2, name: "GTBank", code: "058" },
    // ... add more
  ];
}
```

**IMPORTANT:** This is temporary only - remove once API is working!
