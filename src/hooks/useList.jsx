import { useState, useCallback, useMemo } from "react";

export const useList = (initialData, options = {}) => {
  const {
    pageSize = 5,
    filterFn = (item, term) =>
      item.fullName.toLowerCase().includes(term.toLowerCase()),
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [gridView, setGridView] = useState(false);

  const filtered = useMemo(
    () => initialData.filter((item) => filterFn(item, searchTerm)),
    [initialData, searchTerm, filterFn]
  );

  const totalPages = useMemo(
    () => Math.ceil(filtered.length / pageSize) || 1,
    [filtered, pageSize]
  );

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const allSelected = useMemo(
    () =>
      paginated.length > 0 &&
      paginated.every((u) => selectedIds.includes(u.id)),
    [paginated, selectedIds]
  );

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handlePrev = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);
  const handleNext = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );

  const handleSelect = useCallback(
    (id, checked) =>
      setSelectedIds((prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
      ),
    []
  );

  const handleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        const ids = paginated.map((u) => u.id);
        setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
      } else {
        setSelectedIds((prev) =>
          prev.filter((id) => !paginated.some((u) => u.id === id))
        );
      }
    },
    [paginated]
  );

  return {
    searchTerm,
    page,
    totalPages,
    paginated,
    selectedIds,
    allSelected,
    gridView,
    filtered,
    setGridView,
    handleSearch,
    handlePrev,
    handleNext,
    handleSelect,
    handleSelectAll,
    setSelectedIds,
  };
};
