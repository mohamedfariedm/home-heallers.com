import { useQuery  } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useLogReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.logRequest.index,"pormotion" ,params], queryFn: () => client.logRequest.all(params)});
};
export function useIeaModal(id:number) {
  return useQuery<any, Error>({queryKey: [routes.logRequest.index,"pormotion" ,id], queryFn: () => client.logRequest.findOne(id)});
};