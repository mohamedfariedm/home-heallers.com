import { useQuery } from '@tanstack/react-query';
import client from '@/framework/utils'
import { routes } from '@/config/routes';

export function useNewInstalledSoftPOSMReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.newInstalledSoftPOSM.index, params], queryFn: () => client.newInstalledSoftPOSM.all(params)});
};

export function useGetNewInstalledSoftPOSMReport(id: number) {

  return useQuery<any, Error>({queryKey: [routes.newInstalledSoftPOSM.index,"softPosm", id], queryFn: () => client.newInstalledSoftPOSM.findOne(id)})
}