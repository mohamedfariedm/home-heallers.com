import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import { OnboardingScreen } from '@/types/onboarding-screens';

const LIST_KEY = [routes.onboardingScreens.index, 'list'];
const detailKey = (id: string | number) => [
  routes.onboardingScreens.index,
  'detail',
  String(id),
];

const sortByOrder = (list: OnboardingScreen[]) =>
  [...list].sort((a, b) => a.order - b.order);

// Always fetch the whole list (active + inactive): reorder needs every id,
// so status filtering is done client-side.
export function useOnboardingScreens() {
  return useQuery<OnboardingScreen[], Error>({
    queryKey: LIST_KEY,
    queryFn: async () => {
      const res: any = await client.onboardingScreens.all();
      const data = res?.data;
      return Array.isArray(data) ? sortByOrder(data as OnboardingScreen[]) : [];
    },
  });
}

export function useOnboardingScreen(id?: string | number) {
  return useQuery<OnboardingScreen | null, Error>({
    queryKey: detailKey(id ?? ''),
    queryFn: async () => {
      const res: any = await client.onboardingScreens.findOne(id!);
      return res?.data ?? null;
    },
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export const useCreateOnboardingScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => client.onboardingScreens.create(data),
    onSuccess: () => {
      toast.success('Onboarding screen created successfully');
      queryClient.invalidateQueries({ queryKey: [routes.onboardingScreens.index] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create onboarding screen');
    },
  });
};

export const useUpdateOnboardingScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: FormData }) =>
      client.onboardingScreens.update({ id, data }),
    onSuccess: () => {
      toast.success('Onboarding screen updated successfully');
      queryClient.invalidateQueries({ queryKey: [routes.onboardingScreens.index] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update onboarding screen');
    },
  });
};

export const useDeleteOnboardingScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => client.onboardingScreens.delete(id),
    onSuccess: () => {
      toast.success('Onboarding screen deleted successfully');
      queryClient.invalidateQueries({ queryKey: [routes.onboardingScreens.index] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete onboarding screen');
    },
  });
};

export const useToggleOnboardingScreenActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => client.onboardingScreens.toggleActive(id),
    onSuccess: () => {
      toast.success('Onboarding screen status updated');
      queryClient.invalidateQueries({ queryKey: [routes.onboardingScreens.index] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update status');
    },
  });
};

// Optimistic: the list is reordered in the cache immediately and rolled back
// if the API rejects it.
export const useReorderOnboardingScreens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => client.onboardingScreens.reorder(ids),
    onMutate: async (ids: number[]) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      const previous = queryClient.getQueryData<OnboardingScreen[]>(LIST_KEY);
      if (previous) {
        const byId = new Map(previous.map((s) => [s.id, s]));
        const next = ids
          .map((id, index) => {
            const screen = byId.get(id);
            return screen ? { ...screen, order: index } : null;
          })
          .filter(Boolean) as OnboardingScreen[];
        queryClient.setQueryData(LIST_KEY, next);
      }
      return { previous };
    },
    onSuccess: (res: any) => {
      const data = res?.data?.data;
      if (Array.isArray(data)) {
        queryClient.setQueryData(LIST_KEY, sortByOrder(data as OnboardingScreen[]));
      }
      toast.success('Order saved');
    },
    onError: (err: any, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(LIST_KEY, context.previous);
      }
      toast.error(err?.message || 'Failed to save the new order');
    },
  });
};
