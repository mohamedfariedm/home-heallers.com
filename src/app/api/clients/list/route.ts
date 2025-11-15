import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.home-healers.com';
const API_TOKEN = process.env.API_TOKEN || '458|9szzfrTT64SGn7sCy7t2NUur8xi5Ty2AP3u98JZM8a85beb6';

export async function GET(request: NextRequest) {
  try {
    // Fetch all clients with pagination
    const allClients: any[] = [];
    let page = 1;
    const limit = 100; // Fetch 100 per page
    let hasMore = true;

    while (hasMore) {
      const backendURL = new URL(`${API_BASE_URL}/api/admin/clients`);
      backendURL.searchParams.append('page', String(page));
      backendURL.searchParams.append('limit', String(limit));
      
      const response = await fetch(backendURL.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'language': 'en',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Backend API Error: ${response.statusText}`);
      }

      const result = await response.json();
      const clients = result.data || [];
      
      if (clients.length > 0) {
        allClients.push(...clients);
        page++;
        // Check if there are more pages
        const totalPages = result.meta?.last_page || Math.ceil((result.meta?.total || 0) / limit);
        hasMore = page <= totalPages;
      } else {
        hasMore = false;
      }
    }

    return NextResponse.json({ data: allClients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: [] // Return empty array on error
      },
      { status: 500 }
    );
  }
}

