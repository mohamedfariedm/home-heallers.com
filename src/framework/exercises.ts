import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import type {
  ApiResponse,
  Exercise,
  ExerciseFilterOptionsResponse,
  ExerciseImportInput,
  ExerciseImportResult,
  ExercisesListResponse,
  RehabilitationCategory,
  RehabilitationReviewInput,
} from '@/types/admin-exercises';

export const exerciseKeys = {
  all: (param: string) => [routes.exercises.index, param] as const,
  detail: (id: number) => [routes.exercises.index, id] as const,
  filterOptions: () => [routes.exercises.index, 'filter-options'] as const,
  rehabilitationReview: (param: string) =>
    [routes.exercises.index, 'rehabilitation-review', param] as const,
  rehabilitationCategories: () =>
    [routes.exercises.index, 'rehabilitation-categories'] as const,
};

export function useExercises(param: string, enabled = true) {
  return useQuery<ExercisesListResponse, Error>({
    queryKey: exerciseKeys.all(param),
    queryFn: () => client.exercises.all(param) as Promise<ExercisesListResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useExercise(id: number, enabled = true) {
  return useQuery<ApiResponse<Exercise>, Error>({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => client.exercises.findOne(id) as Promise<ApiResponse<Exercise>>,
    enabled: Boolean(id) && enabled,
  });
}

export function useExercisesFilterOptions(enabled = true) {
  return useQuery<ExerciseFilterOptionsResponse, Error>({
    queryKey: exerciseKeys.filterOptions(),
    queryFn: () =>
      client.exercises.filterOptions() as Promise<ExerciseFilterOptionsResponse>,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useRehabilitationReviewCandidates(
  param: string,
  enabled = true
) {
  return useQuery<ExercisesListResponse, Error>({
    queryKey: exerciseKeys.rehabilitationReview(param),
    queryFn: () =>
      client.exercises.rehabilitationReview(param) as Promise<ExercisesListResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useRehabilitationCategories(enabled = true) {
  return useQuery<ApiResponse<RehabilitationCategory[]>, Error>({
    queryKey: exerciseKeys.rehabilitationCategories(),
    queryFn: () =>
      client.exercises.rehabilitationCategories() as Promise<
        ApiResponse<RehabilitationCategory[]>
      >,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useReviewExerciseRehabilitation() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: (input: RehabilitationReviewInput) =>
      client.exercises.reviewRehabilitation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.exercises.index] });
      toast.success('Rehabilitation review saved successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const { mutate, isPending } = useMutation({
    mutationFn: client.exercises.create,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [routes.exercises.index] });
      toast.success('Exercise created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });

  return { mutate, isPending };
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.exercises.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.exercises.index] });
      toast.success('Exercise updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: client.exercises.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.exercises.index] });
      toast.success('Exercise deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
}

export function useImportExercises() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: ExerciseImportInput) => client.exercises.import(input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [routes.exercises.index] });
      const queued =
        (response as { data?: { data?: ExerciseImportResult } })?.data?.data
          ?.queued ??
        (response as { data?: ExerciseImportResult })?.data?.queued ??
        true;
      toast.success(
        queued
          ? 'Exercise dataset import has been queued'
          : 'Exercise import completed'
      );
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });

  return { mutate, isPending };
}
