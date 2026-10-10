'use client';

import React, { useCallback, useMemo } from 'react';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from './columns';
import { useDeleteHighlight, useToggleHighlightActive } from '@/framework/highlights';
import { Highlight } from '@/types/highlights';

export default function HighlightsTable({
  data = [],
  totalItems = 0,
  isFetching = false,
  canEdit = true,
  canDelete = true,
  getSelectedColumns,
  getSelectedRowKeys,
}: {
  data: Highlight[];
  totalItems: number;
  isFetching?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  getSelectedColumns?: (columns: any[]) => void;
  getSelectedRowKeys?: (keys: any[]) => void;
}) {
  const { mutate: deleteHighlight } = useDeleteHighlight();
  const { mutate: toggleActive } = useToggleHighlightActive();

  const handleToggleActive = useCallback(
    (id: number) => {
      toggleActive(id);
    },
    [toggleActive]
  );

  const handleDeleteItem = useCallback(
    (id: number) => {
      deleteHighlight(id);
    },
    [deleteHighlight]
  );

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
    filters,
    searchTerm,
    handleSearch,
    sortConfig,
    handleReset,
  } = useTable(data, 20);

  const columns = useMemo(
    () =>
      getColumns({
        data: tableData,
        onToggleActive: handleToggleActive,
        onDeleteItem: handleDeleteItem,
        canEdit,
        canDelete,
      }),
    [tableData, handleToggleActive, handleDeleteItem, canEdit, canDelete]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  React.useEffect(() => {
    if (getSelectedColumns) getSelectedColumns(checkedColumns);
  }, [checkedColumns, getSelectedColumns]);

  return (
    <ControlledTable
      variant="modern"
      data={tableData}
      isLoading={isLoading || isFetching}
      showLoadingText={true}
      // @ts-ignore
      columns={visibleColumns}
      paginatorOptions={{
        pageSize: 20,
        total: totalItems,
        current: currentPage,
        onChange: (page: number) => handlePaginate(page),
      }}
      filterOptions={{
        searchTerm,
        onSearchClear: () => handleSearch(''),
        onSearchChange: (event) => handleSearch(event.target.value),
        hasSearched: isFiltered,
        columns,
        checkedColumns,
        setCheckedColumns,
        filters,
      }}
      className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm"
    />
  );
}
