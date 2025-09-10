import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useBlogs(param: string) {
  return useQuery<any, Error>({ queryKey: [routes.blogs.index, param], queryFn: () => client.blog.all(param) });
}

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.blog.create,
    onSuccess: () => {
      toast.success('Blog created successfully');
      queryClient.invalidateQueries({ queryKey: [routes.blogs.index] });
      closeModal();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.blog.update,
    onSuccess: () => {
      toast.success('Blog updated successfully');
      queryClient.invalidateQueries({ queryKey: [routes.blogs.index] });
      closeModal();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.blog.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [routes.blogs.index] }),
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};
