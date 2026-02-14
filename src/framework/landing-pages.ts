import { routes } from '@/config/routes';
import client from '@/framework/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LandingPage, LandingPageSection } from '@/types/settings';

export function useLandingPages() {
  return useQuery<any, Error>({
    queryKey: ['landing-pages'],
    queryFn: () => client.LandingPages.all(),
  });
}

export function useLandingPage(id: number) {
  return useQuery<any, Error>({
    queryKey: ['landing-page', id],
    queryFn: () => client.LandingPages.findOne(id),
    enabled: !!id,
  });
}

export const useCreateLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LandingPage) => client.LandingPages.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast.success('Landing page created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.message || 'Failed to create landing page'}`);
    },
  });
};

export const useUpdateLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LandingPage }) => 
      client.LandingPages.update({ id, data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page', variables.id] });
      toast.success('Landing page updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.message || 'Failed to update landing page'}`);
    },
  });
};

export const useDeleteLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => client.LandingPages.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast.success('Landing page deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.message || 'Failed to delete landing page'}`);
    },
  });
};

export const useUpdateLandingPageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, sectionId, data }: { pageId: number; sectionId: number; data: LandingPageSection }) => 
      client.LandingPages.updateSection({ pageId, sectionId, data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page', variables.pageId] });
      toast.success('Section updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.message || 'Failed to update section'}`);
    },
  });
};

export const useCreateLandingPageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: number; data: LandingPageSection }) => 
      client.LandingPages.createSection({ pageId, data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page', variables.pageId] });
      toast.success('Section created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.message || 'Failed to create section'}`);
    },
  });
};

export const useDeleteLandingPageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, sectionId }: { pageId: number; sectionId: number }) => 
      client.LandingPages.deleteSection({ pageId, sectionId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page', variables.pageId] });
      toast.success('Section deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.message || 'Failed to delete section'}`);
    },
  });
};
