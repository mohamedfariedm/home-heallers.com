import { useQuery, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useBenchmarkReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.benchmark.index, params], queryFn: () => client.benchmark.all(params)});
};

export function useGetBenchmarkReport(id: number) {

  return useQuery<any, Error>({queryKey: [routes.benchmark.index, id], queryFn: () => client.benchmark.findOne(id)})
}