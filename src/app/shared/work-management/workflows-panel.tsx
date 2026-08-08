'use client';

import { useState } from 'react';
import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Spinner from '@/components/ui/spinner';
import {
  useUpsertWorkflow,
  useWmWorkflows,
} from '@/framework/work-management/projects';
import type { WorkflowDefinition } from '@/types/work-management';
import { uid } from '@/lib/work-management/mock-store';

export default function WorkflowsPanel() {
  const { data: workflows = [], isLoading } = useWmWorkflows();
  const upsert = useUpsertWorkflow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    workflows.find((w) => w.id === selectedId) ?? workflows[0] ?? null;

  const [draft, setDraft] = useState<WorkflowDefinition | null>(null);
  const editing = draft ?? selected;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const startEdit = (wf: WorkflowDefinition) => {
    setSelectedId(wf.id);
    setDraft(JSON.parse(JSON.stringify(wf)) as WorkflowDefinition);
  };

  const createNew = () => {
    const wf: WorkflowDefinition = {
      id: uid('wf'),
      name: 'New workflow',
      statuses: ['new', 'in_progress', 'done'],
      transitions: {
        new: ['in_progress'],
        in_progress: ['done'],
        done: [],
      },
    };
    setDraft(wf);
    setSelectedId(wf.id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <Title as="h4" className="text-sm font-semibold">
            Workflows
          </Title>
          <Button size="sm" onClick={createNew}>
            New
          </Button>
        </div>
        <ul className="space-y-1">
          {workflows.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                className={`w-full rounded px-3 py-2 text-left text-sm ${
                  editing?.id === w.id
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => startEdit(w)}
              >
                {w.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {editing ? (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <Input
            label="Name"
            value={editing.name}
            onChange={(e) =>
              setDraft({ ...(draft ?? editing), name: e.target.value })
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Statuses (comma-separated keys)
            </label>
            <Input
              value={editing.statuses.join(', ')}
              onChange={(e) => {
                const statuses = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const transitions = { ...(draft ?? editing).transitions };
                for (const s of statuses) {
                  if (!transitions[s]) transitions[s] = [];
                }
                setDraft({
                  ...(draft ?? editing),
                  statuses,
                  transitions,
                });
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Transitions JSON (from → [to…])
            </label>
            <Textarea
              rows={12}
              value={JSON.stringify(editing.transitions, null, 2)}
              onChange={(e) => {
                try {
                  const transitions = JSON.parse(e.target.value) as Record<
                    string,
                    string[]
                  >;
                  setDraft({ ...(draft ?? editing), transitions });
                } catch {
                  /* ignore invalid JSON while typing */
                }
              }}
            />
            <Text className="mt-1 text-xs text-gray-500">
              Example: {`{ "new": ["in_progress"], "in_progress": ["done"] }`}
            </Text>
          </div>
          <Button
            isLoading={upsert.isPending}
            onClick={() => {
              if (!draft && !editing) return;
              upsert.mutate(draft ?? editing, {
                onSuccess: () => setDraft(null),
              });
            }}
          >
            Save workflow
          </Button>
        </div>
      ) : (
        <Text className="text-gray-500">Select or create a workflow.</Text>
      )}
    </div>
  );
}
