import {
  AlertTriangle,
  CalendarClock,
  Check,
  Plus,
  Trash2,
  ClipboardCheck,
} from 'lucide-react';
import { ActivityItem } from '../types/finance';
import { formatDisplayDate, getTodayISO } from '../utils/formatters';

interface ActivitiesModuleProps {
  activities: ActivityItem[];
  dateAlert: { activityId: string; title: string } | null;
  onDismissAlert: () => void;
  onToggleComplete: (activity: ActivityItem) => void;
  onOpenNewActivity: () => void;
  onOpenChangeDate: (activity: ActivityItem, completeAfter?: boolean) => void;
  onDeleteActivity: (id: string) => void;
}

export function ActivitiesModule({
  activities,
  dateAlert,
  onDismissAlert,
  onToggleComplete,
  onOpenNewActivity,
  onOpenChangeDate,
  onDeleteActivity,
}: ActivitiesModuleProps) {
  const totalCount = activities.length;
  const completedCount = activities.filter((a) => a.completed).length;
  const percentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const today = getTodayISO();

  // SVG Ring math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const alertedActivity = dateAlert
    ? activities.find((a) => a.id === dateAlert.activityId) ?? null
    : null;

  return (
    <section aria-label="Lista de tareas y actividades" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Actividades y tareas
          </h2>
          <p className="text-xs text-slate-500">
            Controla pagos pendientes y metas financieras
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewActivity}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-transform duration-150 hover:bg-slate-800 active:scale-[0.98] whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Nueva tarea</span>
        </button>
      </div>

      {/* Summary Card Above Task List with Percentage Ring + Visual Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4">
        <div className="flex items-center gap-4">
          {/* Percentage Circle */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <svg
              className="h-16 w-16 -rotate-90"
              viewBox="0 0 60 60"
              aria-hidden="true"
            >
              <circle
                cx="30"
                cy="30"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="6"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                fill="none"
                stroke="#059669"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
            </svg>
            <span className="absolute font-mono text-sm font-bold text-slate-900 tabular-nums">
              {percentage}%
            </span>
          </div>

          {/* Summary Text & Bar */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">
                Progreso de tareas
              </p>
              <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                {completedCount} de {totalCount}
              </span>
            </div>

            <div
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Porcentaje de tareas completadas"
            >
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              {totalCount === 0
                ? 'Sin actividades registradas'
                : percentage === 100
                ? 'Todas las actividades han sido completadas'
                : `${percentage}% de las tareas totales completadas`}
            </p>
          </div>
        </div>
      </div>

      {/* Execution Date Validation Alert */}
      {dateAlert && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-950">
                Cambio de fecha requerido
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">
                La fecha de ejecución de{' '}
                <strong className="font-semibold">«{dateAlert.title}»</strong>{' '}
                es menor a la fecha actual. Cambia primero la fecha de ejecución
                para proceder con el cambio respectivo y dar por completada la
                actividad.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {alertedActivity && (
                  <button
                    type="button"
                    onClick={() => onOpenChangeDate(alertedActivity, true)}
                    className="min-h-[40px] rounded-xl bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-800 whitespace-nowrap"
                  >
                    Cambiar fecha primero
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDismissAlert}
                  className="min-h-[40px] rounded-xl px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 whitespace-nowrap"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No hay actividades pendientes
            </p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Agrega pagos programados o metas de ahorro con fecha de ejecución.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activities.map((activity) => {
              const isPastDate = !activity.completed && activity.executionDate < today;
              const isAlerted = dateAlert?.activityId === activity.id;

              return (
                <li
                  key={activity.id}
                  className={`flex items-center justify-between gap-2 px-4 py-3.5 transition-colors ${
                    isAlerted ? 'bg-amber-50/60' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(activity)}
                      aria-label={
                        activity.completed
                          ? `Marcar «${activity.title}» como pendiente`
                          : `Completar «${activity.title}»`
                      }
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                        activity.completed
                          ? 'bg-emerald-50 text-emerald-700'
                          : isPastDate
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                          activity.completed
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : isPastDate
                            ? 'border-amber-500 bg-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {activity.completed && (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-semibold ${
                          activity.completed
                            ? 'text-slate-400 line-through'
                            : 'text-slate-900'
                        }`}
                      >
                        {activity.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span
                          className={
                            isPastDate
                              ? 'font-semibold text-amber-700'
                              : activity.completed
                              ? 'text-emerald-700 font-medium'
                              : 'text-slate-500'
                          }
                        >
                          {activity.completed
                            ? 'Completada'
                            : isPastDate
                            ? 'Fecha vencida'
                            : 'Programada'}
                        </span>
                        <span className="text-slate-400" aria-hidden="true">
                          ·
                        </span>
                        <span
                          className={
                            isPastDate
                              ? 'font-medium text-amber-700'
                              : 'text-slate-500'
                          }
                        >
                          {formatDisplayDate(activity.executionDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => onOpenChangeDate(activity, false)}
                      aria-label={`Cambiar fecha de ${activity.title}`}
                      title="Cambiar fecha de ejecución"
                      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors ${
                        isPastDate
                          ? 'text-amber-700 hover:bg-amber-100'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteActivity(activity.id)}
                      aria-label={`Eliminar ${activity.title}`}
                      title="Eliminar actividad"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
