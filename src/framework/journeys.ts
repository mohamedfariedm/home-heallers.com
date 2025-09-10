import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export const useJourneys = (param:string) => {
    return useQuery<any, Error>({queryKey: [routes.journeys.index,param], queryFn: () => client.journeys.all(param)});
}

export const useAllUserStore = () => {
    return useQuery<any, Error>({queryKey: [routes.journeys.index, 'create'], queryFn: () => client.journeys.findAllData()}); 
}

export const useJourneyDetails = (id: string) => {
  return useQuery<any, Error>({queryKey: [routes.journeys.index, id], queryFn: () => client.journeys.findOne(id)})
}

export const useCreateJourney = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.journeys.create,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.journeys.index]})
        toast.success('Journey created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}

export const useUpdateJourney = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.journeys.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.journeys.index]})
        toast.success('Journey updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}

export const useDeleteJourney = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.journeys.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.journeys.index]})
        toast.success('Journey deleted successfully')
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}