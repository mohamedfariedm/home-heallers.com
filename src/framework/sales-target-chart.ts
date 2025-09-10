import { useQuery  } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useSalesTargetChartReport(type: string, params: string) {
  return useQuery<any, Error>({queryKey: [routes.salesTargetChart.index, type, params], queryFn: () => client.salesTargetChart.all(type,params)});
};

export function useSalesTargetTableReport(type: string, params: string) {
  return useQuery<any, Error>({queryKey: [routes.salesTargetTable.index, type, params], queryFn: () => client.salesTargetTable.all(type, params)})
}