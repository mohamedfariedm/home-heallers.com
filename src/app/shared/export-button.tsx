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
  const params = new URLSearchParams(searchParams)
  if(role) params.set('role', role)
  if(type) params.set('type', type)
  const handleClick = async () => {
    const token = Cookies.get('auth_token');
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${fileName}?export=1`,
      headers: { 
        'Authorization':`Bearer ${token}` ,
        'Accept-Language': 'en'
      },
    };
    try {
      const res = await axios.request(config)
      if(res.status == 200) {
        window.open(res.data?.data?.path, '_blank')
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
