import { useQuery  } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useInstoreReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.instore.index,"pormotion" ,params], queryFn: () => client.instore.all(params)});
};
export function useIeaModal(id:number) {
  return useQuery<any, Error>({queryKey: [routes.instore.index,"pormotion" ,id], queryFn: () => client.instore.findOne(id)});
};