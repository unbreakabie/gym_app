// Types, demo seed data and date/payment helpers.

export type ClassType = 'forca' | 'reformer' | 'mobilidade' | 'pt';
export type PayMethod = 'MB WAY' | 'Multibanco' | 'Cartão' | 'Numerário' | 'Transferência';
export type PayStatus = 'paid' | 'pending' | 'overdue';

export interface Plan { id: string; name: string; price: number; desc: string; perks: string[] }
export interface Payment { month: string; amount: number; paidAt?: string; method?: PayMethod }
export interface Metric { date: string; weight: number; fat: number }
export interface PR { name: string; value: number; prev: number }
export interface Notification { id: string; date: string; title: string; body: string; read: boolean; kind: 'payment' | 'class' | 'news' | 'workout' }

export interface Client {
  id: string; name: string; phone: string; email: string;
  planId: string; founder: boolean; dueDay: number; joined: string;
  goal: string; notes: string; workoutId: string | null;
  payments: Payment[]; metrics: Metric[]; prs: PR[];
  checkins: string[]; workoutLog: { date: string; day: string }[];
  notifications: Notification[];
}

export interface ClassSession {
  id: string; type: ClassType; title: string; coach: string;
  start: string; duration: number; capacity: number;
  attendees: string[]; waitlist: string[]; cancelled?: boolean;
}

export interface Exercise { name: string; sets: number; reps: string; rest: string; note?: string }
export interface WorkoutTemplate { id: string; name: string; focus: string; days: { name: string; exercises: Exercise[] }[] }
export interface Announcement { id: string; date: string; title: string; body: string; tag: string }

export interface AppState {
  version: number;
  plans: Plan[];
  clients: Client[];
  classes: ClassSession[];
  workouts: WorkoutTemplate[];
  announcements: Announcement[];
  session: { role: 'client' | 'trainer'; clientId?: string } | null;
}

/* ---------------- date helpers ---------------- */
const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const shiftMonth = (key: string, n: number) => {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + n, 1));
};
export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const monthLabel = (key: string) => { const [y, m] = key.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
export const hhmm = (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const shortDate = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`; };
export const euro = (n: number) => { const [i, d] = n.toFixed(2).split('.'); return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${d} €`; };
export const dec = (n: number, digits = 1) => n.toFixed(digits).replace('.', ',');
export const uid = () => Math.random().toString(36).slice(2, 10);
export const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();

/* ---------------- payments ---------------- */
export const planOf = (s: AppState, c: Client) => s.plans.find(p => p.id === c.planId)!;
export const monthlyFee = (s: AppState, c: Client) => Math.round(planOf(s, c).price * (c.founder ? 0.8 : 1) * 100) / 100;

export function paymentStatus(c: Client, month: string, today = new Date()): PayStatus {
  const p = c.payments.find(x => x.month === month);
  if (p?.paidAt) return 'paid';
  const cur = monthKey(today);
  if (month < cur) return 'overdue';
  if (month > cur) return 'pending';
  return today.getDate() > c.dueDay ? 'overdue' : 'pending';
}
export const STATUS_LABEL: Record<PayStatus, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Em atraso' };

/** Months a client owes (from their join month up to and including `upTo`). */
export function unpaidMonths(c: Client, upTo: string, today = new Date()) {
  const out: string[] = [];
  let m = c.joined.slice(0, 7);
  while (m <= upTo) { if (paymentStatus(c, m, today) !== 'paid') out.push(m); m = shiftMonth(m, 1); }
  return out;
}

/* ---------------- class schedule ---------------- */
const TEMPLATE: Record<number, [string, ClassType, string, string, number, number][]> = {};
const weekday: [string, ClassType, string, string, number, number][] = [
  ['07:00', 'forca', 'Treino de Força', 'Mike', 50, 10],
  ['08:15', 'reformer', 'Pilates Reformer', 'Nídia', 50, 6],
  ['12:30', 'reformer', 'Reformer Express', 'Nídia', 40, 6],
  ['13:00', 'forca', 'Força Express', 'Mike', 40, 10],
  ['18:00', 'forca', 'Treino de Força', 'Mike', 50, 10],
  ['19:00', 'reformer', 'Pilates Reformer', 'Nídia', 50, 6],
  ['20:00', 'mobilidade', 'Mobilidade & Core', 'Nídia', 45, 12],
];
[1, 2, 3, 4, 5].forEach(d => (TEMPLATE[d] = weekday));
TEMPLATE[6] = [
  ['09:00', 'forca', 'Treino de Força', 'Mike', 60, 12],
  ['10:15', 'reformer', 'Pilates Reformer', 'Nídia', 50, 6],
  ['11:15', 'mobilidade', 'Mobilidade & Core', 'Nídia', 45, 12],
];
TEMPLATE[0] = [];

export const CLASS_META: Record<ClassType, { label: string; icon: string }> = {
  forca: { label: 'Força', icon: 'barbell' },
  reformer: { label: 'Reformer', icon: 'body' },
  mobilidade: { label: 'Mobilidade', icon: 'leaf' },
  pt: { label: 'PT Studio', icon: 'person' },
};

function hash(s: string) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

/** Adds template classes for any of the next 8 days that has none yet. */
export function ensureSchedule(classes: ClassSession[], clientIds: string[], today = new Date()): ClassSession[] {
  const out = [...classes];
  for (let i = 0; i < 8; i++) {
    const d = addDays(today, i);
    const key = dayKey(d);
    if (out.some(c => c.start.startsWith(key))) continue;
    for (const [time, type, title, coach, duration, capacity] of TEMPLATE[d.getDay()]) {
      const [h, m] = time.split(':').map(Number);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
      const id = `${key}-${time}-${type}`;
      const n = hash(id) % (capacity + 1);
      const pool = clientIds.filter(x => x !== 'c1');
      const attendees = pool.filter((_, j) => (hash(id + j) % 3) === 0).slice(0, Math.min(n, capacity));
      out.push({ id, type, title, coach, start: localIso(start), duration, capacity, attendees, waitlist: [] });
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}
const localIso = (d: Date) => `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
export { localIso };

/* ---------------- seed ---------------- */
const PLANS: Plan[] = [
  { id: 'essencial', name: 'Pulse Força', price: 45, desc: 'Treino de Força em grupo, ilimitado', perks: ['Aulas de Força ilimitadas', 'Avaliação física trimestral', 'Plano de treino na app'] },
  { id: 'reformer', name: 'Pulse Reformer', price: 60, desc: 'Pilates Reformer 2x por semana', perks: ['8 aulas Reformer / mês', 'Turmas até 6 pessoas', 'Mobilidade & Core incluída'] },
  { id: 'total', name: 'Pulse Total', price: 79, desc: 'Força + Reformer, acesso total', perks: ['Força ilimitada', '8 aulas Reformer / mês', 'Avaliação mensal', 'Prioridade em lista de espera'] },
  { id: 'pt', name: 'PT Studio', price: 160, desc: 'Personal Training, 8 sessões / mês', perks: ['8 sessões individuais', 'Plano 100% personalizado', 'Acompanhamento nutricional', 'Acesso a todas as aulas'] },
];

const WORKOUTS: WorkoutTemplate[] = [
  {
    id: 'forca-base', name: 'Força — Base', focus: 'Construir força e técnica, 3x por semana',
    days: [
      { name: 'Treino A', exercises: [
        { name: 'Agachamento com barra', sets: 4, reps: '6-8', rest: '2 min', note: 'Controlar a descida, 3 s' },
        { name: 'Supino com halteres', sets: 3, reps: '8-10', rest: '90 s' },
        { name: 'Remada curvada', sets: 3, reps: '10', rest: '90 s' },
        { name: 'Prancha', sets: 3, reps: '40 s', rest: '45 s' },
      ] },
      { name: 'Treino B', exercises: [
        { name: 'Peso morto romeno', sets: 4, reps: '8', rest: '2 min', note: 'Costas neutras' },
        { name: 'Press militar', sets: 3, reps: '8', rest: '90 s' },
        { name: 'Lunge búlgaro', sets: 3, reps: '10 / perna', rest: '60 s' },
        { name: 'Farmer walk', sets: 3, reps: '30 m', rest: '60 s' },
      ] },
    ],
  },
  {
    id: 'longevidade', name: 'Saúde & Longevidade', focus: 'Força funcional, mobilidade e equilíbrio',
    days: [
      { name: 'Treino A', exercises: [
        { name: 'Goblet squat', sets: 3, reps: '10', rest: '75 s' },
        { name: 'Hip thrust', sets: 3, reps: '12', rest: '75 s' },
        { name: 'Puxada na polia', sets: 3, reps: '12', rest: '60 s' },
        { name: 'Dead bug', sets: 3, reps: '10 / lado', rest: '45 s' },
      ] },
      { name: 'Treino B', exercises: [
        { name: 'Step-up', sets: 3, reps: '10 / perna', rest: '60 s' },
        { name: 'Flexões inclinadas', sets: 3, reps: '10', rest: '60 s' },
        { name: 'Remada unilateral', sets: 3, reps: '12', rest: '60 s' },
        { name: 'Equilíbrio unipodal', sets: 3, reps: '30 s', rest: '30 s' },
      ] },
    ],
  },
  {
    id: 'performance', name: 'Performance', focus: 'Potência e força máxima, 4x por semana',
    days: [
      { name: 'Inferior', exercises: [
        { name: 'Back squat', sets: 5, reps: '5', rest: '3 min' },
        { name: 'Box jump', sets: 4, reps: '5', rest: '90 s' },
        { name: 'Nordic curl', sets: 3, reps: '6', rest: '90 s' },
      ] },
      { name: 'Superior', exercises: [
        { name: 'Supino', sets: 5, reps: '5', rest: '3 min' },
        { name: 'Elevações', sets: 4, reps: 'Máx', rest: '2 min' },
        { name: 'Press militar', sets: 3, reps: '6', rest: '2 min' },
      ] },
    ],
  },
];

const NAMES: [string, string, boolean, number, string][] = [
  // name, plan, founder, dueDay, pay pattern for [m-2, m-1, m] (P = paid)
  ['Joana Matos', 'total', true, 28, 'PP-'],
  ['Ricardo Pereira', 'pt', false, 5, 'PPP'],
  ['Sofia Carvalho', 'reformer', false, 8, 'PPP'],
  ['Miguel Santos', 'essencial', false, 8, 'PP-'],
  ['Inês Gonçalves', 'reformer', true, 10, 'PPP'],
  ['Tiago Rosa', 'total', false, 15, 'PP-'],
  ['Marta Lopes', 'reformer', false, 30, 'PP-'],
  ['Bruno Correia', 'essencial', true, 3, 'PPP'],
  ['Catarina Dias', 'pt', false, 1, 'PPP'],
  ['Pedro Martins', 'essencial', false, 8, 'P--'],
  ['Rita Nunes', 'total', true, 12, 'PPP'],
  ['Hugo Silva', 'essencial', false, 29, 'PP-'],
  ['Beatriz Costa', 'reformer', false, 20, 'PPP'],
  ['Luís Fernandes', 'total', false, 7, 'PPP'],
];
const GOALS = ['Ganhar força', 'Perder gordura', 'Saúde e longevidade', 'Melhorar postura', 'Performance desportiva', 'Recuperar de lesão'];
const METHODS: PayMethod[] = ['MB WAY', 'Multibanco', 'Cartão', 'MB WAY', 'Numerário'];

export function seed(today = new Date()): AppState {
  const cur = monthKey(today);
  const months = [shiftMonth(cur, -2), shiftMonth(cur, -1), cur];
  const clients: Client[] = NAMES.map(([name, planId, founder, dueDay, pattern], i) => {
    const plan = PLANS.find(p => p.id === planId)!;
    const amount = Math.round(plan.price * (founder ? 0.8 : 1) * 100) / 100;
    const first = name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const payments: Payment[] = months.map((m, k) => {
      const [y, mm] = m.split('-').map(Number);
      return pattern[k] === 'P'
        ? { month: m, amount, paidAt: localIso(new Date(y, mm - 1, Math.max(1, dueDay - 2), 10)), method: METHODS[(i + k) % METHODS.length] }
        : { month: m, amount };
    });
    const checkins = Array.from({ length: 6 + (i % 7) }, (_, k) => localIso(addDays(today, -(k * 3 + (i % 3)))));
    return {
      id: `c${i + 1}`, name, phone: `+351 9${1 + (i % 6)}${i % 10} ${String(100 + i * 37).slice(-3)} ${String(200 + i * 53).slice(-3)}`,
      email: `${first}.exemplo@mail.pt`, planId, founder, dueDay,
      joined: `${months[0]}-0${1 + (i % 8)}`, goal: GOALS[i % GOALS.length], notes: '',
      workoutId: WORKOUTS[i % WORKOUTS.length].id, payments,
      metrics: [], prs: [], checkins, workoutLog: [], notifications: [],
    };
  });

  // Rich profile for the demo client (Joana)
  const j = clients[0];
  j.goal = 'Ganhar força e perder gordura';
  j.notes = 'Ligeiro desconforto no joelho esquerdo — evitar saltos. Muito consistente às terças e quintas.';
  j.metrics = [0, 1, 2, 3, 4, 5].map(k => ({
    date: localIso(addDays(today, -75 + k * 15)),
    weight: [68.4, 67.9, 67.1, 66.8, 66.2, 65.9][k],
    fat: [29.1, 28.6, 27.9, 27.4, 26.9, 26.5][k],
  }));
  j.prs = [
    { name: 'Agachamento', value: 65, prev: 50 },
    { name: 'Peso morto', value: 80, prev: 60 },
    { name: 'Hip thrust', value: 100, prev: 70 },
  ];
  j.workoutLog = [2, 4, 7, 9, 11, 14].map((k, n) => ({ date: localIso(addDays(today, -k)), day: n % 2 ? 'Treino B' : 'Treino A' }));
  j.workoutId = 'forca-base';
  j.notifications = [
    { id: uid(), date: localIso(addDays(today, -1)), title: 'Novo plano de treino', body: 'O Mike atualizou o teu plano "Força — Base".', read: false, kind: 'workout' },
    { id: uid(), date: localIso(addDays(today, -3)), title: 'Black Friday no Pulse', body: 'Traz um amigo: 30% na inscrição até domingo.', read: true, kind: 'news' },
  ];

  const ids = clients.map(c => c.id);
  let classes = ensureSchedule([], ids, today);
  // Joana has two bookings
  const book = (dayOffset: number, time: string) => {
    const k = `${dayKey(addDays(today, dayOffset))}-${time}`;
    const cls = classes.find(c => c.id.startsWith(k));
    if (cls && !cls.attendees.includes('c1')) { if (cls.attendees.length >= cls.capacity) cls.attendees.pop(); cls.attendees.push('c1'); }
  };
  book(0, '19:00'); book(1, '18:00'); book(2, '19:00');
  classes = classes.map(c => c);

  return {
    version: 1, plans: PLANS, clients, classes, workouts: WORKOUTS, session: null,
    announcements: [
      { id: uid(), date: localIso(addDays(today, -2)), tag: 'Campanha', title: 'Black Friday no Pulse', body: 'Inscrições com 29% e 30% de desconto até domingo. Traz um amigo e treinem juntos.' },
      { id: uid(), date: localIso(addDays(today, -6)), tag: 'Horário', title: 'Novo horário de Sábado', body: 'A partir deste sábado temos Mobilidade & Core às 11:15.' },
      { id: uid(), date: localIso(addDays(today, -12)), tag: 'Workshop', title: 'Força para a Longevidade', body: 'Os nossos fisiologistas explicam porque a força é o melhor investimento na tua saúde. Inscrições na receção.' },
    ],
  };
}
