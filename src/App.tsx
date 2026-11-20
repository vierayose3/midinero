import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  History,
  Home,
  Wallet,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  ActivityItem,
  AppTab,
  Movement,
  MovementType,
  ToastMessage,
} from './types/finance';
import {
  formatDisplayDate,
  getTodayISO,
  offsetDateISO,
} from './utils/formatters';
import { BalanceCard } from './components/BalanceCard';
import { MovementFormSheet } from './components/MovementFormSheet';
import { MovementHistory } from './components/MovementHistory';
import { ActivitiesModule } from './components/ActivitiesModule';
import { ActivityFormSheet } from './components/ActivityFormSheet';

const MOVEMENTS_STORAGE_KEY = 'mi_dinero_movements_v1';
const ACTIVITIES_STORAGE_KEY = 'mi_dinero_activities_v1';

function createInitialActivities(): ActivityItem[] {
  return [
    {
      id: 'act-1',
      title: 'Revisar presupuesto mensual',
      executionDate: getTodayISO(),
      completed: true,
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'act-2',
      title: 'Pagar servicio de internet',
      executionDate: offsetDateISO(-1),
      completed: false,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'act-3',
      title: 'Separar fondo de ahorro',
      executionDate: getTodayISO(),
      completed: false,
      createdAt: Date.now(),
    },
  ];
}

function loadStoredMovements(): Movement[] {
  try {
    const raw = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadStoredActivities(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (!raw) return createInitialActivities();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : createInitialActivities();
  } catch {
    return createInitialActivities();
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [movements, setMovements] = useState<Movement[]>(loadStoredMovements);
  const [activities, setActivities] = useState<ActivityItem[]>(
    loadStoredActivities
  );

  // Movement Form Sheet state
  const [movementSheetOpen, setMovementSheetOpen] = useState(false);
  const [movementSheetType, setMovementSheetType] =
    useState<MovementType>('income');

  // Activity Form Sheet state
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(
    null
  );
  const [completeAfterDateUpdate, setCompleteAfterDateUpdate] = useState(false);

  // Date validation alert state for activities
  const [dateAlert, setDateAlert] = useState<{
    activityId: string;
    title: string;
  } | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
    } catch {
      // Ignore storage quota errors
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    } catch {
      // Ignore storage quota errors
    }
  }, [activities]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (text: string, tone: ToastMessage['tone'] = 'success') => {
    setToast({ id: Date.now(), text, tone });
  };

  // Automatic Financial Calculations
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let incomeSum = 0;
    let expenseSum = 0;
    for (const m of movements) {
      if (m.type === 'income') {
        incomeSum += m.amount;
      } else {
        expenseSum += m.amount;
      }
    }
    const roundedIncome = Math.round(incomeSum * 100) / 100;
    const roundedExpense = Math.round(expenseSum * 100) / 100;
    const roundedBalance = Math.round((roundedIncome - roundedExpense) * 100) / 100;
    return {
      totalIncome: roundedIncome,
      totalExpense: roundedExpense,
      balance: roundedBalance,
    };
  }, [movements]);

  const pendingActivitiesCount = useMemo(
    () => activities.filter((a) => !a.completed).length,
    [activities]
  );

  // Handlers for Movements
  const handleOpenMovementSheet = (type: MovementType) => {
    setMovementSheetType(type);
    setMovementSheetOpen(true);
  };

  const handleSaveMovement = (payload: {
    type: MovementType;
    concept: string;
    amount: number;
    date: string;
  }) => {
    const newMovement: Movement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: payload.type,
      concept: payload.concept,
      amount: payload.amount,
      date: payload.date,
      createdAt: Date.now(),
    };
    setMovements((prev) => [newMovement, ...prev]);
    showToast(
      payload.type === 'income'
        ? 'Ingreso registrado correctamente'
        : 'Gasto registrado correctamente',
      'success'
    );
  };

  const handleDeleteMovement = (id: string) => {
    setMovements((prev) => prev.filter((item) => item.id !== id));
    showToast('Movimiento eliminado y saldo actualizado', 'success');
  };

  // Handlers for Activities & Date Validation
  const handleToggleActivityComplete = (activity: ActivityItem) => {
    const today = getTodayISO();

    // If trying to complete an activity whose executionDate is earlier than today
    if (!activity.completed && activity.executionDate < today) {
      setDateAlert({ activityId: activity.id, title: activity.title });
      showToast(
        'Cambia primero la fecha de ejecución para completar esta actividad.',
        'warning'
      );
      return;
    }

    setActivities((prev) =>
      prev.map((item) =>
        item.id === activity.id ? { ...item, completed: !item.completed } : item
      )
    );

    if (dateAlert?.activityId === activity.id) {
      setDateAlert(null);
    }

    showToast(
      activity.completed
        ? 'Actividad marcada como pendiente'
        : 'Actividad completada',
      'success'
    );
  };

  const handleOpenNewActivity = () => {
    setEditingActivity(null);
    setCompleteAfterDateUpdate(false);
    setActivitySheetOpen(true);
  };

  const handleOpenChangeDate = (
    activity: ActivityItem,
    completeAfter = false
  ) => {
    setEditingActivity(activity);
    setCompleteAfterDateUpdate(completeAfter);
    setActivitySheetOpen(true);
  };

  const handleSaveNewActivity = (payload: {
    title: string;
    executionDate: string;
  }) => {
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: payload.title,
      executionDate: payload.executionDate,
      completed: false,
      createdAt: Date.now(),
    };
    setActivities((prev) => [newActivity, ...prev]);
    showToast('Actividad registrada correctamente', 'success');
  };

  const handleUpdateActivityDate = (
    id: string,
    newDate: string,
    markCompleted: boolean
  ) => {
    const today = getTodayISO();
    if (markCompleted && newDate < today) {
      showToast(
        'La fecha debe ser igual o mayor a hoy para completar la actividad.',
        'warning'
      );
      return;
    }

    setActivities((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              executionDate: newDate,
              completed: markCompleted ? true : item.completed,
            }
          : item
      )
    );

    if (dateAlert?.activityId === id && newDate >= today) {
      setDateAlert(null);
    }

    showToast(
      markCompleted
        ? 'Fecha actualizada y actividad completada'
        : 'Fecha de ejecución actualizada',
      'success'
    );
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((item) => item.id !== id));
    if (dateAlert?.activityId === id) {
      setDateAlert(null);
    }
    showToast('Actividad eliminada', 'success');
  };

  const todayFormatted = formatDisplayDate(getTodayISO());

  return (
    <div className="min-h-dvh bg-[#F6F7F9] text-slate-900">
      {/* Compact Sticky Mobile & Desktop Top Bar (48px height) */}
      <header className="sticky top-0 z-30 h-12 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Wallet className="h-4 w-4" aria-hidden="true" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Mi Dinero
            </h1>
          </div>

          <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
            {todayFormatted}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6 md:pb-10 md:pt-6">
        {/* Mobile Tabbed Experience (< 768px) */}
        <div className="md:hidden">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <BalanceCard
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                balance={balance}
                onOpenIncome={() => handleOpenMovementSheet('income')}
                onOpenExpense={() => handleOpenMovementSheet('expense')}
              />

              <MovementHistory
                movements={movements}
                onDelete={handleDeleteMovement}
                previewLimit={4}
                onViewAll={() => setActiveTab('history')}
              />

              {/* Compact Quick Link to Activities on Home */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Actividades y tareas
                    </p>
                    <p className="text-xs text-slate-500">
                      {pendingActivitiesCount === 0
                        ? 'Todas tus tareas están al día'
                        : `${pendingActivitiesCount} ${
                            pendingActivitiesCount === 1
                              ? 'tarea pendiente'
                              : 'tareas pendientes'
                          }`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('activities')}
                    className="min-h-[44px] rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-200 whitespace-nowrap shrink-0"
                  >
                    Ver tareas
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <MovementHistory
              movements={movements}
              onDelete={handleDeleteMovement}
            />
          )}

          {activeTab === 'activities' && (
            <ActivitiesModule
              activities={activities}
              dateAlert={dateAlert}
              onDismissAlert={() => setDateAlert(null)}
              onToggleComplete={handleToggleActivityComplete}
              onOpenNewActivity={handleOpenNewActivity}
              onOpenChangeDate={handleOpenChangeDate}
              onDeleteActivity={handleDeleteActivity}
            />
          )}
        </div>

        {/* Tablet / Desktop Responsive Multi-Column View (>= 768px) */}
        <div className="hidden md:grid md:grid-cols-12 md:items-start md:gap-6">
          <div className="space-y-6 md:col-span-5">
            <BalanceCard
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              onOpenIncome={() => handleOpenMovementSheet('income')}
              onOpenExpense={() => handleOpenMovementSheet('expense')}
            />

            <ActivitiesModule
              activities={activities}
              dateAlert={dateAlert}
              onDismissAlert={() => setDateAlert(null)}
              onToggleComplete={handleToggleActivityComplete}
              onOpenNewActivity={handleOpenNewActivity}
              onOpenChangeDate={handleOpenChangeDate}
              onDeleteActivity={handleDeleteActivity}
            />
          </div>

          <div className="md:col-span-7">
            <MovementHistory
              movements={movements}
              onDelete={handleDeleteMovement}
            />
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (56px height + safe-area) */}
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md pb-safe md:hidden"
      >
        <div className="grid h-14 grid-cols-3 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            aria-current={activeTab === 'home' ? 'page' : undefined}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'home'
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Home
              className="h-5 w-5"
              strokeWidth={activeTab === 'home' ? 2.4 : 1.8}
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold tracking-tight">
              Inicio
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            aria-current={activeTab === 'history' ? 'page' : undefined}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'history'
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <History
              className="h-5 w-5"
              strokeWidth={activeTab === 'history' ? 2.4 : 1.8}
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold tracking-tight">
              Historial
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            aria-current={activeTab === 'activities' ? 'page' : undefined}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'activities'
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ClipboardList
              className="h-5 w-5"
              strokeWidth={activeTab === 'activities' ? 2.4 : 1.8}
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold tracking-tight">
              Actividades
            </span>
          </button>
        </div>
      </nav>

      {/* Toast Confirmation / Alert Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 left-4 right-4 z-50 mx-auto max-w-md md:bottom-6 md:left-auto md:right-6"
        >
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.tone === 'warning'
                ? 'bg-amber-900 text-amber-50'
                : toast.tone === 'error'
                ? 'bg-rose-700 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.tone === 'warning' ? (
                <AlertTriangle
                  className="h-4 w-4 shrink-0 text-amber-300"
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
              )}
              <span className="truncate">{toast.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Cerrar notificación"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Income / Expense Bottom Sheet Modal */}
      <MovementFormSheet
        isOpen={movementSheetOpen}
        type={movementSheetType}
        onClose={() => setMovementSheetOpen(false)}
        onSave={handleSaveMovement}
      />

      {/* Activity Create / Edit Date Bottom Sheet Modal */}
      <ActivityFormSheet
        isOpen={activitySheetOpen}
        editingActivity={editingActivity}
        completeAfterDateUpdate={completeAfterDateUpdate}
        onClose={() => setActivitySheetOpen(false)}
        onSaveNew={handleSaveNewActivity}
        onUpdateDate={handleUpdateActivityDate}
      />
    </div>
  );
}
