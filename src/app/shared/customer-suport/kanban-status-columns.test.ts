import { describe, expect, it } from 'vitest';
import {
  STATUS_COLUMNS,
  buildKanbanColumnData,
  isDraftStatus,
} from './kanban-status-columns';
import { requiresQualificationForStatus } from './leads-qualification-utils';

describe('STATUS_COLUMNS', () => {
  it('puts Draft first, before New', () => {
    expect(STATUS_COLUMNS.map((column) => column.status)).toEqual([
      'draft',
      'new',
      'negotiation',
      'success',
      'possible',
      'failed',
    ]);
  });
});

describe('isDraftStatus', () => {
  it.each(['draft', 'Draft', ' DRAFT '])('treats %j as draft', (status) => {
    expect(isDraftStatus(status)).toBe(true);
  });

  it.each(['new', 'failed', '', null, undefined])(
    'does not treat %j as draft',
    (status) => {
      expect(isDraftStatus(status)).toBe(false);
    }
  );
});

describe('requiresQualificationForStatus', () => {
  it('skips qualification when moving into Draft', () => {
    expect(requiresQualificationForStatus('draft')).toBe(false);
  });

  it.each(['new', 'negotiation', 'success', 'possible', 'failed'])(
    'requires qualification when moving out of Draft to %s',
    (status) => {
      expect(requiresQualificationForStatus(status)).toBe(true);
    }
  );
});

describe('buildKanbanColumnData', () => {
  it('groups leads into the Draft column case-insensitively', () => {
    const response = {
      data: [
        { id: 1, status: 'draft' },
        { id: 2, status: 'Draft' },
        { id: 3, status: 'new' },
      ],
      meta: { total: 3 },
    };

    const columns = buildKanbanColumnData(response, false);

    expect(columns.draft.data.data.map((item: any) => item.id)).toEqual([1, 2]);
    expect(columns.new.data.data.map((item: any) => item.id)).toEqual([3]);
    expect(columns.draft.meta).toEqual({ total: 3 });
  });
});
