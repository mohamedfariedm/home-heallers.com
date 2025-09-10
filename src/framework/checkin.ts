import { useQuery, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useChickInReport(params: string) {
  return useQuery<any, Error>({queryKey: [routes.chickIn.index, params], queryFn: () => client.checkin.all(params)});
};

export function useGetReport(id: number) {

  return useQuery<any, Error>({queryKey: [routes.chickIn.index, id], queryFn: () => client.checkin.findOne(id)})
}