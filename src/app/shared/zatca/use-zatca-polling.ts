'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import {
  isActiveZatcaStatus,
  isTerminalZatcaStatus,
  type ZatcaInvoice,
  type ZatcaStatus,
} from '@/types/zatca';
import { zatcaKeys } from '@/framework/zatca';

type PollingOptions = {
  enabled?: boolean;
  interval?: number;
  timeout?: number;
  onTerminal?: (invoice: ZatcaInvoice) => void;
};

export function useZatcaPolling(
  invoiceId: number | string,
  currentStatus: ZatcaStatus,
  options: PollingOptions = {}
) {
  const {
    enabled = isActiveZatcaStatus(currentStatus),
    interval = 2000,
    timeout = 60000,
    onTerminal,
  } = options;

  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(enabled);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !invoiceId) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    startedAt.current = Date.now();

    const timer = setInterval(async () => {
      if (startedAt.current && Date.now() - startedAt.current > timeout) {
        setIsPolling(false);
        clearInterval(timer);
        return;
      }

      try {
        const res = (await client.zatca.get(invoiceId)) as { data: ZatcaInvoice };
        const invoice = res.data;
        queryClient.setQueryData(zatcaKeys.detail(invoiceId), res);

        if (isTerminalZatcaStatus(invoice.zatca_status)) {
          setIsPolling(false);
          clearInterval(timer);
          onTerminal?.(invoice);
        }
      } catch {
        // keep polling until timeout
      }
    }, interval);

    return () => {
      clearInterval(timer);
      setIsPolling(false);
    };
  }, [invoiceId, enabled, interval, timeout, onTerminal, queryClient]);

  return { isPolling };
}
