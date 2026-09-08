import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import { unwrapAdminRecord } from '@/utils/slugs';
import { isFieldValidationError } from '@/utils/seo-fields';

export function useBlogs(param: string) {
  return useQuery<any, Error>({ queryKey: [routes.blogs.index, param], queryFn: () => client.blog.all(param) });
}

export function useBlogDetail(id?: string | number) {
  return useQuery<any, Error>({
    queryKey: [routes.blogs.index, 'detail', id],
    queryFn: async () => unwrapAdminRecord(await client.blog.findOne(id!)),
    enabled: id !== undefined && id !== null && id !== '',
  });
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
    onError: (err: any) => {
      if (isFieldValidationError(err)) return;
      toast.error(`Error: ${err.message}`);
    },
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
    onError: (err: any) => {
      if (isFieldValidationError(err)) return;
      toast.error(`Error: ${err.message}`);
    },
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
