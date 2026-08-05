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
  ExerciseProgram,
  ExerciseProgramClient,
  ExerciseProgramCreateInput,
  ExerciseProgramItemExercise,
  ExerciseProgramSession,
  ExerciseProgramUpdateInput,
  ExerciseProgramsListResponse,
} from '@/types/admin-exercise-programs';

export const exerciseProgramKeys = {
  all: (param: string) => [routes.exercisePrograms.index, param] as const,
  detail: (id: number) => [routes.exercisePrograms.index, id] as const,
  clients: (param: string) =>
    [routes.exercisePrograms.index, 'clients', param] as const,
  sessions: (param: string) =>
    [routes.exercisePrograms.index, 'sessions', param] as const,
  exercises: (param: string) =>
    [routes.exercisePrograms.index, 'exercises', param] as const,
};

export function useExercisePrograms(param: string, enabled = true) {
  return useQuery<ExerciseProgramsListResponse, Error>({
    queryKey: exerciseProgramKeys.all(param),
    queryFn: () =>
      client.exercisePrograms.all(param) as Promise<ExerciseProgramsListResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useExerciseProgram(id: number, enabled = true) {
  return useQuery<ApiResponse<ExerciseProgram>, Error>({
    queryKey: exerciseProgramKeys.detail(id),
    queryFn: () =>
      client.exercisePrograms.findOne(id) as Promise<ApiResponse<ExerciseProgram>>,
    enabled: Boolean(id) && enabled,
  });
}

export function useExerciseProgramClients(param: string, enabled = true) {
  return useQuery<ApiResponse<ExerciseProgramClient[]>, Error>({
    queryKey: exerciseProgramKeys.clients(param),
    queryFn: () =>
      client.exercisePrograms.clients(param) as Promise<
        ApiResponse<ExerciseProgramClient[]>
      >,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useExerciseProgramSessions(param: string, enabled = true) {
  return useQuery<ApiResponse<ExerciseProgramSession[]>, Error>({
    queryKey: exerciseProgramKeys.sessions(param),
    queryFn: () =>
      client.exercisePrograms.sessions(param) as Promise<
        ApiResponse<ExerciseProgramSession[]>
      >,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useExerciseProgramExercises(param: string, enabled = true) {
  return useQuery<
    ApiResponse<ExerciseProgramItemExercise[]> | ExerciseProgramsListResponse,
    Error
  >({
    queryKey: exerciseProgramKeys.exercises(param),
    queryFn: () => client.exercisePrograms.exercises(param) as Promise<any>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCreateExerciseProgram() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: ExerciseProgramCreateInput) =>
      client.exercisePrograms.create(input),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [routes.exercisePrograms.index],
      });
      toast.success('Exercise program created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });

  return { mutate, isPending };
}

export function useUpdateExerciseProgram() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: (input: ExerciseProgramUpdateInput) =>
      client.exercisePrograms.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.exercisePrograms.index],
      });
      toast.success('Exercise program updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
}

export function useSendExerciseProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => client.exercisePrograms.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.exercisePrograms.index],
      });
      toast.success('Exercise program sent to patient');
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
}
