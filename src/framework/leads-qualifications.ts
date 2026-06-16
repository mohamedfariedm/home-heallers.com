import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import {
  LeadsQualification,
  LeadsQualificationFieldKey,
} from '@/app/shared/customer-suport/leads-qualification-constants';
import { extractQualificationRecord } from '@/app/shared/customer-suport/leads-qualification-utils';

export function useLeadsQualificationByCustomerSupport(
  customerSupportId?: number,
  enabled = true
) {
  return useQuery<LeadsQualification | null, Error>({
    queryKey: [routes.leadsQualifications.index, 'by-customer-support', customerSupportId],
    enabled: enabled && !!customerSupportId,
    queryFn: async () => {
      try {
        const response = await client.leadsQualifications.getByCustomerSupport(
          customerSupportId!
        );
        return extractQualificationRecord(
          response as { data?: LeadsQualification[] }
        );
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
}

type SaveLeadsQualificationInput = {
  customer_support_id: number;
  id?: number;
} & Partial<Record<LeadsQualificationFieldKey, 'yes' | 'no'>>;

export function useSaveLeadsQualification(options?: {
  closeOnSuccess?: boolean;
  onSuccess?: (record: LeadsQualification | null) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveLeadsQualificationInput) => {
      const { id, customer_support_id, ...answers } = input;

      if (id) {
        const response = await client.leadsQualifications.update({
          id,
          ...answers,
        });
        return extractQualificationRecord(
          response as { data?: LeadsQualification[] } | LeadsQualification
        );
      }

      const response = await client.leadsQualifications.create({
        customer_support_id,
        ...answers,
      });
      const created = extractQualificationRecord(
        (response as { data?: { data?: LeadsQualification[] } })?.data ??
          (response as { data?: LeadsQualification[] })
      );
      return created;
    },
    onSuccess: (record, variables) => {
      queryClient.invalidateQueries({
        queryKey: [routes.leadsQualifications.index],
      });
      queryClient.invalidateQueries({
        queryKey: [
          routes.leadsQualifications.index,
          'by-customer-support',
          variables.customer_support_id,
        ],
      });
      queryClient.invalidateQueries({ queryKey: [routes.customerSupport.index] });
      toast.success('Lead qualification saved successfully');
      options?.onSuccess?.(record);
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to save lead qualification');
    },
  });
}
