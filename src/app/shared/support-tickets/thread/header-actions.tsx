'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiHandGrabbingBold, PiLockBold, PiXCircleBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
import SelectBox from '@/components/ui/select';
import {
  useAssignSupportTicket,
  useChangeSupportTicketStage,
  useClaimSupportTicket,
  useCloseSupportTicket,
  useDismissSupportCloseRequest,
  useSupportTicketsAgents,
} from '@/framework/support-tickets';
import type { SupportTicket } from '@/types/support-tickets';
import type { SupportTicketsPermissions } from '../permissions';
import { stageLabel } from '../utils';

interface Props {
  ticket: SupportTicket;
  access: SupportTicketsPermissions;
  currentUserId?: string | number | null;
}

const UNASSIGNED = '__none__';

export default function TicketHeaderActions({ ticket, access, currentUserId }: Props) {
  const { t } = useTranslation();
  const [closeOpen, setCloseOpen] = useState(false);
  const [note, setNote] = useState('');

  const isOpen = ticket.status === 'open';
  const assignedToMe =
    ticket.assignee && currentUserId != null && String(ticket.assignee.id) === String(currentUserId);

  const { data: agents = [] } = useSupportTicketsAgents(access.assign && isOpen);

  const claim = useClaimSupportTicket({ success: t('st_claimed'), error: t('st_action_error') });
  const assign = useAssignSupportTicket({ success: t('st_assigned'), error: t('st_action_error') });
  const stage = useChangeSupportTicketStage({ success: t('st_stage_updated'), error: t('st_action_error') });
  const close = useCloseSupportTicket({ success: t('st_closed_success'), error: t('st_action_error') });
  const dismiss = useDismissSupportCloseRequest({
    success: t('st_close_request_dismissed'),
    error: t('st_action_error'),
  });

  if (!isOpen) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
        <PiLockBold className="h-4 w-4" />
        {t('st_ticket_closed_readonly')}
      </span>
    );
  }

  const stageOptions = (['in_progress', 'resolved'] as const).map((value) => ({
    value,
    name: stageLabel(t, value),
  }));

  const agentOptions = [
    { value: UNASSIGNED, name: t('st_unassigned') },
    ...agents.map((agent) => ({
      value: String(agent.id),
      name: `${agent.name} (${agent.open_assigned_count})`,
    })),
  ];

  const handleClose = async () => {
    try {
      await close.mutateAsync({ id: ticket.id, note: note.trim() || undefined });
      setCloseOpen(false);
      setNote('');
    } catch {
      // toast handled in hook
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!assignedToMe && (
        <Button
          variant="outline"
          size="sm"
          isLoading={claim.isPending}
          onClick={() => claim.mutate(ticket.id)}
        >
          <PiHandGrabbingBold className="me-1 h-4 w-4" />
          {t('st_claim')}
        </Button>
      )}

      {access.assign && (
        <SelectBox
          className="w-56"
          size="sm"
          placeholder={t('st_assign_to')}
          options={agentOptions}
          disabled={assign.isPending}
          value={
            ticket.assignee
              ? `${t('st_assignee')}: ${ticket.assignee.name}`
              : `${t('st_assignee')}: ${t('st_unassigned')}`
          }
          onChange={(opt: any) => {
            const userId = opt?.value === UNASSIGNED ? null : Number(opt?.value);
            if ((ticket.assignee?.id ?? null) === userId) return;
            assign.mutate({ id: ticket.id, userId });
          }}
        />
      )}

      <SelectBox
        className="w-44"
        size="sm"
        options={stageOptions}
        disabled={stage.isPending}
        value={`${t('st_stage')}: ${stageLabel(t, ticket.stage)}`}
        onChange={(opt: any) => {
          if (!opt?.value || opt.value === ticket.stage) return;
          stage.mutate({ id: ticket.id, stage: opt.value });
        }}
      />

      {ticket.close_requested && (
        <Button
          variant="outline"
          size="sm"
          isLoading={dismiss.isPending}
          onClick={() => dismiss.mutate(ticket.id)}
        >
          <PiXCircleBold className="me-1 h-4 w-4" />
          {t('st_dismiss_close_request')}
        </Button>
      )}

      {access.close && (
        <Button size="sm" color="danger" onClick={() => setCloseOpen(true)}>
          <PiLockBold className="me-1 h-4 w-4" />
          {t('st_close_ticket')}
        </Button>
      )}

      <Modal isOpen={closeOpen} onClose={() => setCloseOpen(false)}>
        <div className="space-y-4 p-6">
          <Title as="h3" className="text-lg font-semibold">
            {t('st_close_ticket')}
          </Title>
          <Text className="text-sm text-gray-600">{t('st_close_confirm')}</Text>
          <Textarea
            label={t('st_close_note')}
            helperText={t('st_close_note_hint')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCloseOpen(false)}>
              {t('st_cancel')}
            </Button>
            <Button color="danger" isLoading={close.isPending} onClick={handleClose}>
              {t('st_close_ticket')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
