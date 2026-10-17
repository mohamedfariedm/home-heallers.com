'use client';

import { useTranslation } from 'react-i18next';
import { PiChecksBold, PiCheckBold, PiMapPinDuotone, PiTrashBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import type { SupportMessage } from '@/types/support-tickets';
import { formatDuration, formatTime, messageBody, parseLocation } from '../utils';

interface Props {
  message: SupportMessage;
  seen: boolean;
  canDelete: boolean;
  deleting?: boolean;
  onDelete?: (message: SupportMessage) => void;
}

function SystemLine({ message }: { message: SupportMessage }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="my-2 flex justify-center">
      <div className="max-w-[80%] rounded-lg bg-gray-100 px-4 py-2 text-center">
        <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {t(`st_system_${message.system_event ?? 'generic'}`)}
        </div>
        {message.body && (
          <div className="mt-0.5 whitespace-pre-wrap text-xs text-gray-700">
            {messageBody(message, i18n.language)}
          </div>
        )}
        <div className="mt-0.5 text-[10px] text-gray-400">
          {formatTime(message.created_at, i18n.language)}
        </div>
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: SupportMessage }) {
  const { t } = useTranslation();

  if (message.is_deleted) {
    return <span className="text-sm italic text-gray-500">{t('st_message_deleted')}</span>;
  }

  switch (message.type) {
    case 'image':
      return message.media_url ? (
        <a href={message.media_url} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed, expiring URLs */}
          <img
            src={message.media_url}
            alt={t('st_type_image')}
            className="max-h-72 max-w-full rounded-md object-contain"
            width={message.metadata?.width}
            height={message.metadata?.height}
          />
        </a>
      ) : (
        <span className="text-sm italic text-gray-500">{t('st_type_image')}</span>
      );
    case 'voice':
      return message.media_url ? (
        <div className="flex flex-col gap-1">
          <audio controls preload="none" src={message.media_url} className="h-10 max-w-[260px]" />
          {message.metadata?.duration_seconds ? (
            <span className="text-[11px] text-gray-500">
              {formatDuration(message.metadata.duration_seconds)}
            </span>
          ) : null}
        </div>
      ) : (
        <span className="text-sm italic text-gray-500">{t('st_type_voice')}</span>
      );
    case 'location': {
      const loc = parseLocation(message.body);
      if (!loc) return <span className="text-sm">{message.body}</span>;
      return (
        <a
          href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary underline"
        >
          <PiMapPinDuotone className="h-5 w-5" />
          <span dir="ltr">
            {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
          </span>
        </a>
      );
    }
    default:
      return (
        <p className="whitespace-pre-wrap break-words text-sm" dir="auto">
          {message.body}
        </p>
      );
  }
}

export default function MessageBubble({ message, seen, canDelete, deleting, onDelete }: Props) {
  const { t, i18n } = useTranslation();

  if (message.is_system) return <SystemLine message={message} />;

  const fromClient = message.sender_type === 'client';

  return (
    <div className={cn('group flex', fromClient ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'relative max-w-[75%] rounded-lg px-3 py-2 shadow-sm',
          fromClient ? 'bg-white text-gray-900' : 'bg-primary-lighter/60 text-gray-900',
          message.is_deleted && 'opacity-70'
        )}
      >
        <div className="mb-0.5 flex items-center gap-2 text-xs font-medium">
          <span className={fromClient ? 'text-gray-700' : 'text-primary-dark'}>
            {message.sender?.name ?? (fromClient ? t('st_client') : t('st_support'))}
          </span>
          {!fromClient && message.sender?.email && (
            <span className="font-normal text-gray-400">{message.sender.email}</span>
          )}
        </div>
        <MessageContent message={message} />
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-[11px] text-gray-500',
            !fromClient && 'justify-end'
          )}
        >
          <span title={message.created_at}>{formatTime(message.created_at, i18n.language)}</span>
          {!fromClient && !message.is_deleted && (
            <span
              className={cn(seen ? 'text-blue-600' : 'text-gray-400')}
              title={seen ? t('st_seen') : message.delivered_at ? t('st_delivered') : t('st_sent')}
            >
              {seen || message.delivered_at ? (
                <PiChecksBold className="h-3.5 w-3.5" />
              ) : (
                <PiCheckBold className="h-3.5 w-3.5" />
              )}
            </span>
          )}
          {fromClient && message.read_at && (
            <span className="text-blue-600" title={t('st_read_by_team')}>
              <PiChecksBold className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        {canDelete && !message.is_deleted && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete?.(message)}
            className="absolute -top-2 end-[-8px] hidden rounded-full bg-white p-1 text-red-600 shadow group-hover:block disabled:opacity-50"
            title={t('st_delete_message')}
          >
            <PiTrashBold className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
