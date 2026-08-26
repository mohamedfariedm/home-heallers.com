'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Title } from '@/components/ui/text';
import QuillLoader from '@/components/loader/quill-loader';
import { isAllowedLinkHref } from '@/app/shared/offers/utils';

const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[160px]" />,
}) as any;

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'span',
  'a',
];

const modules = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const formats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'];

export function sanitizeOfferHtml(html: string): string {
  if (!html) return '';
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'title', 'rel', 'target'],
  });
  if (typeof window === 'undefined') return clean;
  const doc = new DOMParser().parseFromString(clean, 'text/html');
  doc.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href') || '';
    if (!isAllowedLinkHref(href)) {
      anchor.replaceWith(...Array.from(anchor.childNodes));
      return;
    }
    anchor.setAttribute('rel', 'noopener noreferrer nofollow');
  });
  return doc.body.innerHTML;
}

export default function RestrictedQuill({
  label,
  value,
  onChange,
  error,
  placeholder,
  dir,
  disabled,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
  disabled?: boolean;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const sanitized = useMemo(() => sanitizeOfferHtml(value || ''), [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <Button
          type="button"
          size="sm"
          variant="text"
          onClick={() => setPreviewOpen(true)}
        >
          Preview
        </Button>
      </div>
      <QuillEditor
        name={label}
        label=""
        value={value || ''}
        onChange={(next: string) => onChange(sanitizeOfferHtml(next))}
        error={error}
        placeholder={placeholder}
        dir={dir}
        readOnly={disabled}
        modules={modules}
        formats={formats}
      />
      <p className="text-xs text-gray-500">
        Links are saved with rel=&quot;noopener noreferrer nofollow&quot;. Fonts, colours, images and H1 are not allowed.
      </p>
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)}>
        <div className="p-6">
          <Title as="h4" className="mb-4">
            Public preview
          </Title>
          <div
            className="prose max-w-none prose-headings:font-semibold prose-p:text-gray-700"
            dir={dir}
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        </div>
      </Modal>
    </div>
  );
}
