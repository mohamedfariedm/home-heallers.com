import { useState, useEffect } from 'react';
import isString from 'lodash/isString';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface AnyObject {
  [key: string]: any;
}

export function useTable<T extends AnyObject>(
  initialData: T[],
  countPerPage: number,
  initialFilterState?: Partial<Record<string, any>>
) {
  const [data, setData] = useState(initialData);
  /*
   * Dummy loading state.
   */
  const [isLoading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { push } = useRouter();
  useEffect(() => {
    setLoading(false);
  }, []);

  // Only sync `limit` when the page already uses that query key.
  // Do not inject `limit` onto pages that use `per_page` (KPIs, doctor-targets),
  // and never depend on a new URLSearchParams instance each render.
  useEffect(() => {
    if (!countPerPage || countPerPage <= 0) return;
    const urlLimit = searchParams.get('limit');
    if (urlLimit === null) return;
    if (Number(urlLimit) === countPerPage) return;

    const next = new URLSearchParams(searchParams.toString());
    next.set('limit', String(countPerPage));
    push(`${pathName}?${next.toString()}`);
  }, [searchParams, countPerPage, pathName, push]);

  // Keep a mutable params helper for pagination helpers below
  const params = new URLSearchParams(searchParams.toString());

  /*
   * Handle row selection
   */
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const handleRowSelect = (recordKey: string) => {
    const selectedKeys = [...selectedRowKeys];
    if (selectedKeys.includes(recordKey)) {
      setSelectedRowKeys(selectedKeys.filter((key) => key !== recordKey));
    } else {
      setSelectedRowKeys([...selectedKeys, recordKey]);
    }
  };
  const handleSelectAll = () => {
    if (selectedRowKeys.length === data.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(initialData.map((record) => record.id));
    }
  };

  /*
   * Handle sorting
   */
  const [sortConfig, setSortConfig] = useState<AnyObject>({
    key: null,
    direction: null,
  });

  function sortData(data: T[], sortKey: string, sortDirection: string) {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // const sortedData = useMemo(() => {
  //   let newData = data;
  //   if (!sortConfig.key) {
  //     return newData;
  //   }
  //   return sortData(newData, sortConfig.key, sortConfig.direction);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [sortConfig, data]);
  const sortedData = !sortConfig.key ? initialData : sortData(initialData, sortConfig.key, sortConfig.direction);

  function handleSort(key: string) {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  /*
   * Handle pagination
   */
  const [currentPage, setCurrentPage] = useState(Number(params.get('page')) || 1);
  // function paginatedData(data: T[] = sortedData) {
  //   const start = (currentPage - 1) * countPerPage;
  //   const end = start + countPerPage;

  //   if (data?.length > start) return data.slice(start, end);
  //   return data;
  // }

  function handlePaginate(pageNumber: number) {
    setCurrentPage(pageNumber);
    params.set('page', String(pageNumber))
    push(`${pathName}?${params.toString()}`)
  }

  /*
   * Handle delete
   */
  function handleDelete(id: string | string[]) {
    const updatedData = Array.isArray(id)
      ? data.filter((item) => !id.includes(item.id))
      : data.filter((item) => item.id !== id);

    setData(updatedData);
  }

  /*
   * Handle Filters and searching
   */
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>(
    initialFilterState ?? {}
  );
  const appliedFilterKey = JSON.stringify(initialFilterState ?? {});

  // Keep drawer values in sync with the URL. useState only applies
  // initialFilterState on mount, so applied params would otherwise be lost
  // when the filter panel is reopened on an already-mounted table.
  useEffect(() => {
    setFilters(JSON.parse(appliedFilterKey) as Record<string, any>);
  }, [appliedFilterKey]);

  function updateFilter(columnId: string, filterValue: string | any[]) {
    if (!Array.isArray(filterValue) && !isString(filterValue)) {
      throw new Error('filterValue data type should be string or array of any');
    }

    if (Array.isArray(filterValue) && filterValue.length !== 2) {
      throw new Error('filterValue data must be an array of length 2');
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnId]: filterValue,
    }));
  }

  function applyFilters() {
    const searchTermLower = searchTerm.toLowerCase();

    return (
      sortedData
        ?.filter((item) =>
          Object.values(item).some((value) =>
            typeof value === 'object'
              ? value &&
                Object.values(value).some(
                  (nestedItem) =>
                    nestedItem &&
                    String(nestedItem).toLowerCase().includes(searchTermLower)
                )
              : value && String(value).toLowerCase().includes(searchTermLower)
          )
        )
    );
  }

  /*
   * Handle searching
   */
  function handleSearch(searchValue: string) {
    setSearchTerm(searchValue);
  }

  function searchedData() {
    if (!searchTerm) return sortedData;

    const searchTermLower = searchTerm.toLowerCase();

    return sortedData.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === 'object'
          ? value &&
            Object.values(value).some(
              (nestedItem) =>
                nestedItem &&
                String(nestedItem).toLowerCase().includes(searchTermLower)
            )
          : value && String(value).toLowerCase().includes(searchTermLower)
      )
    );
  }

  /*
   * Reset search and filters
   */
  function handleReset() {
  setData(initialData);
  handleSearch('');

  // ✅ Create fresh params only keeping `page` & `limit`
  const newParams = new URLSearchParams();

  // Keep pagination defaults
  newParams.set('page', '1');
  newParams.set('limit', String(countPerPage));

  // ✅ Push clean URL (no other filters)
  push(`${pathName}?${newParams.toString()}`);

  // ✅ Clear local filters state too
  setFilters({});
}

  /*
   * Set isFiltered and final filtered data
   */
  const isFiltered = applyFilters().length > 0;
  function calculateTotalItems() {
    if (isFiltered) {
      params.set("page","1")
      return applyFilters().length;
    }
    if (searchTerm) {
      return searchedData().length;
    }
    return sortedData?.length;
  }
  const filteredAndSearchedData = isFiltered ? applyFilters() : searchedData();
  // const tableData = paginatedData(filteredAndSearchedData);
  const tableData = filteredAndSearchedData;

  /*
   * Go to first page when data is filtered and searched
   */
  // useEffect(() => {
  //   handlePaginate(1);
  // }, [isFiltered, searchTerm]);

  // useTable returns
  return {
    isLoading,
    isFiltered,
    tableData,
    // pagination
    currentPage,
    handlePaginate,
    totalItems: calculateTotalItems(),
    // sorting
    sortConfig,
    handleSort,
    // row selection
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    // searching
    searchTerm,
    handleSearch,
    // filters
    filters,
    updateFilter,
    applyFilters,
    handleDelete,
    handleReset,
  };
}
