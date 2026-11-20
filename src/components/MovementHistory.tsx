import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trash2, Receipt } from 'lucide-react';
import { HistoryFilter, Movement } from '../types/finance';
import { formatCurrency, formatDisplayDate, sortMovementsDesc } from '../utils/formatters';

interface MovementHistoryProps {
  movements: Movement[];
  onDelete: (id: string) => void;
  previewLimit?: number;
  onViewAll?: () => void;
}

export function MovementHistory({
  movements,
  onDelete,
  previewLimit,
  onViewAll,
}: MovementHistoryProps) {
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const sorted = sortMovementsDesc(movements);
  const filtered =
    previewLimit !== undefined
      ? sorted
      : sorted.filter((m) => (filter === 'all' ? true : m.type === filter));

  const visibleMovements =
    previewLimit !== undefined ? filtered.slice(0, previewLimit) : filtered;

  return (
    <section aria-label="Historial de movimientos" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            {previewLimit !== undefined ? 'Movimientos recientes' : 'Historial de movimientos'}
          </h2>
          <p className="text-xs text-slate-500">
            Ordenados del más reciente al más antiguo
          </p>
        </div>

        {previewLimit !== undefined && onViewAll && movements.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="min-h-[44px] px-2 text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-900 whitespace-nowrap shrink-0"
          >
            Ver todos ({movements.length})
          </button>
        )}
      </div>

      {/* Interactive Filter Tabs (shown in full history view) */}
      {previewLimit === undefined && movements.length > 0 && (
        <div
          role="tablist"
          aria-label="Filtrar movimientos"
          className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1"
        >
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'income', label: 'Ingresos' },
              { id: 'expense', label: 'Gastos' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`min-h-[40px] rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* List Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
        {visibleMovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Receipt className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {movements.length === 0
                ? 'Aún no hay movimientos registrados'
                : 'No hay movimientos en esta categoría'}
            </p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              {movements.length === 0
                ? 'Presiona "Registrar ingreso" o "Registrar gasto" para comenzar a controlar tus finanzas.'
                : 'Prueba cambiando el filtro superior para ver otros registros.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visibleMovements.map((item) => {
              const isIncome = item.type === 'income';
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.concept}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <span
                          className={`font-medium ${
                            isIncome ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isIncome ? 'Ingreso' : 'Gasto'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDisplayDate(item.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={`font-mono text-sm font-semibold tabular-nums sm:text-base ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(item.amount)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Eliminar ${item.concept}`}
                      title="Eliminar movimiento"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
