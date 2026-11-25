// Shared app state for both the client and the trainer app.
// Persisted locally (AsyncStorage) so the demo survives restarts. In production this
// would be replaced by a backend (e.g. Supabase/Firebase) — the action API stays the same.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState, Announcement, ClassSession, Client, Metric, Notification, PayMethod,
  ensureSchedule, localIso, monthKey, monthLabel, paymentStatus, seed, uid,
} from './data';

const KEY = 'pulse-app-state-v1';

interface Store {
  s: AppState;
  ready: boolean;
  toastMsg: string | null;
  toast: (msg: string) => void;
  login: (role: 'client' | 'trainer', clientId?: string) => void;
  logout: () => void;
  resetDemo: () => void;
  book: (classId: string, clientId: string) => void;
  cancelBooking: (classId: string, clientId: string) => void;
  markPaid: (clientId: string, month: string, method: PayMethod) => void;
  unmarkPaid: (clientId: string, month: string) => void;
  remind: (clientId: string, month: string) => void;
  remindAll: (month: string) => number;
  announce: (title: string, body: string, tag: string) => void;
  addClass: (c: Omit<ClassSession, 'id' | 'attendees' | 'waitlist'>) => void;
  cancelClass: (id: string) => void;
  addClient: (c: Pick<Client, 'name' | 'phone' | 'email' | 'planId' | 'founder' | 'goal'>) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addMetric: (clientId: string, m: Metric) => void;
  checkIn: (clientId: string) => void;
  logWorkout: (clientId: string, day: string) => void;
  readNotifications: (clientId: string) => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => useContext(Ctx)!;

const note = (title: string, body: string, kind: Notification['kind']): Notification =>
  ({ id: uid(), date: localIso(new Date()), title, body, read: false, kind });

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState>(() => seed());
  const [ready, setReady] = useState(false);
  const [toastMsg, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw) as AppState;
          saved.classes = ensureSchedule(saved.classes, saved.clients.map(c => c.id));
          setS(saved);
        }
      } catch { /* fall back to seed */ }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {});
  }, [s, ready]);

  const toast = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const mapClient = (id: string, f: (c: Client) => Client) =>
    setS(p => ({ ...p, clients: p.clients.map(c => (c.id === id ? f(c) : c)) }));

  const store = useMemo<Store>(() => ({
    s, ready, toastMsg, toast,
    login: (role, clientId) => setS(p => ({ ...p, session: { role, clientId } })),
    logout: () => setS(p => ({ ...p, session: null })),
    resetDemo: () => { setS({ ...seed(), session: s.session }); toast('Dados de demonstração repostos'); },

    book: (classId, clientId) => {
      const cls = s.classes.find(c => c.id === classId);
      if (!cls) return;
      const full = cls.attendees.length >= cls.capacity;
      setS(p => ({
        ...p, classes: p.classes.map(c => c.id !== classId ? c : full
          ? { ...c, waitlist: [...c.waitlist, clientId] }
          : { ...c, attendees: [...c.attendees, clientId] }),
      }));
      toast(full ? 'Ficaste em lista de espera' : 'Reserva confirmada');
    },
    cancelBooking: (classId, clientId) => {
      setS(p => ({
        ...p,
        classes: p.classes.map(c => {
          if (c.id !== classId) return c;
          let attendees = c.attendees.filter(x => x !== clientId);
          let waitlist = c.waitlist.filter(x => x !== clientId);
          if (attendees.length < c.capacity && waitlist.length) { attendees = [...attendees, waitlist[0]]; waitlist = waitlist.slice(1); }
          return { ...c, attendees, waitlist };
        }),
      }));
      toast('Reserva cancelada');
    },

    markPaid: (clientId, month, method) => {
      mapClient(clientId, c => {
        const exists = c.payments.some(x => x.month === month);
        const fee = Math.round(s.plans.find(pl => pl.id === c.planId)!.price * (c.founder ? 0.8 : 1) * 100) / 100;
        const payments = exists
          ? c.payments.map(x => x.month === month ? { ...x, paidAt: localIso(new Date()), method } : x)
          : [...c.payments, { month, amount: fee, paidAt: localIso(new Date()), method }];
        return { ...c, payments, notifications: [note('Pagamento recebido', `Mensalidade de ${monthLabel(month)} confirmada (${method}). Obrigado.`, 'payment'), ...c.notifications] };
      });
      toast(`Pagamento de ${monthLabel(month)} registado`);
    },
    unmarkPaid: (clientId, month) => {
      mapClient(clientId, c => ({ ...c, payments: c.payments.map(x => x.month === month ? { month: x.month, amount: x.amount } : x) }));
      toast('Pagamento anulado');
    },
    remind: (clientId, month) => {
      mapClient(clientId, c => ({ ...c, notifications: [note('Lembrete de pagamento', `A mensalidade de ${monthLabel(month)} ainda não foi paga. Podes pagar diretamente na app.`, 'payment'), ...c.notifications] }));
      toast('Lembrete enviado');
    },
    remindAll: (month) => {
      const targets = s.clients.filter(c => paymentStatus(c, month) === 'overdue').map(c => c.id);
      setS(p => ({
        ...p, clients: p.clients.map(c => targets.includes(c.id)
          ? { ...c, notifications: [note('Lembrete de pagamento', `A mensalidade de ${monthLabel(month)} está em atraso. Podes pagar diretamente na app.`, 'payment'), ...c.notifications] }
          : c),
      }));
      toast(targets.length ? `${targets.length} lembretes enviados` : 'Ninguém em atraso');
      return targets.length;
    },

    announce: (title, body, tag) => {
      const a: Announcement = { id: uid(), date: localIso(new Date()), title, body, tag };
      setS(p => ({ ...p, announcements: [a, ...p.announcements], clients: p.clients.map(c => ({ ...c, notifications: [note(title, body, 'news'), ...c.notifications] })) }));
      toast('Aviso publicado para todos os clientes');
    },
    addClass: (c) => {
      setS(p => ({ ...p, classes: [...p.classes, { ...c, id: uid(), attendees: [], waitlist: [] }].sort((a, b) => a.start.localeCompare(b.start)) }));
      toast('Aula criada');
    },
    cancelClass: (id) => {
      const cls = s.classes.find(c => c.id === id);
      setS(p => ({
        ...p,
        classes: p.classes.map(c => c.id === id ? { ...c, cancelled: true } : c),
        clients: p.clients.map(c => cls && cls.attendees.includes(c.id)
          ? { ...c, notifications: [note('Aula cancelada', `${cls.title} de ${cls.start.slice(8, 10)}/${cls.start.slice(5, 7)} às ${cls.start.slice(11, 16)} foi cancelada.`, 'class'), ...c.notifications] }
          : c),
      }));
      toast('Aula cancelada — clientes notificados');
    },
    addClient: (data) => {
      const today = new Date();
      const c: Client = {
        id: uid(), ...data, dueDay: Math.min(today.getDate(), 28), joined: localIso(today).slice(0, 10), notes: '',
        workoutId: null, payments: [], metrics: [], prs: [], checkins: [], workoutLog: [],
        notifications: [note('Bem-vindo ao Pulse', 'A tua conta está ativa. Reserva já a tua primeira aula.', 'news')],
      };
      setS(p => ({ ...p, clients: [c, ...p.clients] }));
      toast(`${data.name} adicionado`);
    },
    updateClient: (id, patch) => mapClient(id, c => ({ ...c, ...patch })),
    addMetric: (clientId, m) => { mapClient(clientId, c => ({ ...c, metrics: [...c.metrics, m] })); toast('Avaliação registada'); },
    checkIn: (clientId) => {
      const today = localIso(new Date()).slice(0, 10);
      const client = s.clients.find(c => c.id === clientId);
      if (client?.checkins.some(x => x.startsWith(today))) { toast('Check-in de hoje já registado'); return; }
      mapClient(clientId, c => ({ ...c, checkins: [localIso(new Date()), ...c.checkins] }));
      toast('Check-in registado');
    },
    logWorkout: (clientId, day) => {
      mapClient(clientId, c => ({ ...c, workoutLog: [{ date: localIso(new Date()), day }, ...c.workoutLog] }));
      toast('Treino concluído');
    },
    readNotifications: (clientId) => mapClient(clientId, c => ({ ...c, notifications: c.notifications.map(n => ({ ...n, read: true })) })),
  }), [s, ready, toastMsg, toast]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export const currentMonth = () => monthKey(new Date());
