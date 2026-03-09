'use client';

import { PiArrowLineUpBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import cn from '@/utils/class-names';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

type ExportButtonProps = {
  data: {columns: unknown[], rows: unknown[]};
  header: string;
  fileName: string;
  className?: string;
  role?: string;
  type?: string;
};

export default function ExportButton({
  data,
  header,
  fileName,
  className,
  role,
  type
}: ExportButtonProps) {
  const searchParams = useSearchParams()
  
  const handleClick = async () => {
    const token = Cookies.get('auth_token');
    
    // Get all search params and remove page and limit
    const params = new URLSearchParams();
    // Convert ReadonlyURLSearchParams to regular object and filter out page/limit
    for (const [key, value] of searchParams.entries()) {
      if(key !== 'page' && key !== 'limit') {
        params.set(key, value);
      }
    }
    
    // Add role if provided
    if(role) params.set('role', role);
    
    // Add export parameter
    params.set('export', '1');
    
    // Build the base URL based on fileName
    let baseUrl = '';
    if(fileName === 'customer-supports-marketing') {
      baseUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/customer-supports`;
      params.set('type', 'marketing');
    } else if(fileName === 'customer-supports-operation') {
      baseUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/customer-supports`;
      params.set('type', 'operation');
    } else {
      baseUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${fileName}`;
    }
    
    // Construct the full URL with query params
    const url = `${baseUrl}?${params.toString()}`;
    
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: url,
      headers: { 
        'Authorization':`Bearer ${token}` ,
        'Accept-Language': 'en'
      },
    };
    try {
      const res = await axios.request(config)
      console.log(res);
      
      if(res.status == 200) {
        window.open(res.data?.download_url, '_blank')
      } 
    } catch (e) {
      const error = new Error(e as string);
      toast.error(error.message)
    }
    
    
  }
  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={cn('w-full @lg:w-auto', className)}
    >
      <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
      Export {header.toUpperCase()}
    </Button>
  );
}
