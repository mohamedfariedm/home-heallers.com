import { useQuery } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useNewInstalledPOSMReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.newInstalledPOSM.index, params], queryFn: () => client.newInstalledPOSM.all(params)});
};

export function useGetNewInstalledPOSMReport(id: number) {

  return useQuery<any, Error>({queryKey: [routes.newInstalledPOSM.index, id], queryFn: () => client.newInstalledPOSM.findOne(id)})
}