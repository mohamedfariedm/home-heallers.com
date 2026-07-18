import { z } from 'zod';
import type { NotificationRecipientRef } from '@/types/admin-notifications';

export function parseExtraDataJson(raw?: string): Record<string, string> | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Extra data must be valid JSON');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Extra data must be a JSON object');
  }

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
      key,
      String(value),
    ])
  );
}

const recipientRefSchema = z.object({
  type: z.enum(['client', 'doctor']),
  id: z.coerce.number().positive(),
});

export const notificationContentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Max 255 characters'),
  body: z.string().trim().min(1, 'Body is required').max(1000, 'Max 1000 characters'),
  type: z.preprocess(
    (value) => (value == null ? '' : String(value)),
    z.string().trim().max(255)
  ),
  lang: z.preprocess(
    (value) => (value === 'ar' || value === 'en' ? value : 'en'),
    z.enum(['ar', 'en'])
  ),
  deep_link: z.preprocess(
    (value) => (value == null ? '' : String(value)),
    z.string().trim().max(255)
  ),
  url: z.preprocess(
    (value) => (value == null ? '' : String(value).trim()),
    z
      .string()
      .refine(
        (value) =>
          !value ||
          /^https?:\/\/.+/i.test(value) ||
          /^\/?[a-z0-9_-]+\/.+/i.test(value),
        {
          message:
            'Enter a valid URL (https://…) or app path (e.g. /offers/12)',
        }
      )
  ),
  extra_data_json: z.preprocess(
    (value) => (value == null ? '' : String(value)),
    z
      .string()
      .superRefine((value, ctx) => {
        if (!value?.trim()) return;
        try {
          parseExtraDataJson(value);
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error instanceof Error ? error.message : 'Invalid JSON',
          });
        }
      })
  ),
});

export const sendNotificationSchema = notificationContentSchema
  .extend({
    audience: z.enum(['all', 'clients', 'doctors', 'specific']),
    recipients: z.array(recipientRefSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.audience === 'specific' && (!data.recipients || data.recipients.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one client or doctor',
        path: ['recipients'],
      });
    }
  });

export function createScheduledNotificationSchema(options?: {
  requireFuture?: boolean;
}) {
  const requireFuture = options?.requireFuture ?? true;

  return notificationContentSchema
    .extend({
      recipient_type: z.enum(['all', 'clients', 'doctors', 'specific']),
      // Keep loose here — strict shape is checked only when audience is specific.
      recipients: z
        .array(
          z.object({
            type: z.string(),
            id: z.coerce.number(),
          })
        )
        .optional()
        .default([]),
      scheduled_at: z.string().trim().min(1, 'Scheduled date is required'),
    })
    .superRefine((data, ctx) => {
      if (data.recipient_type === 'specific') {
        const validRecipients = (data.recipients ?? []).filter(
          (item) =>
            (item.type === 'client' || item.type === 'doctor') && item.id > 0
        );
        if (validRecipients.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Select at least one client or doctor',
            path: ['recipients'],
          });
        }
      }

      const scheduledAt = new Date(data.scheduled_at);
      if (Number.isNaN(scheduledAt.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date',
          path: ['scheduled_at'],
        });
        return;
      }

      if (requireFuture && scheduledAt.getTime() <= Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Scheduled time must be in the future',
          path: ['scheduled_at'],
        });
      }
    });
}

export const scheduledNotificationSchema = createScheduledNotificationSchema({
  requireFuture: true,
});

export type NotificationContentInput = z.infer<typeof notificationContentSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type ScheduledNotificationInput = z.infer<typeof scheduledNotificationSchema>;

export function buildNotificationPayload(
  data: NotificationContentInput & {
    recipients?: NotificationRecipientRef[];
    recipient_id?: number;
  }
) {
  const extra_data = parseExtraDataJson(data.extra_data_json);
  const recipients = data.recipients?.filter((item) => item.id > 0) ?? [];

  return {
    title: data.title.trim(),
    body: data.body.trim(),
    lang: data.lang,
    ...(data.type?.trim() ? { type: data.type.trim() } : {}),
    ...(data.deep_link?.trim() ? { deep_link: data.deep_link.trim() } : {}),
    ...(data.url?.trim() ? { url: data.url.trim() } : {}),
    ...(extra_data ? { extra_data } : {}),
    ...(recipients.length > 0 ? { recipients } : {}),
    ...(recipients.length === 0 && data.recipient_id
      ? { recipient_id: data.recipient_id }
      : {}),
  };
}

// Legacy export kept for any remaining imports
export const NotificationFormSchema = sendNotificationSchema;
export type NotificationFormInput = SendNotificationInput;
