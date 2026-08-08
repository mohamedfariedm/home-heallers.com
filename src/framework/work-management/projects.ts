'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { getWorkManagementRepository } from '@/lib/work-management';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '@/types/work-management';
import { WM_QUERY_KEYS } from './keys';

const repo = () => getWorkManagementRepository();

export function useWmProjects(departmentId?: string) {
  return useQuery({
    queryKey: [...WM_QUERY_KEYS.projects, departmentId ?? 'all'],
    queryFn: () => repo().listProjects(departmentId),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => repo().createProject(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.projects });
      toast.success('Project created');
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => repo().updateProject(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.projects });
      toast.success('Project updated');
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWmWorkflows() {
  return useQuery({
    queryKey: WM_QUERY_KEYS.workflows,
    queryFn: () => repo().listWorkflows(),
  });
}

export function useWmWorkflowForProject(projectId?: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.workflowForProject(projectId ?? ''),
    queryFn: () => repo().getWorkflowForProject(projectId!),
    enabled: !!projectId,
  });
}

export function useUpsertWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workflow: import('@/types/work-management').WorkflowDefinition) =>
      repo().upsertWorkflow(workflow),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.workflows });
      toast.success('Workflow saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
