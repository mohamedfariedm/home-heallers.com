import { z } from 'zod';

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

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
    message: 'Enter a valid URL starting with http:// or https://',
  });

export const notificationContentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Max 255 characters'),
  body: z.string().trim().min(1, 'Body is required').max(1000, 'Max 1000 characters'),
  type: z.string().trim().max(255).optional().or(z.literal('')),
  lang: z.enum(['ar', 'en']).default('en'),
  deep_link: z.string().trim().max(255).optional().or(z.literal('')),
  url: optionalUrl,
  extra_data_json: z
    .string()
    .optional()
    .or(z.literal(''))
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
    }),
});

export const sendNotificationSchema = notificationContentSchema.extend({
  audience: z.enum(['all', 'clients', 'doctors', 'specific']),
  recipient_kind: z.enum(['client', 'doctor']).optional(),
  recipient_id: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
  if (data.audience === 'specific') {
    if (!data.recipient_id || data.recipient_id <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a recipient',
        path: ['recipient_id'],
      });
    }
  }
});

export const scheduledNotificationSchema = notificationContentSchema.extend({
  recipient_type: z.enum(['all', 'clients', 'doctors', 'specific']),
  recipient_kind: z.enum(['client', 'doctor']).optional(),
  recipient_id: z.coerce.number().optional(),
  scheduled_at: z.string().trim().min(1, 'Scheduled date is required'),
}).superRefine((data, ctx) => {
  if (data.recipient_type === 'specific') {
    if (!data.recipient_id || data.recipient_id <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a recipient',
        path: ['recipient_id'],
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

  if (scheduledAt.getTime() <= Date.now()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Scheduled time must be in the future',
      path: ['scheduled_at'],
    });
  }
});

export type NotificationContentInput = z.infer<typeof notificationContentSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type ScheduledNotificationInput = z.infer<typeof scheduledNotificationSchema>;

export function buildNotificationPayload(
  data: NotificationContentInput & {
    recipient_id?: number;
  }
) {
  const extra_data = parseExtraDataJson(data.extra_data_json);

  return {
    title: data.title.trim(),
    body: data.body.trim(),
    lang: data.lang,
    ...(data.type?.trim() ? { type: data.type.trim() } : {}),
    ...(data.deep_link?.trim() ? { deep_link: data.deep_link.trim() } : {}),
    ...(data.url?.trim() ? { url: data.url.trim() } : {}),
    ...(extra_data ? { extra_data } : {}),
    ...(data.recipient_id ? { recipient_id: data.recipient_id } : {}),
  };
}

// Legacy export kept for any remaining imports
export const NotificationFormSchema = sendNotificationSchema;
export type NotificationFormInput = SendNotificationInput;
