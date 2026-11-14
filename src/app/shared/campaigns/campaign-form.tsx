'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import { useCreateCampaign, useUpdateCampaign } from '@/framework/campaigns';
import {
  CAMPAIGN_PLATFORMS,
  CAMPAIGN_STATUSES,
  type Campaign,
  type CampaignPayload,
  type CampaignPlatform,
  type CampaignStatus,
} from '@/types/campaigns';
import { normalizeSourceKey } from './source-key';

type FieldErrors = Record<string, string>;

const selectCls =
  'h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 text-sm text-gray-900 outline-none ring-[#143087]/20 focus:ring-2';

const SERVER_MESSAGE_KEYS: Array<[string, string]> = [
  ['already used', 'campaigns_source_taken'],
  ['future attribution', 'campaigns_source_server_confirm'],
  ['end date must be on or after', 'campaigns_date_order'],
  ['budget must be zero or greater', 'campaigns_budget_invalid'],
  ['source key is required', 'campaigns_required'],
];

function localizeServerMessage(
  message: string,
  t: (key: string) => string
): string {
  const found = SERVER_MESSAGE_KEYS.find(([snippet]) =>
    message.toLowerCase().includes(snippet)
  );
  return found ? t(found[1]) : message;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export default function CampaignForm({
  initialValues,
}: {
  initialValues?: Campaign;
}) {
  const { t } = useTranslation('campaigns');
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);

  const [name, setName] = useState(initialValues?.name ?? '');
  const [source, setSource] = useState(initialValues?.source_campaign ?? '');
  const [platform, setPlatform] = useState(initialValues?.platform ?? '');
  const [startDate, setStartDate] = useState(initialValues?.start_date ?? '');
  const [endDate, setEndDate] = useState(initialValues?.end_date ?? '');
  const [budget, setBudget] = useState(
    initialValues?.budget !== null && initialValues?.budget !== undefined
      ? String(initialValues.budget)
      : ''
  );
  const [status, setStatus] = useState<CampaignStatus>(
    initialValues?.status ?? 'draft'
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [confirmSource, setConfirmSource] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const isSaving = create.isPending || update.isPending;

  const originalSource = initialValues?.source_campaign ?? '';
  const sourceChanged =
    isEdit &&
    normalizeSourceKey(source) !== '' &&
    normalizeSourceKey(source) !== normalizeSourceKey(originalSource);

  const dirty = useMemo(() => {
    const initial = {
      name: initialValues?.name ?? '',
      source: initialValues?.source_campaign ?? '',
      platform: initialValues?.platform ?? '',
      startDate: initialValues?.start_date ?? '',
      endDate: initialValues?.end_date ?? '',
      budget:
        initialValues?.budget !== null && initialValues?.budget !== undefined
          ? String(initialValues.budget)
          : '',
      status: initialValues?.status ?? 'draft',
      description: initialValues?.description ?? '',
    };
    const current = {
      name,
      source,
      platform,
      startDate,
      endDate,
      budget,
      status,
      description,
    };
    return JSON.stringify(initial) !== JSON.stringify(current);
  }, [
    budget,
    description,
    endDate,
    initialValues,
    name,
    platform,
    source,
    startDate,
    status,
  ]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  useEffect(() => {
    if (!sourceChanged) setConfirmSource(false);
  }, [sourceChanged]);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const leave = () => {
    if (dirty && !window.confirm(t('campaigns_discard_confirm'))) return;
    router.push(routes.campaigns.index);
  };

  const validate = (): FieldErrors => {
    const found: FieldErrors = {};
    const required = t('campaigns_required');

    if (!name.trim()) found.name = required;
    else if (name.trim().length > 255) found.name = t('campaigns_name_too_long');

    if (!normalizeSourceKey(source)) found.source_campaign = required;
    else if (normalizeSourceKey(source).length > 255)
      found.source_campaign = t('campaigns_source_too_long');

    if (startDate && endDate && endDate < startDate) {
      found.end_date = t('campaigns_date_order');
    }

    const budgetValue = budget.trim().replace(',', '.');
    if (budgetValue !== '') {
      if (!/^\d+(\.\d{1,2})?$/.test(budgetValue)) {
        found.budget = t('campaigns_budget_invalid');
      } else {
        const amount = Number(budgetValue);
        if (amount < 0 || amount > 9999999999.99) {
          found.budget = t('campaigns_budget_invalid');
        }
      }
    }

    if (description.trim().length > 5000) {
      found.description = t('campaigns_description_too_long');
    }

    if (sourceChanged && !confirmSource) {
      found.source_campaign = t('campaigns_source_confirm_required');
    }

    return found;
  };

  const applyServerErrors = (err: any) => {
    const serverErrors = err?.response?.data?.errors;
    if (!serverErrors || typeof serverErrors !== 'object') return;
    const mapped: FieldErrors = {};
    Object.entries<any>(serverErrors).forEach(([field, msgs]) => {
      const first = Array.isArray(msgs) ? msgs[0] : msgs;
      if (!first) return;
      mapped[field] = localizeServerMessage(String(first), t);
    });
    setErrors(mapped);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error(t('campaigns_form_errors'));
      return;
    }

    const payload: CampaignPayload = {
      name: name.trim(),
      source_campaign: normalizeSourceKey(source),
      platform: platform ? (platform as CampaignPlatform) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      budget:
        budget.trim() === '' ? null : Number(budget.trim().replace(',', '.')),
      status,
      description: description.trim() === '' ? null : description.trim(),
    };

    if (sourceChanged) payload.confirm_source_campaign_change = true;

    try {
      if (isEdit && initialValues?.id) {
        await update.mutateAsync({ id: initialValues.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      router.push(routes.campaigns.index);
    } catch (err) {
      applyServerErrors(err);
    }
  };

  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className={labelCls}>
          {t('campaigns_field_name')} <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError('name');
          }}
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <label className={labelCls}>
          {t('campaigns_field_source')} <span className="text-red-500">*</span>
        </label>
        <Input
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            clearError('source_campaign');
          }}
          className="font-mono"
        />
        <Text className="mt-1 text-xs text-gray-500">
          {t('campaigns_source_hint')}
        </Text>
        <FieldError message={errors.source_campaign} />
        {sourceChanged && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p>{t('campaigns_source_warning')}</p>
            <label className="mt-2 flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={confirmSource}
                onChange={(e) => {
                  setConfirmSource(e.target.checked);
                  clearError('source_campaign');
                }}
              />
              <span>{t('campaigns_source_confirm_label')}</span>
            </label>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t('campaigns_field_platform')}</label>
          <select
            className={selectCls}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="">{t('campaigns_platform_none')}</option>
            {CAMPAIGN_PLATFORMS.map((item) => (
              <option key={item} value={item}>
                {t(`campaigns_platform_${item}`)}
              </option>
            ))}
          </select>
          <FieldError message={errors.platform} />
        </div>
        <div>
          <label className={labelCls}>
            {t('campaigns_field_status')} <span className="text-red-500">*</span>
          </label>
          <select
            className={selectCls}
            value={status}
            onChange={(e) => setStatus(e.target.value as CampaignStatus)}
          >
            {CAMPAIGN_STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`campaigns_status_${item}`)}
              </option>
            ))}
          </select>
          <Text className="mt-1 text-xs text-gray-500">
            {t('campaigns_status_hint')}
          </Text>
          <FieldError message={errors.status} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t('campaigns_field_start')}</label>
          <input
            type="date"
            className={selectCls}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              clearError('end_date');
            }}
          />
        </div>
        <div>
          <label className={labelCls}>{t('campaigns_field_end')}</label>
          <input
            type="date"
            className={selectCls}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              clearError('end_date');
            }}
          />
          <FieldError message={errors.end_date} />
        </div>
      </div>

      <div>
        <label className={labelCls}>{t('campaigns_field_budget')}</label>
        <Input
          inputMode="decimal"
          value={budget}
          onChange={(e) => {
            setBudget(e.target.value);
            clearError('budget');
          }}
          placeholder="0.00"
        />
        <Text className="mt-1 text-xs text-gray-500">
          {t('campaigns_budget_hint')}
        </Text>
        <FieldError message={errors.budget} />
      </div>

      <div>
        <label className={labelCls}>{t('campaigns_field_description')}</label>
        <Textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError('description');
          }}
          rows={4}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={leave}>
          {t('campaigns_cancel')}
        </Button>
        <Button type="submit" isLoading={isSaving} disabled={isSaving}>
          {isEdit ? t('campaigns_save') : t('campaigns_create_btn')}
        </Button>
      </div>
    </form>
  );
}
