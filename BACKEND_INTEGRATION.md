# Backend API Integration Guide

## Security Notice ⚠️

**IMPORTANT**: Never commit API tokens to version control. Always use environment variables.

## Setup Instructions

### Step 1: Configure Environment Variables

Create a `.env.local` file in your project root (this file is gitignored):

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://backend.home-healers.com
API_TOKEN=your-actual-token-here
```

Replace `your-actual-token-here` with your actual API token.

### Step 2: Update Your .gitignore

Make sure `.env.local` is in your `.gitignore`:

```
# .gitignore
.env.local
.env*.local
```

### Step 3: Choose Integration Method

You have two options for integrating with your backend:

#### Option A: Direct Backend Integration (Recommended)

Replace the API route files to proxy requests to your backend:

1. **Backup current files**:
```bash
mv src/app/api/statistics/aggregates/route.ts src/app/api/statistics/aggregates/route.mock.ts
```

2. **Create new route.ts** that connects to your backend:

```typescript
// src/app/api/statistics/aggregates/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.home-healers.com';
const API_TOKEN = process.env.API_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backendURL = new URL(`${API_BASE_URL}/api/statistics/aggregates`);
    
    // Forward all query parameters
    searchParams.forEach((value, key) => {
      backendURL.searchParams.append(key, value);
    });

    const response = await fetch(backendURL.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

3. **Repeat for monthly and weekly routes**:
   - `src/app/api/statistics/reservations/monthly/route.ts`
   - `src/app/api/statistics/reservations/weekly/route.ts`

#### Option B: Client-Side Direct API Calls

Modify the dashboard component to call your backend directly:

```typescript
// src/app/shared/statistics/dashboard/index.tsx
import { apiClient } from '@/lib/api-client';

// In fetchStatistics function:
const fetchStatistics = async () => {
  setLoading(true);
  try {
    const params: Record<string, any> = {};
    
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    // ... other filters
    
    // Call backend directly
    const [aggregatesData, monthlyData, weeklyData] = await Promise.all([
      apiClient.get('/api/statistics/aggregates', params),
      apiClient.get('/api/statistics/reservations/monthly', params),
      apiClient.get('/api/statistics/reservations/weekly', params),
    ]);
    
    setAggregateData(aggregatesData.data);
    setMonthlyData(monthlyData.data || []);
    setWeeklyData(weeklyData.data || []);
  } catch (error) {
    console.error('Error fetching statistics:', error);
  } finally {
    setLoading(false);
  }
};
```

## Testing Backend Connection

### Test 1: Verify Environment Variables

```typescript
// Create a test file: src/app/api/test-config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasToken: !!process.env.API_TOKEN,
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    // DO NOT return the actual token
  });
}
```

Access: `http://localhost:3000/api/test-config`

### Test 2: Test Backend Connection

```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://backend.home-healers.com/api/statistics/aggregates"
```

### Test 3: Test Through Next.js API

```bash
# Test your Next.js API route
curl "http://localhost:3000/api/statistics/aggregates?date_from=2024-01-01"
```

## Backend API Requirements

Your backend should return data in this format:

### Aggregates Response:
```json
{
  "data": {
    "total_reservations": 25,
    "total_revenue": 13280.00,
    "average_amount": 531.20,
    "by_status": {
      "1": 2,
      "3": 18,
      "5": 5
    },
    "by_support_type": {
      "operation": 10,
      "maintenance": 6
    }
  },
  "message": "Statistics aggregates fetched successfully"
}
```

### Monthly Response:
```json
{
  "data": [
    {
      "period": "2024-01",
      "month": "January",
      "year": 2024,
      "total_reservations": 2,
      "total_revenue": 800.00,
      "average_amount": 400.00
    }
  ],
  "message": "Monthly statistics fetched successfully"
}
```

### Weekly Response:
```json
{
  "data": [
    {
      "period": "2024-W03",
      "week": 3,
      "year": 2024,
      "week_start_date": "2024-01-15",
      "total_reservations": 1,
      "total_revenue": 500.00,
      "average_amount": 500.00
    }
  ],
  "message": "Weekly statistics fetched successfully"
}
```

## Error Handling

The integration includes error handling for:
- Network errors
- Authentication errors (401)
- Server errors (500)
- Invalid response format

Errors are displayed in the browser console and can be shown to users through toast notifications.

## Security Best Practices

1. **Never expose API tokens in client-side code**
2. **Use Next.js API routes as a proxy** (Option A is recommended)
3. **Store tokens in environment variables**
4. **Add rate limiting to your API routes**
5. **Implement proper error handling**
6. **Use HTTPS for all API calls**

## Troubleshooting

### Issue: "Authorization failed"
- Check that your token is correct in `.env.local`
- Verify the token hasn't expired
- Ensure the token format is correct (Bearer token)

### Issue: "CORS errors"
- Use Next.js API routes as a proxy (Option A)
- Or configure CORS on your backend

### Issue: "Data not displaying"
- Check browser console for errors
- Verify API response format matches expected structure
- Check network tab in browser dev tools

### Issue: "Environment variables not loading"
- Restart your Next.js development server after changing `.env.local`
- Ensure variable names are correct
- Check that `.env.local` is in the project root

## Next Steps

1. Add your token to `.env.local`
2. Choose integration method (A or B)
3. Test the connection
4. Update the dashboard if needed to match your backend's response format
5. Deploy to production with proper environment variables

## Production Deployment

When deploying to production (Vercel, etc.):

1. **Add environment variables in your hosting platform**:
   - Go to your project settings
   - Add `NEXT_PUBLIC_API_BASE_URL` and `API_TOKEN`
   - Redeploy

2. **Vercel example**:
   ```bash
   vercel env add NEXT_PUBLIC_API_BASE_URL production
   vercel env add API_TOKEN production
   ```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the Next.js server logs
3. Verify your backend API is accessible
4. Test the backend API directly with curl or Postman

---

**Remember**: Keep your API token secure and never commit it to version control!

