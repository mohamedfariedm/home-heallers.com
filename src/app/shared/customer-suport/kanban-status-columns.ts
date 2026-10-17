export interface KanbanStatusColumn {
  id: string;
  label: string;
  status: string;
}

export interface KanbanColumnData {
  data: any;
  meta: any;
  isLoading: boolean;
}

export const STATUS_COLUMNS: KanbanStatusColumn[] = [
  { id: 'new', label: 'New', status: 'new' },
  { id: 'negotiation', label: 'Negotiation', status: 'negotiation' },
  { id: 'success', label: 'Success', status: 'success' },
  { id: 'possible', label: 'Possible', status: 'possible' },
  { id: 'failed', label: 'Failed', status: 'failed' },
];

export function normalizeStatus(status: string | null | undefined): string {
  if (!status) return '';
  return status.toLowerCase().trim();
}

/** Groups one customer-support list response into per-status kanban columns. */
export function buildKanbanColumnData(
  response: any,
  isLoading: boolean
): Record<string, KanbanColumnData> {
  const allItems = response?.data || [];

  return STATUS_COLUMNS.reduce(
    (acc, column) => {
      acc[column.status] = {
        data: {
          data: allItems.filter(
            (item: any) =>
              normalizeStatus(item.status) === column.status.toLowerCase()
          ),
          meta: response?.meta,
          statistics: response?.statistics,
        },
        meta: response?.meta,
        isLoading,
      };
      return acc;
    },
    {} as Record<string, KanbanColumnData>
  );
}
