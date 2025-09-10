import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function usePage(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.attachmentsService.index],
    queryFn: () => client.attachmentsService.all(param),
  });
}
export function useSections(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.sections.index, param],
    queryFn: () => client.attachmentsService.sections(param),
  });
}
export function usePosts(id: string) {
    return useQuery<any, Error>({
      queryKey: [routes.attachmentsService.index, id],
      queryFn: () => client.attachmentsService.postes(id),
    });
  }
  
  
export function usePages(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.attachmentsService.index, param],
    queryFn: () => client.attachmentsService.spacificPage(param),
  });
}

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.attachmentsService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.attachmentsService.index] });
      toast.success('Post updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};
export const useUpdatePages = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.attachmentsService.updatePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.attachmentsService.index] });
      toast.success('page updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};
export const useEditSection = () => {
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.attachmentsService.edit,
    onSuccess: () => {
      toast.success('Section updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};

// export function useBrands(param:string) {

//   return useQuery<any, Error>({queryKey: [routes.brands.index,param], queryFn: () => client.brands.allAgin(param)});
// };

// export const useCreateBrand = () => {

//   const queryClient = useQueryClient();
//   const { closeModal } = useModal();

//   const {mutate, isPending} = useMutation({
//     mutationFn: client.brands.create,
//     onSuccess() {
//       queryClient.invalidateQueries({queryKey: [routes.brands.index]})
//       toast.success('Brand created successfully')
//       closeModal()
//     },
//     onError: (error) => {
//       toast.error(`Error ${error?.message}`)
//     }
//   })

//   return { mutate, isPending}
// }

// export const useUpdateBrand = () => {
//   const queryClient = useQueryClient();
//   const { closeModal } = useModal();
//   return useMutation({
//     mutationFn: client.brands.update,
//     onSuccess: () => {
//       queryClient.invalidateQueries({queryKey: [routes.brands.index]})
//       toast.success('Brand updated successfully')
//       closeModal()
//     },
//     onError: (error) => {
//       toast.error(`Error ${error?.message}`)
//     }
//   })
// }

// export const useDeleteBrand = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//       mutationFn: client.brands.delete,
//       onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.brands.index]}),
//       onError: (error) => {
//         toast.error(`Error ${error?.message}`)
//       }
//     })
// }
