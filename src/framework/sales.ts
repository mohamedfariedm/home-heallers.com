import { useQuery  } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useSalesReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.sales.index, params], queryFn: () => client.sales.all(params)});
};