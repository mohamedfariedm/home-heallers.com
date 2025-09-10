import { useQuery  } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useSalesChartReport(type: string, params: string) {
  return useQuery<any, Error>({queryKey: [routes.salesChart.index, type, params], queryFn: () => client.salesChart.all(type,params)});
};