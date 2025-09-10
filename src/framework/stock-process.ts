import { useQuery  } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useStockProcessReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.stockPrcess.index, params], queryFn: () => client.stockPrcess.all(params)});
};

export function useGetStockReport(id: number) {

  return useQuery<any, Error>({queryKey: [routes.stockPrcess.index, id], queryFn: () => client.stockPrcess.findOne(id)})
}