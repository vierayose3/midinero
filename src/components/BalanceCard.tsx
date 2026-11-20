import { ArrowDownLeft, ArrowUpRight, AlertTriangle, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface BalanceCardProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
}

export function BalanceCard({
  totalIncome,
  totalExpense,
  balance,
  onOpenIncome,
  onOpenExpense,
}: BalanceCardProps) {
  const isNegative = balance < 0;

  return (
    <section aria-label="Resumen financiero" className="space-y-4">
      {/* Main Balance Card */}
      <div
        className={`rounded-3xl p-6 text-white transition-colors duration-200 ${
          isNegative
            ? 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 ring-1 ring-rose-500/40'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ring-1 ring-white/10'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-300">Saldo disponible</p>
          {isNegative && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Saldo negativo
            </span>
          )}
        </div>

        <p
          className={`mt-2 font-mono text-4xl font-semibold tracking-tight tabular-nums sm:text-[2.5rem] ${
            isNegative ? 'text-rose-300' : 'text-white'
          }`}
        >
          {formatCurrency(balance)}
        </p>

        {/* Three indicators: Ingresos, Gastos, Saldo */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-300">
              <ArrowDownLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Ingresos</span>
            </div>
            <p className="mt-1 truncate font-mono text-sm font-semibold text-white tabular-nums sm:text-base">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs font-medium text-rose-300">
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Gastos</span>
            </div>
            <p className="mt-1 truncate font-mono text-sm font-semibold text-white tabular-nums sm:text-base">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs font-medium text-slate-300">
              <span>Saldo</span>
            </div>
            <p
              className={`mt-1 truncate font-mono text-sm font-semibold tabular-nums sm:text-base ${
                isNegative ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Thumb-Friendly Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenIncome}
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-transform duration-150 hover:bg-emerald-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Registrar ingreso</span>
        </button>

        <button
          type="button"
          onClick={onOpenExpense}
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-600/20 transition-transform duration-150 hover:bg-rose-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 whitespace-nowrap"
        >
          <Minus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Registrar gasto</span>
        </button>
      </div>
    </section>
  );
}
