import React from "react"
import { cn } from "../../utils/cn"

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  width?: string
  align?: "left" | "center" | "right"
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
  className?: string
  isLoading?: boolean
}

const alignClass = { left: "text-left", center: "text-center", right: "text-right" }

export function Table<T>({ columns, data, rowKey, onRowClick, emptyState, className, isLoading }: TableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500", col.width, alignClass[col.align ?? "left"])}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 animate-pulse rounded-lg bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                  {emptyState ?? "No data available."}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)} onClick={() => onRowClick?.(row)} className={cn(onRowClick && "cursor-pointer transition-colors hover:bg-gray-50")}>
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-6 py-4 text-sm text-gray-700", alignClass[col.align ?? "left"])}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
