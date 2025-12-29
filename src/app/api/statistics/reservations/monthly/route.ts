import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://development.home-healers.com';
const API_TOKEN = process.env.API_TOKEN || '458|9szzfrTT64SGn7sCy7t2NUur8xi5Ty2AP3u98JZM8a85beb6';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build backend API URL with query parameters
    const backendURL = new URL(`${API_BASE_URL}/api/statistics/reservations/monthly`);
    
    // Forward all query parameters to backend
    searchParams.forEach((value, key) => {
      backendURL.searchParams.append(key, value);
    });

    console.log('Fetching monthly from:', backendURL.toString());

    // Make request to backend API
    const response = await fetch(backendURL.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        'language': 'en',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API Error:', response.status, errorText);
      throw new Error(`Backend API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Monthly data received');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching monthly statistics:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { data: [], summary: { total_reservations: 0, total_months: 0, average_per_month: 0 } }
      },
      { status: 500 }
    );
  }
}

