import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.home-healers.com';
const API_TOKEN = process.env.API_TOKEN || '458|9szzfrTT64SGn7sCy7t2NUur8xi5Ty2AP3u98JZM8a85beb6';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build backend API URL with query parameters
    const backendURL = new URL(`${API_BASE_URL}/api/statistics/aggregates`);
    
    // Forward all query parameters to backend
    searchParams.forEach((value, key) => {
      backendURL.searchParams.append(key, value);
    });

    console.log('Fetching from:', backendURL.toString());

    // Make request to backend API with proper headers
    const response = await fetch(backendURL.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        'language': 'en',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API Error:', response.status, errorText);
      throw new Error(`Backend API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Aggregates data received:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching statistics aggregates:', error);
    
    // Return a more user-friendly response
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {
          customer_support: { by_type: [], total: 0 },
          reservations: { by_status: [], total: 0 },
          invoices: { by_status: [], total: 0 },
          doctors: { total: 0 },
          clients: { total: 0 }
        }
      },
      { status: 500 }
    );
  }
}

