import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useCenters(param: string) {
    return useQuery<any, Error>({
        queryKey: [routes.centers.index, param],
        queryFn: () => client.centers.all(param),
    });
}

export const useCreateCenter = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();

    const { mutate, isPending } = useMutation({
        mutationFn: async (input: any) => {
            const response = await client.centers.create(input);
            return response.data?.data || response.data;
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: [routes.centers.index] });
            toast.success('Center created successfully');
            closeModal();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create center';
            toast.error(`Error: ${errorMessage}`);
        },
    });

    return { mutate, isPending };
};

export const useUpdateCenter = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
    return useMutation({
        mutationFn: async (input: any) => {
            const response = await client.centers.update(input);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [routes.centers.index] });
            toast.success('Center updated successfully');
            closeModal();
        },
        onError: (error: any) => {
            toast.error(`Error: ${error?.message || 'Failed to update center'}`);
        },
    });
};

export const useDeleteCenter = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: client.centers.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [routes.centers.index] });
            toast.success('Center deleted successfully');
        },
        onError: (error: any) => {
            toast.error(`Error: ${error?.message || 'Failed to delete center'}`);
        },
    });
};

export const useGetCenter = (id: number) => {
    return useQuery<any, Error>({
        queryKey: [routes.centers.index, id],
        queryFn: () => client.centers.findOne(id),
        enabled: !!id,
    });
};
