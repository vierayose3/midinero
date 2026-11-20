import { useEffect, useState, FormEvent } from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { ActivityItem } from '../types/finance';
import { getTodayISO } from '../utils/formatters';

interface ActivityFormSheetProps {
  isOpen: boolean;
  editingActivity: ActivityItem | null;
  completeAfterDateUpdate?: boolean;
  onClose: () => void;
  onSaveNew: (payload: { title: string; executionDate: string }) => void;
  onUpdateDate: (
    id: string,
    newDate: string,
    markCompleted: boolean
  ) => void;
}

export function ActivityFormSheet({
  isOpen,
  editingActivity,
  completeAfterDateUpdate = false,
  onClose,
  onSaveNew,
  onUpdateDate,
}: ActivityFormSheetProps) {
  const [title, setTitle] = useState('');
  const [executionDate, setExecutionDate] = useState(getTodayISO());
  const [markCompletedOnSave, setMarkCompletedOnSave] = useState(false);
  const [error, setError] = useState('');

  const today = getTodayISO();

  useEffect(() => {
    if (isOpen) {
      if (editingActivity) {
        setTitle(editingActivity.title);
        setExecutionDate(editingActivity.executionDate);
        setMarkCompletedOnSave(completeAfterDateUpdate);
      } else {
        setTitle('');
        setExecutionDate(getTodayISO());
        setMarkCompletedOnSave(false);
      }
      setError('');
    }
  }, [isOpen, editingActivity, completeAfterDateUpdate]);

  if (!isOpen) return null;

  const isEditing = Boolean(editingActivity);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!isEditing && !trimmedTitle) {
      setError('Escribe el nombre o descripción de la actividad.');
      return;
    }

    if (!executionDate) {
      setError('Selecciona una fecha de ejecución válida.');
      return;
    }

    if (isEditing && editingActivity) {
      if (markCompletedOnSave && executionDate < today) {
        setError(
          'La fecha de ejecución no puede ser menor a hoy. Cambia primero la fecha a hoy o una fecha posterior para dar por completada la actividad.'
        );
        return;
      }
      onUpdateDate(editingActivity.id, executionDate, markCompletedOnSave);
      onClose();
      return;
    }

    onSaveNew({
      title: trimmedTitle,
      executionDate,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-sheet-title"
    >
      <button
        type="button"
        aria-label="Cerrar formulario de actividad"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-2xl sm:rounded-3xl sm:p-6">
        <div
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <Calendar className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="activity-sheet-title"
                className="text-lg font-bold text-slate-900"
              >
                {isEditing ? 'Cambiar fecha de ejecución' : 'Nueva actividad'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? editingActivity?.title
                  : 'Programa una tarea financiera o recordatorio'}
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
              className="flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          {!isEditing && (
            <div>
              <label
                htmlFor="activity-title"
                className="block text-sm font-semibold text-slate-700"
              >
                Actividad o tarea
              </label>
              <input
                id="activity-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ej. Pagar servicio de internet"
                autoFocus
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="activity-date"
                className="block text-sm font-semibold text-slate-700"
              >
                Fecha de ejecución
              </label>
              <button
                type="button"
                onClick={() => {
                  setExecutionDate(today);
                  if (error) setError('');
                }}
                className="text-xs font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
              >
                Usar fecha de hoy
              </button>
            </div>
            <input
              id="activity-date"
              type="date"
              value={executionDate}
              onChange={(e) => {
                setExecutionDate(e.target.value);
                if (error) setError('');
              }}
              className="mt-1.5 min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-base text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
            {executionDate < today && (
              <p className="mt-1.5 text-xs font-medium text-amber-700">
                Nota: Esta fecha es anterior a hoy. Para poder completarla deberás actualizarla a hoy o una fecha futura.
              </p>
            )}
          </div>

          {isEditing && (
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5">
              <input
                type="checkbox"
                checked={markCompletedOnSave}
                onChange={(e) => {
                  setMarkCompletedOnSave(e.target.checked);
                  if (error) setError('');
                }}
                className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-sm font-medium text-slate-800">
                Dar por completada la actividad al guardar
              </span>
            </label>
          )}

          <div className="pt-2 pb-safe">
            <button
              type="submit"
              className="min-h-[50px] w-full rounded-2xl bg-slate-900 px-5 py-3 text-base font-semibold text-white shadow-sm transition-transform duration-150 hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {isEditing
                ? markCompletedOnSave
                  ? 'Actualizar fecha y completar'
                  : 'Guardar nueva fecha'
                : 'Guardar actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
