'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import DeletePopover from '@/app/shared/delete-popover';
import LocaleTabs from '@/app/shared/offers/locale-tabs';
import RestrictedQuill from '@/app/shared/offers/restricted-quill';
import {
  useCreatePackageFaq,
  useDeletePackageFaq,
  usePackageFaqs,
  useUpdatePackageFaq,
} from '@/framework/packages';
import type { OfferLocale } from '@/types/offer';
import { asTranslationMap, offerDisplayName } from '@/app/shared/offers/utils';
import toast from 'react-hot-toast';
import { PiPlusBold, PiPencilSimple, PiArrowUp, PiArrowDown } from 'react-icons/pi';
import { Drawer } from '@/components/ui/drawer';

type FaqDraft = {
  id?: number;
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
  sort_order: number;
  is_active: boolean;
};

function emptyDraft(sortOrder = 0): FaqDraft {
  return {
    question: { en: '', ar: '' },
    answer: { en: '', ar: '' },
    sort_order: sortOrder,
    is_active: true,
  };
}

export default function FaqTab({
  packageId,
  disabled,
}: {
  packageId?: number | string;
  disabled?: boolean;
}) {
  const [locale, setLocale] = useState<OfferLocale>('en');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<FaqDraft>(emptyDraft());
  const { data, isLoading, refetch } = usePackageFaqs(packageId, Boolean(packageId) && !disabled);
  const { mutateAsync: createFaq, isPending: creating } = useCreatePackageFaq(packageId || 0);
  const { mutateAsync: updateFaq, isPending: updating } = useUpdatePackageFaq(packageId || 0);
  const { mutate: deleteFaq } = useDeletePackageFaq(packageId || 0);

  const faqs: any[] = useMemo(() => {
    const list = data?.data ?? data ?? [];
    return Array.isArray(list)
      ? [...list].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      : [];
  }, [data]);

  if (disabled || !packageId) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 p-6 text-sm text-gray-500">
        Save the offer first to add FAQs. Nested FAQ endpoints require a package id.
      </div>
    );
  }

  const openCreate = () => {
    setDraft(emptyDraft(faqs.length));
    setDrawerOpen(true);
  };

  const openEdit = (row: any) => {
    setDraft({
      id: row.id,
      question: asTranslationMap(row.question) as { en: string; ar: string },
      answer: asTranslationMap(row.answer) as { en: string; ar: string },
      sort_order: row.sort_order ?? 0,
      is_active: row.is_active !== false,
    });
    setDrawerOpen(true);
  };

  const compactMap = (map: { en: string; ar: string }) => {
    const next: Record<string, string> = {};
    if (map.en.trim()) next.en = map.en.trim();
    if (map.ar.trim()) next.ar = map.ar.trim();
    return next;
  };

  const saveDraft = async () => {
    const question = compactMap(draft.question);
    const answer = compactMap(draft.answer);
    if (!Object.keys(question).length || !Object.keys(answer).length) {
      toast.error('Question and answer are required in at least one locale');
      return;
    }
    const body = {
      question,
      answer,
      sort_order: Number(draft.sort_order) || 0,
      is_active: draft.is_active,
    };
    if (draft.id) {
      await updateFaq({ faqId: draft.id, body });
      toast.success('FAQ saved');
    } else {
      await createFaq(body);
    }
    setDrawerOpen(false);
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= faqs.length) return;
    const next = [...faqs];
    [next[index], next[target]] = [next[target], next[index]];
    const changed = next
      .map((row: any, i: number) => ({ row, sort_order: i }))
      .filter(({ row, sort_order }) => row.sort_order !== sort_order);
    try {
      await Promise.all(
        changed.map(({ row, sort_order }) =>
          updateFaq({ faqId: row.id, body: { sort_order } })
        )
      );
      toast.success('Order saved');
    } catch {
      toast.error('Could not save order — reverting');
      refetch();
    }
  };

  const completeness = {
    en: {
      filled: Number(Boolean(draft.question.en.trim())) + Number(Boolean(draft.answer.en.trim())),
      total: 2,
    },
    ar: {
      filled: Number(Boolean(draft.question.ar.trim())) + Number(Boolean(draft.answer.ar.trim())),
      total: 2,
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Text className="font-medium">Offer FAQs</Text>
        <Button type="button" onClick={openCreate}>
          <PiPlusBold className="me-1 h-4 w-4" />
          Add FAQ
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-sm text-gray-500">
          No FAQs yet — add the questions customers ask most.
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((row: any, index: number) => (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3"
            >
              <span className="w-6 text-xs font-semibold text-gray-500">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {offerDisplayName(row.question) || 'Untitled question'}
                </p>
              </div>
              <Switch
                checked={row.is_active !== false}
                onChange={(event) =>
                  updateFaq({ faqId: row.id, body: { is_active: event.target.checked } })
                }
              />
              <Button type="button" size="sm" variant="text" onClick={() => reorder(index, -1)}>
                <PiArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="text" onClick={() => reorder(index, 1)}>
                <PiArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>
                <PiPencilSimple className="h-4 w-4" />
              </Button>
              <DeletePopover
                title="Delete FAQ"
                description={`Delete “${offerDisplayName(row.question) || 'this FAQ'}”?`}
                onDelete={() => deleteFaq(row.id)}
              >
                <Button type="button" size="sm" variant="outline">
                  Delete
                </Button>
              </DeletePopover>
            </div>
          ))}
        </div>
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-md"
        containerClassName="max-w-xl"
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <Text className="text-lg font-semibold">{draft.id ? 'Edit FAQ' : 'Add FAQ'}</Text>
            <LocaleTabs locale={locale} onChange={setLocale} completeness={completeness} />
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto">
            <Input
              label={`Question (${locale.toUpperCase()})`}
              value={draft.question[locale]}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  question: { ...prev.question, [locale]: e.target.value },
                }))
              }
            />
            <RestrictedQuill
              label={`Answer (${locale.toUpperCase()})`}
              value={draft.answer[locale]}
              onChange={(html) =>
                setDraft((prev) => ({
                  ...prev,
                  answer: { ...prev.answer, [locale]: html },
                }))
              }
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
            <Input
              label="Sort order"
              type="number"
              value={draft.sort_order}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, sort_order: Number(e.target.value) || 0 }))
              }
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={draft.is_active}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, is_active: event.target.checked }))
                }
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveDraft} isLoading={creating || updating}>
              Save
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
