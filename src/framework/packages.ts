import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import { unwrapPackage } from '@/app/shared/offers/utils';

export function usePackages(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.packages.index, param],
    queryFn: () => client.packages.all(param),
  });
}

export function usePackage(id?: string | number, enabled = true) {
  return useQuery<any, Error>({
    queryKey: [routes.packages.index, 'detail', id],
    queryFn: async () => unwrapPackage(await client.packages.findOne(Number(id))),
    enabled: Boolean(id) && enabled,
  });
}

export const useCreatePackages = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const { mutate, isPending } = useMutation({
    mutationFn: client.packages.create,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [routes.packages.index] });
      toast.success('packages created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });

  return { mutate, isPending };
};

export const useUpdatePackages = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.packages.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.packages.index] });
      toast.success('packages updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};

export const useDeletePackages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.packages.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [routes.packages.index] }),
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => unwrapPackage(await client.packages.create(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.packages.index] });
      toast.success('Offer created successfully');
    },
    onError: (error: any) => {
      if (error?.response?.status !== 422) {
        toast.error(error?.message || 'Failed to create offer');
      }
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => unwrapPackage(await client.packages.update(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.packages.index] });
      toast.success('Offer saved');
    },
    onError: (error: any) => {
      if (error?.response?.status !== 422) {
        toast.error(error?.message || 'Failed to save offer');
      }
    },
  });
};

export function usePackageFaqs(packageId?: string | number, enabled = true) {
  return useQuery<any, Error>({
    queryKey: [routes.packages.index, packageId, 'faqs'],
    queryFn: () => client.packages.faqs.all(Number(packageId)),
    enabled: Boolean(packageId) && enabled,
  });
}

export const useCreatePackageFaq = (packageId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: any) =>
      client.packages.faqs.create({ packageId, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.packages.index, packageId, 'faqs'],
      });
      toast.success('FAQ created');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create FAQ');
    },
  });
};

export const useUpdatePackageFaq = (packageId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { faqId: number | string; body: any }) =>
      client.packages.faqs.update({ packageId, faqId: input.faqId, body: input.body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.packages.index, packageId, 'faqs'],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update FAQ');
    },
  });
};

export const useDeletePackageFaq = (packageId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (faqId: number | string) =>
      client.packages.faqs.delete({ packageId, faqId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.packages.index, packageId, 'faqs'],
      });
      toast.success('FAQ deleted');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete FAQ');
    },
  });
};
