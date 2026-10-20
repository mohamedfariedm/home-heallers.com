'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import {
  PiIdentificationCard,
  PiGlobeHemisphereEast,
  PiReceipt,
  PiWarningCircle,
  PiXBold,
} from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import { Text, Title } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { usePermissions } from '@/context/PermissionsContext';
import { useNationality } from '@/framework/nationality';
import { usePatient, useUpdateClientFields } from '@/framework/patients';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import { isSaudiNationalityRecord } from '@/utils/is-saudi-nationality';
import {
  canEditClient,
  collectFixFields,
  detectNationalityHint,
  getZatcaErrorMessage,
  nationalityHintText,
  normalizeNationalId,
  parseZatcaValidationError,
  validateNationalId,
} from '@/app/shared/zatca/zatca-fix-error';
import ZatcaInvoiceEditor from '@/app/shared/zatca/zatca-invoice-editor';
import type { ZatcaFixErrorPayload } from '@/types/zatca';

type ClientRecord = {
  id?: number;
  name?: unknown;
  national_id?: string | null;
  nationality?: { id?: number; name?: unknown } | null;
  nationality_id?: number | string | null;
};

function unwrapClient(data: unknown): ClientRecord | null {
  if (!data || typeof data !== 'object') return null;
  const payload = data as { data?: unknown };
  const inner = payload.data ?? data;
  if (Array.isArray(inner)) {
    return (inner[0] as ClientRecord) ?? null;
  }
  return inner as ClientRecord;
}

function clientDisplayName(client: ClientRecord | null): string {
  if (!client?.name) return '—';
  if (typeof client.name === 'string') return client.name;
  return (
    resolveLocalizedName(client.name, 'ar') ||
    resolveLocalizedName(client.name, 'en') ||
    '—'
  );
}

function errorIcon(fixField: string | null | undefined) {
  if (fixField === 'client.nationality') {
    return <PiGlobeHemisphereEast className="h-5 w-5 shrink-0 text-amber-600" />;
  }
  if (fixField === 'client.national_id') {
    return <PiIdentificationCard className="h-5 w-5 shrink-0 text-amber-600" />;
  }
  if (typeof fixField === 'string' && fixField.startsWith('invoice.')) {
    return <PiReceipt className="h-5 w-5 shrink-0 text-amber-600" />;
  }
  return <PiWarningCircle className="h-5 w-5 shrink-0 text-amber-600" />;
}

export function presentZatcaValidationError(
  err: unknown,
  openModal: (args: { view: ReactNode; customSize?: string }) => void,
  options: {
    invoiceNumber?: string;
    onRetry: () => Promise<unknown>;
    fallbackInvoiceId?: number | string;
  }
): boolean {
  const parsed = parseZatcaValidationError(err);
  if (!parsed) return false;
  const payload: ZatcaFixErrorPayload = {
    ...parsed,
    data: {
      invoice_id: parsed.data?.invoice_id ?? options.fallbackInvoiceId ?? null,
      client_id: parsed.data?.client_id ?? null,
      fix_fields: parsed.data?.fix_fields ?? parsed.errors.map((item) => item.fix_field),
    },
  };
  openModal({
    customSize: '560px',
    view: (
      <ZatcaFixPopup
        payload={payload}
        invoiceNumber={options.invoiceNumber}
        onRetry={options.onRetry}
      />
    ),
  });
  return true;
}

export default function ZatcaFixPopup({
  payload: initialPayload,
  invoiceNumber: invoiceNumberProp,
  onRetry,
  awaitingReissue: awaitingReissueProp = false,
}: {
  payload: ZatcaFixErrorPayload;
  invoiceNumber?: string;
  onRetry: () => Promise<unknown>;
  awaitingReissue?: boolean;
}) {
  const { closeModal, openModal } = useModal();
  const { permissions } = usePermissions();
  const { data: session } = useSession();
  const effectivePermissions =
    (session?.user as { permissions?: string[] } | undefined)?.permissions ??
    permissions;
  const allowClientEdit = canEditClient(effectivePermissions);

  const [payload, setPayload] = useState(initialPayload);
  const [awaitingReissue, setAwaitingReissue] = useState(awaitingReissueProp);
  const [nationalityId, setNationalityId] = useState<number | ''>('');
  const [nationalId, setNationalId] = useState('');
  const [nationalIdError, setNationalIdError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const nationalityFieldRef = useRef<HTMLDivElement>(null);

  const invoiceId = payload.data?.invoice_id ?? null;
  const clientId = payload.data?.client_id ?? null;
  const fixFields = collectFixFields(payload);
  const nationalityHint = detectNationalityHint(payload);
  const hintText = nationalityHintText(nationalityHint);

  const needsNationality =
    fixFields.some((field) => field === 'client.nationality') ||
    nationalityHint != null;
  const needsNationalId = fixFields.some((field) => field === 'client.national_id');
  const needsClientForm = Boolean(clientId) && (needsNationality || needsNationalId);
  const needsInvoiceEdit = fixFields.some((field) => field.startsWith('invoice.'));
  const missingClient = clientId == null || clientId === '';

  const invoiceNumber =
    invoiceNumberProp || (invoiceId != null ? String(invoiceId) : '');

  const { data: clientRes, isLoading: clientLoading } = usePatient(
    clientId ?? '',
    Boolean(clientId) && allowClientEdit && needsClientForm
  );
  const client = unwrapClient(clientRes);
  const { data: nationalitiesRes, isLoading: nationalitiesLoading } = useNationality(
    ''
  );
  const { mutateAsync: updateClient } = useUpdateClientFields();

  const nationalityOptions: SelectOption[] = useMemo(() => {
    const list = (nationalitiesRes as { data?: Array<{ id: number; name?: unknown }> } | undefined)
      ?.data;
    if (!Array.isArray(list)) return [];
    return list.map((item) => ({
      value: item.id,
      name: resolveLocalizedName(item.name, 'ar') || resolveLocalizedName(item.name, 'en') || String(item.id),
      label: resolveLocalizedName(item.name, 'ar') || resolveLocalizedName(item.name, 'en') || String(item.id),
      nationality: item,
    }));
  }, [nationalitiesRes]);

  const selectedNationalityOption = nationalityOptions.find(
    (option) => Number(option.value) === Number(nationalityId)
  );

  const isSaudi = useMemo(() => {
    const selected = selectedNationalityOption?.nationality as
      | { id?: number; name?: unknown }
      | undefined;
    if (selected) return isSaudiNationalityRecord(selected);
    if (client?.nationality) return isSaudiNationalityRecord(client.nationality);
    return null;
  }, [selectedNationalityOption, client?.nationality]);

  useEffect(() => {
    setPayload(initialPayload);
    setAwaitingReissue(awaitingReissueProp);
  }, [initialPayload, awaitingReissueProp]);

  useEffect(() => {
    if (!allowClientEdit || !needsNationality || !hintText) return;
    const button = nationalityFieldRef.current?.querySelector('button');
    button?.focus();
  }, [allowClientEdit, needsNationality, hintText, client]);

  useEffect(() => {
    if (!client) return;
    if (needsNationality) {
      const currentId = client.nationality?.id ?? client.nationality_id;
      setNationalityId(currentId != null && currentId !== '' ? Number(currentId) : '');
    }
    if (needsNationalId) {
      setNationalId(client.national_id ? String(client.national_id) : '');
    }
  }, [client, needsNationality, needsNationalId]);

  const originalNationalityId = client?.nationality?.id ?? client?.nationality_id ?? '';
  const originalNationalId = client?.national_id ? String(client.national_id) : '';

  const buildChangedFields = (): {
    nationality_id?: number;
    national_id?: string;
  } | null => {
    if (!clientId || !allowClientEdit || !needsClientForm) return {};
    if (needsNationalId) {
      const idError = validateNationalId(nationalId, isSaudi);
      setNationalIdError(idError);
      if (idError) return null;
    }
    if (needsNationality && nationalityId === '') {
      return null;
    }
    const changed: { nationality_id?: number; national_id?: string } = {};
    if (needsNationality && Number(nationalityId) !== Number(originalNationalityId)) {
      changed.nationality_id = Number(nationalityId);
    }
    if (needsNationalId) {
      const normalized = normalizeNationalId(nationalId);
      if (normalized !== normalizeNationalId(originalNationalId)) {
        changed.national_id = normalized;
      }
    }
    return changed;
  };

  const saveClientChanges = async (): Promise<boolean> => {
    const changed = buildChangedFields();
    if (changed == null) return false;
    if (!clientId || Object.keys(changed).length === 0) return true;
    await updateClient({ id: clientId, ...changed });
    return true;
  };

  const handleSaveOnly = async () => {
    setSaving(true);
    try {
      const ok = await saveClientChanges();
      if (!ok) return;
      toast.success('تم حفظ بيانات العميل');
    } catch {
      return;
    } finally {
      setSaving(false);
    }
  };

  const reopenPopup = (nextAwaitingReissue: boolean) => {
    window.setTimeout(() => {
      openModal({
        customSize: '560px',
        view: (
          <ZatcaFixPopup
            payload={payload}
            invoiceNumber={invoiceNumber}
            onRetry={onRetry}
            awaitingReissue={nextAwaitingReissue}
          />
        ),
      });
    }, 0);
  };

  const handleEditInvoice = () => {
    if (invoiceId == null) return;
    openModal({
      customSize: '750px',
      view: (
        <ZatcaInvoiceEditor
          invoiceId={invoiceId}
          onSaved={() => reopenPopup(true)}
          onCancel={() => reopenPopup(awaitingReissue)}
        />
      ),
    });
  };

  const handleSaveAndIssue = async () => {
    if (needsClientForm && allowClientEdit) {
      setSaving(true);
      try {
        const ok = await saveClientChanges();
        if (!ok) return;
      } catch {
        return;
      } finally {
        setSaving(false);
      }
    }
    setIssuing(true);
    try {
      await onRetry();
      closeModal();
    } catch (err) {
      const next = parseZatcaValidationError(err);
      if (next) {
        setPayload({
          ...next,
          data: {
            invoice_id: next.data?.invoice_id ?? invoiceId,
            client_id: next.data?.client_id ?? clientId,
            fix_fields: next.data?.fix_fields ?? next.errors.map((item) => item.fix_field),
          },
        });
        setAwaitingReissue(false);
      } else {
        toast.error(getZatcaErrorMessage(err));
      }
    } finally {
      setIssuing(false);
    }
  };

  const showSaveButtons = allowClientEdit && needsClientForm && !missingClient;
  const showRetryWithoutSave =
    !awaitingReissue && !missingClient && allowClientEdit && !needsClientForm;
  const busy = saving || issuing;
  const nationalityMissing = needsNationality && allowClientEdit && nationalityId === '';

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <Title as="h4" className="text-base font-semibold text-gray-900">
            لا يمكن إصدار الفاتورة — يلزم تصحيح البيانات التالية
          </Title>
          {invoiceNumber ? (
            <Text className="mt-1 text-sm text-gray-500">
              رقم الفاتورة: {invoiceNumber}
            </Text>
          ) : null}
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal} aria-label="إغلاق">
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <ul className="mb-5 space-y-2">
        {payload.errors.map((item, index) => (
          <li
            key={`${item.code}-${index}`}
            className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"
          >
            {errorIcon(typeof item.fix_field === 'string' ? item.fix_field : null)}
            <span>{item.message}</span>
          </li>
        ))}
      </ul>

      {missingClient ? (
        <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          لا يوجد عميل مرتبط بهذه الفاتورة. اربط عميلاً من تعديل الفاتورة ثم حاول الإصدار مرة أخرى.
        </div>
      ) : null}

      {!allowClientEdit && needsClientForm ? (
        <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          اطلب من المسؤول تعديل بيانات العميل
        </div>
      ) : null}

      {hintText ? (
        <div className="mb-5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2.5 text-sm font-medium text-sky-950">
          {hintText}
        </div>
      ) : null}

      {allowClientEdit && needsClientForm ? (
        <div className="mb-5 space-y-4 rounded-lg border border-gray-200 p-4">
          {clientLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div>
                <Text className="mb-1 text-xs text-gray-500">اسم العميل</Text>
                <Text className="font-medium text-gray-900">{clientDisplayName(client)}</Text>
              </div>
              {needsNationality ? (
                <div ref={nationalityFieldRef} id="zatca-nationality-field">
                <SelectBox
                  label="الجنسية"
                  placeholder="اختر الجنسية"
                  options={nationalityOptions}
                  value={selectedNationalityOption ?? null}
                  onChange={(option: SelectOption | number | string | null) => {
                    if (option == null || option === '') {
                      setNationalityId('');
                      return;
                    }
                    const raw =
                      typeof option === 'object' && option.value != null
                        ? option.value
                        : option;
                    const nextId = Number(raw);
                    setNationalityId(Number.isFinite(nextId) ? nextId : '');
                  }}
                  disabled={nationalitiesLoading || busy}
                  error={nationalityMissing ? 'الجنسية مطلوبة' : undefined}
                />
                </div>
              ) : null}
              {needsNationalId ? (
                <Input
                  label="رقم الهوية / الإقامة"
                  value={nationalId}
                  dir="ltr"
                  className="text-left"
                  onChange={(event) => {
                    setNationalId(event.target.value);
                    setNationalIdError(null);
                  }}
                  onBlur={() => {
                    if (nationalId) {
                      setNationalIdError(validateNationalId(nationalId, isSaudi));
                    }
                  }}
                  error={nationalIdError ?? undefined}
                  disabled={busy}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {(needsInvoiceEdit || missingClient) && invoiceId != null ? (
        <div className="mb-5">
          <Button variant="outline" className="w-full" onClick={handleEditInvoice} disabled={busy}>
            تعديل الفاتورة
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-start gap-2">
        {awaitingReissue ? (
          <Button isLoading={issuing} disabled={busy} onClick={handleSaveAndIssue}>
            إعادة الإصدار
          </Button>
        ) : null}
        {showSaveButtons ? (
          <>
            {!awaitingReissue ? (
            <Button isLoading={issuing} disabled={busy} onClick={handleSaveAndIssue}>
              حفظ وإصدار
            </Button>
            ) : null}
            <Button
              variant="outline"
              isLoading={saving && !issuing}
              disabled={busy}
              onClick={handleSaveOnly}
            >
              حفظ فقط
            </Button>
          </>
        ) : null}
        {showRetryWithoutSave ? (
          <Button isLoading={issuing} disabled={busy} onClick={handleSaveAndIssue}>
            حفظ وإصدار
          </Button>
        ) : null}
        <Button variant="outline" disabled={busy} onClick={closeModal}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
