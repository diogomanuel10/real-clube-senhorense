// src/components/ResponsiveTable.jsx
import { ChevronRight } from 'lucide-react';

export default function ResponsiveTable({ 
  headers, 
  data, 
  onRowClick,
  mobileCard = true,
  keyExtractor = (item, index) => index 
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Sem dados para apresentar
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row, idx) => (
              <tr
                key={keyExtractor(row, idx)}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}
              >
                {headers.map((header, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 text-sm text-slate-900">
                    {header.render ? header.render(row) : row[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      {mobileCard && (
        <div className="md:hidden space-y-3">
          {data.map((row, idx) => (
            <div
              key={keyExtractor(row, idx)}
              onClick={() => onRowClick?.(row)}
              className={`bg-white border border-slate-200 rounded-lg p-4 ${
                onRowClick ? 'cursor-pointer active:bg-slate-50' : ''
              }`}
            >
              <div className="space-y-2">
                {headers.filter(h => !h.hideOnMobile).map((header, colIdx) => (
                  <div key={colIdx} className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-500 uppercase">
                      {header.label}
                    </span>
                    <span className="text-sm text-slate-900 text-right ml-2">
                      {header.render ? header.render(row) : row[header.key]}
                    </span>
                  </div>
                ))}
              </div>
              {onRowClick && (
                <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
