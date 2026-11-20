import { useEffect, useState, FormEvent } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import { MovementType } from '../types/finance';
import { getTodayISO } from '../utils/formatters';

interface MovementFormSheetProps {
  isOpen: boolean;
  type: MovementType;
  onClose: () => void;
  onSave: (payload: {
    type: MovementType;
    concept: string;
    amount: number;
    date: string;
  }) => void;
}

export function MovementFormSheet({
  isOpen,
  type,
  onClose,
  onSave,
}: MovementFormSheetProps) {
  const [concept, setConcept] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConcept('');
      setAmountStr('');
      setDate(getTodayISO());
      setError('');
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const isIncome = type === 'income';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedConcept = concept.trim();
    const parsedAmount = Number.parseFloat(amountStr);

    if (!trimmedConcept) {
      setError(
        isIncome
          ? 'Ingresa el concepto del ingreso.'
          : 'Ingresa el concepto del gasto.'
      );
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser mayor que cero.');
      return;
    }

    if (!date) {
      setError('Selecciona una fecha válida.');
      return;
    }

    onSave({
      type,
      concept: trimmedConcept,
      amount: Math.round(parsedAmount * 100) / 100,
      date,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-sheet-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Bottom Sheet / Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-2xl sm:rounded-3xl sm:p-6">
        {/* Mobile Drag Handle */}
        <div
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
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
            <div>
              <h2
                id="movement-sheet-title"
                className="text-lg font-bold text-slate-900"
              >
                {isIncome ? 'Registrar ingreso' : 'Registrar gasto'}
              </h2>
              <p className="text-xs text-slate-500">
                {isIncome
                  ? 'Suma un nuevo ingreso a tu saldo disponible'
                  : 'Registra una salida de dinero de tu saldo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="movement-concept"
              className="block text-sm font-semibold text-slate-700"
            >
              {isIncome ? 'Concepto del ingreso' : 'Concepto del gasto'}
            </label>
            <input
              id="movement-concept"
              type="text"
              value={concept}
              onChange={(e) => {
                setConcept(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isIncome
                  ? 'Ej. Salario, Venta, Reembolso'
                  : 'Ej. Supermercado, Transporte, Renta'
              }
              autoFocus
              className="mt-1.5 min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="movement-amount"
                className="block text-sm font-semibold text-slate-700"
              >
                {isIncome ? 'Monto recibido' : 'Monto'}
              </label>
              <div className="relative mt-1.5">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-base font-semibold text-slate-400"
                >
                  $
                </span>
                <input
                  id="movement-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0.00"
                  className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-4 font-mono text-base font-semibold text-slate-900 tabular-nums placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="movement-date"
                className="block text-sm font-semibold text-slate-700"
              >
                Fecha
              </label>
              <input
                id="movement-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (error) setError('');
                }}
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-base text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 pb-safe">
            <button
              type="submit"
              className={`min-h-[50px] w-full rounded-2xl px-5 py-3 text-base font-semibold text-white shadow-sm transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600'
                  : 'bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600'
              }`}
            >
              {isIncome ? 'Guardar ingreso' : 'Guardar gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
