'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { getWorkManagementRepository } from '@/lib/work-management';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@/types/work-management';
import { WM_QUERY_KEYS } from './keys';

const repo = () => getWorkManagementRepository();

export function useWmUsers() {
  return useQuery({
    queryKey: WM_QUERY_KEYS.users,
    queryFn: () => repo().listUsers(),
  });
}

export function useWmDepartments() {
  return useQuery({
    queryKey: WM_QUERY_KEYS.departments,
    queryFn: () => repo().listDepartments(),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: (input: CreateDepartmentInput) => repo().createDepartment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.departments });
      toast.success('Department created');
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: (input: UpdateDepartmentInput) => repo().updateDepartment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.departments });
      toast.success('Department updated');
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useArchiveDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo().archiveDepartment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.departments });
      toast.success('Department archived');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
