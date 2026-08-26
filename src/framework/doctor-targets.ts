import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

const listKey = routes.doctorTargets.index;

function mutationError(error: Error) {
  toast.error(error?.message || 'Something went wrong');
}

export function useDoctorTargets(param: string, enabled = true) {
  return useQuery<any, Error>({
    queryKey: [listKey, param],
    queryFn: () => client.doctorTargets.all(param),
    enabled,
  });
}

export function useDoctorTarget(id: string | number) {
  return useQuery<any, Error>({
    queryKey: [listKey, id],
    queryFn: () => client.doctorTargets.findOne(id),
    enabled: !!id,
  });
}

export function useDoctorTargetsDashboard(enabled = true) {
  return useQuery<any, Error>({
    queryKey: [listKey, 'dashboard'],
    queryFn: () => client.doctorTargets.dashboard(),
    enabled,
  });
}

export function useDoctorTargetTimeline(id: string | number, enabled = true) {
  return useQuery<any, Error>({
    queryKey: [listKey, id, 'timeline'],
    queryFn: () => client.doctorTargets.timeline(id),
    enabled: !!id && enabled,
  });
}

export function useDoctorTargetPreview(id: string | number, enabled = false) {
  return useQuery<any, Error>({
    queryKey: [listKey, id, 'preview'],
    queryFn: () => client.doctorTargets.preview(id),
    enabled: !!id && enabled,
  });
}

function invalidateTargets(queryClient: ReturnType<typeof useQueryClient>, id?: string | number) {
  queryClient.invalidateQueries({ queryKey: [listKey] });
  if (id != null) {
    queryClient.invalidateQueries({ queryKey: [listKey, id] });
  }
}

export const useCreateDoctorTargets = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.doctorTargets.create,
    onSuccess() {
      invalidateTargets(queryClient);
      toast.success('Target(s) created as Draft');
      closeModal();
    },
    onError: mutationError,
  });
};

export const useUpdateDoctorTarget = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.doctorTargets.update,
    onSuccess(_data, variables) {
      invalidateTargets(queryClient, variables.id);
      toast.success('Target updated');
      closeModal();
    },
    onError: mutationError,
  });
};

export const useActivateDoctorTarget = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: (id: number | string) => client.doctorTargets.activate(id),
    onSuccess(_data, id) {
      invalidateTargets(queryClient, id);
      toast.success('Target activated');
      closeModal();
    },
    onError: mutationError,
  });
};

export const useRetargetDoctorTarget = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.doctorTargets.retarget,
    onSuccess() {
      invalidateTargets(queryClient);
      toast.success('New Draft target created');
      closeModal();
    },
    onError: mutationError,
  });
};

export const useAdjustDoctorTarget = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.doctorTargets.adjust,
    onSuccess(_data, variables) {
      invalidateTargets(queryClient, variables.id);
      toast.success('Completed sessions adjusted');
      closeModal();
    },
    onError: mutationError,
  });
};

export const useApproveDoctorTarget = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.doctorTargets.approve,
    onSuccess(_data, variables) {
      invalidateTargets(queryClient, variables.id);
      toast.success('Target approved — incentive credited to wallet (ledger)');
      closeModal();
    },
    onError: mutationError,
  });
};

export function downloadDoctorTargetsReport(
  type: string,
  from?: string,
  to?: string
) {
  const params = new URLSearchParams({ type });
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  return client.doctorTargets.reportsBlob(params.toString()).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctor-targets-${type}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  });
}
