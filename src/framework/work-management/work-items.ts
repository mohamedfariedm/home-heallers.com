'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { getWorkManagementRepository } from '@/lib/work-management';
import type {
  CreateWorkItemInput,
  UpdateWorkItemInput,
  WorkItemFilters,
  WorkItemLinkType,
  WorkItemStatus,
} from '@/types/work-management';
import { WM_QUERY_KEYS } from './keys';

const repo = () => getWorkManagementRepository();

function invalidateWork(qc: ReturnType<typeof useQueryClient>, key?: string) {
  qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.workItems });
  qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.dashboard });
  if (key) {
    qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.workItem(key) });
  }
}

export function useWmWorkItems(filters?: WorkItemFilters) {
  return useQuery({
    queryKey: [...WM_QUERY_KEYS.workItems, filters ?? {}],
    queryFn: () => repo().listWorkItems(filters),
  });
}

export function useWmWorkItem(idOrKey: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.workItem(idOrKey),
    queryFn: () => repo().getWorkItem(idOrKey),
    enabled: !!idOrKey,
  });
}

export function useCreateWorkItem() {
  const qc = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: (input: CreateWorkItemInput) => repo().createWorkItem(input),
    onSuccess: (item) => {
      invalidateWork(qc, item.key);
      toast.success(`Created ${item.key}`);
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateWorkItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateWorkItemInput) => repo().updateWorkItem(input),
    onSuccess: (item) => {
      invalidateWork(qc, item.key);
      toast.success('Work item updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssignWorkItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      workItemId: string;
      assigneeId: string | null;
      actorId: string;
    }) =>
      repo().assignWorkItem(args.workItemId, args.assigneeId, args.actorId),
    onSuccess: (item) => {
      invalidateWork(qc, item.key);
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.activities(item.id) });
      toast.success('Assignee updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTransitionWorkItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      workItemId: string;
      toStatus: WorkItemStatus;
      actorId: string;
    }) =>
      repo().transitionStatus(args.workItemId, args.toStatus, args.actorId),
    onSuccess: (item) => {
      invalidateWork(qc, item.key);
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.activities(item.id) });
      toast.success(`Status → ${item.status}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteWorkItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; actorId: string }) =>
      repo().deleteWorkItem(args.id, args.actorId),
    onSuccess: () => {
      invalidateWork(qc);
      toast.success('Work item deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWmComments(workItemId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.comments(workItemId),
    queryFn: () => repo().listComments(workItemId),
    enabled: !!workItemId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { workItemId: string; authorId: string; body: string }) =>
      repo().addComment(args.workItemId, args.authorId, args.body),
    onSuccess: (_c, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.comments(vars.workItemId) });
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.activities(vars.workItemId) });
      toast.success('Comment added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEditComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      commentId: string;
      authorId: string;
      body: string;
      workItemId: string;
    }) => repo().editComment(args.commentId, args.authorId, args.body),
    onSuccess: (_c, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.comments(vars.workItemId) });
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.activities(vars.workItemId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      commentId: string;
      authorId: string;
      workItemId: string;
    }) => repo().deleteComment(args.commentId, args.authorId),
    onSuccess: (_c, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.comments(vars.workItemId) });
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.activities(vars.workItemId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWmAttachments(workItemId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.attachments(workItemId),
    queryFn: () => repo().listAttachments(workItemId),
    enabled: !!workItemId,
  });
}

export function useAddAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      workItemId: string;
      file: {
        name: string;
        mimeType: string;
        size: number;
        dataUrl: string;
        original?: string;
        thumbnail?: string;
        serverId?: string | number;
      };
      uploadedById: string;
    }) => repo().addAttachment(args.workItemId, args.file, args.uploadedById),
    onSuccess: (_a, vars) => {
      qc.invalidateQueries({
        queryKey: WM_QUERY_KEYS.attachments(vars.workItemId),
      });
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.activities(vars.workItemId) });
      toast.success('Attachment added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      attachmentId: string;
      actorId: string;
      workItemId: string;
    }) => repo().removeAttachment(args.attachmentId, args.actorId),
    onSuccess: (_a, vars) => {
      qc.invalidateQueries({
        queryKey: WM_QUERY_KEYS.attachments(vars.workItemId),
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWmActivities(workItemId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.activities(workItemId),
    queryFn: () => repo().listActivities(workItemId),
    enabled: !!workItemId,
  });
}

export function useWmWorkLogs(workItemId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.workLogs(workItemId),
    queryFn: () => repo().listWorkLogs(workItemId),
    enabled: !!workItemId,
  });
}

export function useAddWorkLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      workItemId: string;
      userId: string;
      hours: number;
      date: string;
      description: string;
      itemKey?: string;
    }) =>
      repo().addWorkLog(
        args.workItemId,
        args.userId,
        args.hours,
        args.date,
        args.description
      ),
    onSuccess: (_l, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.workLogs(vars.workItemId) });
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.activities(vars.workItemId) });
      if (vars.itemKey) invalidateWork(qc, vars.itemKey);
      toast.success('Work logged');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWmLinks(workItemId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.links(workItemId),
    queryFn: () => repo().listLinks(workItemId),
    enabled: !!workItemId,
  });
}

export function useAddLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      sourceId: string;
      targetId: string;
      type: WorkItemLinkType;
      actorId: string;
    }) => repo().addLink(args.sourceId, args.targetId, args.type, args.actorId),
    onSuccess: (_l, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.links(vars.sourceId) });
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.links(vars.targetId) });
      toast.success('Link added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      linkId: string;
      actorId: string;
      workItemId: string;
    }) => repo().removeLink(args.linkId, args.actorId),
    onSuccess: (_l, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.links(vars.workItemId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWmChildren(parentId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.children(parentId),
    queryFn: () => repo().listChildren(parentId),
    enabled: !!parentId,
  });
}

export function useWmSavedViews(userId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.savedViews(userId),
    queryFn: () => repo().listSavedViews(userId),
    enabled: !!userId,
  });
}

export function useSaveView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      userId: string;
      name: string;
      filters: WorkItemFilters;
    }) => repo().saveView(args.userId, args.name, args.filters),
    onSuccess: (_v, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.savedViews(vars.userId) });
      toast.success('View saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSavedView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; userId: string }) =>
      repo().deleteSavedView(args.id, args.userId),
    onSuccess: (_v, vars) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.savedViews(vars.userId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWmNotifications(userId: string) {
  return useQuery({
    queryKey: WM_QUERY_KEYS.notifications(userId),
    queryFn: () => repo().listNotifications(userId),
    enabled: !!userId,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; userId: string }) =>
      repo().markNotificationRead(args.id, args.userId),
    onSuccess: (_n, vars) => {
      qc.invalidateQueries({
        queryKey: WM_QUERY_KEYS.notifications(vars.userId),
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => repo().markAllNotificationsRead(userId),
    onSuccess: (_n, userId) => {
      qc.invalidateQueries({ queryKey: WM_QUERY_KEYS.notifications(userId) });
    },
  });
}

export function useWmDashboard() {
  return useQuery({
    queryKey: WM_QUERY_KEYS.dashboard,
    queryFn: () => repo().getDashboardKpis(),
  });
}

export function useResetWmDemoData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await repo().resetDemoData?.();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wm'] });
      toast.success('Demo data reset');
    },
  });
}
