import { NextRequest, NextResponse } from 'next/server';
import { contractsData } from '@/data/contracts-data';
import { Contract } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const contract = contractsData.find(c => c.id === id);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: contract,
      message: 'Contract fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json() as Partial<Contract>;
    
    const contractIndex = contractsData.findIndex(c => c.id === id);
    
    if (contractIndex === -1) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const updatedContract: Contract = {
      id: id,
      visit_date: body.visit_date || contractsData[contractIndex].visit_date,
      last_date: body.last_date || contractsData[contractIndex].last_date,
      visit_time: body.visit_time || contractsData[contractIndex].visit_time,
      last_time: body.last_time || contractsData[contractIndex].last_time,
      service_manager_name: body.service_manager_name || contractsData[contractIndex].service_manager_name,
      last_service_manager: body.last_service_manager || contractsData[contractIndex].last_service_manager,
      company_activity: body.company_activity || contractsData[contractIndex].company_activity,
      company_location: body.company_location || contractsData[contractIndex].company_location,
      company_name: body.company_name || contractsData[contractIndex].company_name,
      manager_mobile: body.manager_mobile || contractsData[contractIndex].manager_mobile,
      manager_email: body.manager_email || contractsData[contractIndex].manager_email,
      visit_summary: body.visit_summary || contractsData[contractIndex].visit_summary,
      created_by: contractsData[contractIndex].created_by,
      updated_by: contractsData[contractIndex].updated_by,
      created_at: contractsData[contractIndex].created_at,
      updated_at: new Date().toISOString(),
    };

    contractsData[contractIndex] = updatedContract;

    return NextResponse.json({
      data: updatedContract,
      message: 'Contract updated successfully',
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const contractIndex = contractsData.findIndex(c => c.id === id);
    
    if (contractIndex === -1) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    contractsData.splice(contractIndex, 1);

    return NextResponse.json({
      message: 'Contract deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
