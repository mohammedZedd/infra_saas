import React, { useMemo, useReducer, useEffect } from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortDirection = "asc" | "desc" | "none";
type Align = "left" | "center" | "right";

export interface ColumnDef<T> {
  /** Unique column identifier */
  key: string;
  header: string | React.ReactNode;
  /** Render the cell content. Falls back to `String(row[key])` if omitted. */
  accessor?: (row: T) => React.ReactNode;
  /**
   * Return the raw comparable value for sorting.
   * Must be provided to make a column sortable.
   */
  sortValue?: (row: T) => string | number | Date | null;
  /** Enable click-to-sort on this column's header. Default: false */
  sortable?: boolean;
  /** Tailwind width class, e.g. "w-48" */
  widthClassName?: string;
  align?: Align;
  cellClassName?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  initialSort?: { key: string; direction: "asc" | "desc" };
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  // Legacy compat
  /** @deprecated use getRowId */
  rowKey?: (row: T) => string;
  /** @deprecated use loading */
  isLoading?: boolean;
  /** @deprecated use emptyMessage as string */
  emptyState?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Sort state + reducer
// ---------------------------------------------------------------------------

interface SortState {
  key: string | null;
  direction: SortDirection;
}

type TableAction =
  | { type: "SORT"; key: string }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_PAGE_SIZE"; size: number }
  | { type: "RESET_PAGE" };

interface TableState {
  sort: SortState;
  page: number;
  pageSize: number;
}

function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "SORT": {
      const { key } = action;
      if (state.sort.key !== key) {
        return { ...state, sort: { key, direction: "asc" }, page: 1 };
      }
      const next: SortDirection =
        state.sort.direction === "asc" ? "desc" : state.sort.direction === "desc" ? "none" : "asc";
      return { ...state, sort: { key: next === "none" ? null : key, direction: next }, page: 1 };
    }
    case "SET_PAGE":
      return { ...state, page: action.page };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.size, page: 1 };
    case "RESET_PAGE":
      return { ...state, page: 1 };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function compareValues(
  a: string | number | Date | null,
  b: string | number | Date | null
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ArrowUp size={14} aria-hidden="true" />;
  if (direction === "desc") return <ArrowDown size={14} aria-hidden="true" />;
  return <ChevronsUpDown size={14} className="text-gray-400" aria-hidden="true" />;
}

function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, ri) => (
        <tr key={ri}>
          {Array.from({ length: cols }, (_, ci) => (
            <td key={ci} className="px-4 py-3">
              <div
                aria-hidden="true"
                className="h-4 rounded-md bg-gray-200 animate-pulse"
                style={{ width: `${55 + ((ri * cols + ci) % 5) * 9}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

/**
 * Generic typed table with client-side sorting and pagination.
 *
 * Sorting cycle: none → asc → desc → none
 *
 * @example
 * <Table
 *   data={projects}
 *   columns={columns}
 *   getRowId={(r) => r.id}
 *   pageSize={20}
 * />
 */
export function Table<T>({
  data,
  columns,
  getRowId,
  initialSort,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  loading,
  emptyMessage = "No results",
  onRowClick,
  className,
  // legacy aliases
  rowKey,
  isLoading,
  emptyState,
}: TableProps<T>) {
  const resolvedGetRowId = getRowId ?? rowKey!;
  const resolvedLoading = loading ?? isLoading ?? false;
  const resolvedEmptyMessage = emptyMessage;

  const [state, dispatch] = useReducer(tableReducer, {
    sort: initialSort
      ? { key: initialSort.key, direction: initialSort.direction }
      : { key: null, direction: "none" as SortDirection },
    page: 1,
    pageSize: initialPageSize,
  });

  // Reset to page 1 when data changes (e.g. filter, fetch)
  useEffect(() => {
    dispatch({ type: "RESET_PAGE" });
  }, [data]);

  // ------ Derived data -------------------------------------------------------

  const sortedData = useMemo<T[]>(() => {
    if (state.sort.key === null || state.sort.direction === "none") return data;
    const col = columns.find((c) => c.key === state.sort.key);
    if (!col?.sortValue) return data;
    const multiplier = state.sort.direction === "asc" ? 1 : -1;
    return [...data].sort(
      (a, b) => multiplier * compareValues(col.sortValue!(a), col.sortValue!(b))
    );
  }, [data, columns, state.sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / state.pageSize));
  const safePage = Math.min(state.page, totalPages);

  const pageData = useMemo<T[]>(() => {
    const start = (safePage - 1) * state.pageSize;
    return sortedData.slice(start, start + state.pageSize);
  }, [sortedData, safePage, state.pageSize]);

  const showPagination = !resolvedLoading && sortedData.length > 0;

  // ---------------------------------------------------------------------------
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-xl overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => {
                const isSorted = state.sort.key === col.key && state.sort.direction !== "none";
                const dir = isSorted ? state.sort.direction : "none";
                const ariaSortMap: Record<SortDirection, React.AriaAttributes["aria-sort"]> = {
                  asc: "ascending",
                  desc: "descending",
                  none: "none",
                };

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortable ? ariaSortMap[dir] : undefined}
                    className={cn(
                      "px-4 py-3 text-sm font-medium text-gray-700",
                      ALIGN_CLASS[col.align ?? "left"],
                      col.widthClassName,
                      col.headerClassName
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "SORT", key: col.key })}
                        className={cn(
                          "inline-flex items-center gap-1.5 select-none",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded",
                          isSorted ? "text-gray-900" : "text-gray-700 hover:text-gray-900"
                        )}
                      >
                        {col.header}
                        <SortIcon direction={dir} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {resolvedLoading ? (
              <SkeletonRows cols={columns.length} />
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  {emptyState ?? resolvedEmptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={resolvedGetRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-gray-100 last:border-0",
                    onRowClick && "cursor-pointer hover:bg-gray-50 transition-colors"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm text-gray-700",
                        ALIGN_CLASS[col.align ?? "left"],
                        col.cellClassName
                      )}
                    >
                      {col.accessor
                        ? col.accessor(row)
                        : col.key in (row as object)
                          ? String((row as Record<string, unknown>)[col.key] ?? "")
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      {showPagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white flex-wrap gap-3">
          {/* Left: rows info + page size */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>
              {(safePage - 1) * state.pageSize + 1}–
              {Math.min(safePage * state.pageSize, sortedData.length)} of{" "}
              {sortedData.length}
            </span>
            <label className="flex items-center gap-1.5">
              <span className="text-gray-500">Rows</span>
              <select
                value={state.pageSize}
                onChange={(e) =>
                  dispatch({ type: "SET_PAGE_SIZE", size: Number(e.target.value) })
                }
                aria-label="Rows per page"
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Right: prev / page indicator / next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage <= 1}
              onClick={() => dispatch({ type: "SET_PAGE", page: safePage - 1 })}
              className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              Prev
            </button>

            <span className="text-sm text-gray-600 px-1">
              {safePage} / {totalPages}
            </span>

            <button
              type="button"
              aria-label="Next page"
              disabled={safePage >= totalPages}
              onClick={() => dispatch({ type: "SET_PAGE", page: safePage + 1 })}
              className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
