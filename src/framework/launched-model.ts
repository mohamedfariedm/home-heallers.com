import { useQuery } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useLaunchedModelReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.launchedModel.index, params], queryFn: () => client.launchedModel.all(params)});
};

export function useGetLaunchedModelReport(id: number) {

  return useQuery<any, Error>({queryKey: [routes.stockPrcess.index, id], queryFn: () => client.launchedModel.findOne(id)})
}