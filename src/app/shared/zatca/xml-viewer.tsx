'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import { useZatcaXml } from '@/framework/zatca';
import client from '@/framework/utils';
import type { XmlKind, ZatcaSubmission } from '@/types/zatca';
import toast from 'react-hot-toast';

const TABS: { kind: XmlKind; label: string; flag: keyof ZatcaSubmission }[] = [
  { kind: 'original', label: 'Original', flag: 'has_original_xml' },
  { kind: 'signed', label: 'Signed', flag: 'has_signed_xml' },
  { kind: 'cleared', label: 'Cleared', flag: 'has_cleared_xml' },
];

export default function XmlViewer({
  invoiceId,
  invoiceNumber,
  lastSubmission,
}: {
  invoiceId: number | string;
  invoiceNumber: string;
  lastSubmission?: ZatcaSubmission | null;
}) {
  const defaultTab =
    TABS.find((t) => lastSubmission?.[t.flag])?.kind ?? ('signed' as XmlKind);
  const [active, setActive] = useState<XmlKind>(defaultTab);
  const [fetchedTabs, setFetchedTabs] = useState<Set<XmlKind>>(() => new Set([defaultTab]));

  const { data, isLoading, isError } = useZatcaXml(
    invoiceId,
    active,
    fetchedTabs.has(active)
  );

  const handleTab = (kind: XmlKind) => {
    setFetchedTabs((prev) => new Set([...prev, kind]));
    setActive(kind);
  };

  const copyXml = () => {
    if (data?.xml) {
      navigator.clipboard.writeText(data.xml);
      toast.success('XML copied');
    }
  };

  const downloadXml = async () => {
    try {
      const res = await client.zatca.xml(invoiceId, active, true);
      if (typeof res === 'object' && (res as { xml?: string }).xml) {
        const blob = new Blob([(res as { xml: string }).xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        return;
      }
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {TABS.map((tab) => {
          const has = Boolean(lastSubmission?.[tab.flag]);
          return (
            <button
              key={tab.kind}
              type="button"
              disabled={!has}
              onClick={() => has && handleTab(tab.kind)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                active === tab.kind
                  ? 'bg-gray-900 text-white'
                  : has
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'cursor-not-allowed text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        <div className="ms-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={copyXml} disabled={!data?.xml}>
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={downloadXml}>
            Download
          </Button>
        </div>
      </div>
      <Text className="mb-2 text-xs text-gray-500">
        {invoiceNumber} · attempt #{data?.attempt_number ?? lastSubmission?.attempt_number ?? '—'}
      </Text>
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
        </div>
      )}
      {isError && (
        <Text className="text-sm text-gray-500">
          No {active} XML — invoice has not been submitted yet or this version is unavailable.
        </Text>
      )}
      {data?.xml && (
        <pre className="max-h-[480px] overflow-auto rounded-md border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-relaxed">
          {data.xml}
        </pre>
      )}
    </div>
  );
}
