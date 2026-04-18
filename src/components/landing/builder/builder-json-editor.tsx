'use client';

import { useState, useEffect } from 'react';
import type { LandingPageConfig } from '@/types/landing-builder';
import { mergeLandingConfig } from '@/lib/landing-builder/defaults';
import toast from 'react-hot-toast';

const inputClass =
  'w-full min-h-[420px] rounded-xl border border-zinc-200 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100 shadow-inner outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700';

type Props = {
  config: LandingPageConfig;
  onApply: (next: LandingPageConfig) => void;
};

export function BuilderJsonEditor({ config, onApply }: Props) {
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(config, null, 2));
    setErr(null);
  }, [config]);

  const apply = () => {
    try {
      const parsed = JSON.parse(text) as Partial<LandingPageConfig>;
      if (typeof parsed !== 'object' || !parsed) throw new Error('Invalid root');
      onApply(mergeLandingConfig(parsed));
      setErr(null);
      toast.success('JSON applied');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setErr(msg);
      toast.error('Could not parse JSON');
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 pb-24">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Edit the full config as JSON. Click Apply to update the preview and undo
        stack.
      </p>
      <textarea
        className={inputClass}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setErr(null);
        }}
        spellCheck={false}
      />
      {err ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {err}
        </p>
      ) : null}
      <button
        type="button"
        onClick={apply}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
      >
        Apply JSON
      </button>
    </div>
  );
}
