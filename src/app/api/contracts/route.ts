import { NextRequest, NextResponse } from 'next/server';
import { contractsData } from '@/data/contracts-data';
import { Contract, ContractResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const company_name = searchParams.get('company_name') || '';
    const company_activity = searchParams.get('company_activity') || '';
    const service_manager_name = searchParams.get('service_manager_name') || '';
    const manager_email = searchParams.get('manager_email') || '';

    // Filter data based on search parameters
    let filteredData = contractsData;

    if (search) {
      filteredData = filteredData.filter(contract =>
        contract.company_name.toLowerCase().includes(search.toLowerCase()) ||
        contract.company_activity.toLowerCase().includes(search.toLowerCase()) ||
        contract.service_manager_name.toLowerCase().includes(search.toLowerCase()) ||
        contract.manager_email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (company_name) {
      filteredData = filteredData.filter(contract =>
        contract.company_name.toLowerCase().includes(company_name.toLowerCase())
      );
    }

    if (company_activity) {
      filteredData = filteredData.filter(contract =>
        contract.company_activity.toLowerCase().includes(company_activity.toLowerCase())
      );
    }

    if (service_manager_name) {
      filteredData = filteredData.filter(contract =>
        contract.service_manager_name.toLowerCase().includes(service_manager_name.toLowerCase())
      );
    }

    if (manager_email) {
      filteredData = filteredData.filter(contract =>
        contract.manager_email.toLowerCase().includes(manager_email.toLowerCase())
      );
    }

    // Calculate pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const response: ContractResponse = {
      data: paginatedData,
      links: {
        first: `https://backend.home-healers.com/api/admin/contracts?page=1&limit=${limit}`,
        last: `https://backend.home-healers.com/api/admin/contracts?page=${totalPages}&limit=${limit}`,
        prev: page > 1 ? `https://backend.home-healers.com/api/admin/contracts?page=${page - 1}&limit=${limit}` : null,
        next: page < totalPages ? `https://backend.home-healers.com/api/admin/contracts?page=${page + 1}&limit=${limit}` : null,
      },
      meta: {
        current_page: page,
        from: startIndex + 1,
        last_page: totalPages,
        links: [
          {
            url: page > 1 ? `https://backend.home-healers.com/api/admin/contracts?page=${page - 1}&limit=${limit}` : null,
            label: '&laquo; Previous',
            active: false,
          },
          ...Array.from({ length: totalPages }, (_, i) => ({
            url: `https://backend.home-healers.com/api/admin/contracts?page=${i + 1}&limit=${limit}`,
            label: String(i + 1),
            active: i + 1 === page,
          })),
          {
            url: page < totalPages ? `https://backend.home-healers.com/api/admin/contracts?page=${page + 1}&limit=${limit}` : null,
            label: 'Next &raquo;',
            active: false,
          },
        ],
        path: 'https://backend.home-healers.com/api/admin/contracts',
        per_page: limit,
        to: endIndex,
        total: total,
      },
      message: 'Contracts fetched successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Contract>;
    
    // Generate new ID
    const newId = Math.max(...contractsData.map(c => c.id)) + 1;
    const now = new Date().toISOString();
    
    const newContract: Contract = {
      id: newId,
      visit_date: body.visit_date || '',
      last_date: body.last_date || '',
      visit_time: body.visit_time || '',
      last_time: body.last_time || '',
      service_manager_name: body.service_manager_name || '',
      last_service_manager: body.last_service_manager || '',
      company_activity: body.company_activity || '',
      company_location: body.company_location || '',
      company_name: body.company_name || '',
      manager_mobile: body.manager_mobile || '',
      manager_email: body.manager_email || '',
      visit_summary: body.visit_summary || '',
      created_by: null,
      updated_by: null,
      created_at: now,
      updated_at: now,
    };

    // In a real application, you would save this to a database
    contractsData.unshift(newContract);

    return NextResponse.json({
      data: newContract,
      message: 'Contract created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
