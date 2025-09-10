import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function usePage(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.pages.index],
    queryFn: () => client.pages.all(param),
  });
}
export function useSections(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.sections.index, param],
    queryFn: () => client.pages.sections(param),
  });
}
export function usePosts(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.posts.index, param],
    queryFn: () => client.pages.postes(param),
  });
}
export function usePages(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.pages.index, param],
    queryFn: () => client.pages.spacificPage(param),
  });
}

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.pages.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.posts.index] });
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
    mutationFn: client.pages.updatePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.pages.index] });
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
    mutationFn: client.pages.edit,
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
