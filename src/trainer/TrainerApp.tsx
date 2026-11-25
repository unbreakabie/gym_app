import React, { useMemo, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { C, R, font, num } from '../theme';
import { useStore, currentMonth } from '../store';
import {
  Client, PayMethod, PayStatus, MONTHS_SHORT, WEEKDAYS, dayKey, euro, localIso, monthLabel, monthlyFee, paymentStatus, planOf, shiftMonth, shortDate, unpaidMonths,
} from '../data';
import { Avatar, Btn, Card, Chip, Empty, Field, Header, Icon, Row, STATUS_COLOR, Screen, Section, Sheet, Stat, StatusBadge, TabBar, Tag, Toast } from '../ui';
import { ClassCard } from '../shared';
import { AnnouncementsScreen, ClassesAdmin, PaymentsScreen } from './TrainerMore';

export default function TrainerApp() {
  const { s, toastMsg } = useStore();
  const [tab, setTab] = useState('dash');
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<PayStatus | 'all'>('all');
  const overdue = s.clients.filter(c => paymentStatus(c, currentMonth()) === 'overdue').length;

  const openClients = (f: PayStatus | 'all') => { setClientFilter(f); setTab('clients'); setClientId(null); };
  const change = (t: string) => { setTab(t); setClientId(null); };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {clientId ? <ClientDetail id={clientId} onBack={() => setClientId(null)} /> : (
        <>
          {tab === 'dash' && <Dashboard openClient={setClientId} openClients={openClients} go={change} />}
          {tab === 'clients' && <Clients filter={clientFilter} setFilter={setClientFilter} open={setClientId} />}
          {tab === 'payments' && <PaymentsScreen open={setClientId} />}
          {tab === 'classes' && <ClassesAdmin />}
          {tab === 'news' && <AnnouncementsScreen />}
        </>
      )}
      <TabBar active={tab} onChange={change} tabs={[
        { key: 'dash', label: 'Painel', icon: 'grid' },
        { key: 'clients', label: 'Clientes', icon: 'people' },
        { key: 'payments', label: 'Pagamentos', icon: 'wallet', badge: overdue || undefined },
        { key: 'classes', label: 'Aulas', icon: 'calendar' },
        { key: 'news', label: 'Avisos', icon: 'megaphone' },
      ]} />
      <Toast msg={toastMsg} />
    </View>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ openClient, openClients, go }: { openClient: (id: string) => void; openClients: (f: PayStatus | 'all') => void; go: (t: string) => void }) {
  const { s, logout } = useStore();
  const now = new Date();
  const month = currentMonth();
  const st = s.clients.map(c => ({ c, st: paymentStatus(c, month), fee: monthlyFee(s, c) }));
  const paid = st.filter(x => x.st === 'paid');
  const pending = st.filter(x => x.st === 'pending');
  const overdue = st.filter(x => x.st === 'overdue');
  const received = paid.reduce((a, x) => a + (x.c.payments.find(p => p.month === month)?.amount ?? x.fee), 0);
  const expected = st.reduce((a, x) => a + x.fee, 0);
  const today = dayKey(now);
  const todayClasses = s.classes.filter(c => c.start.startsWith(today) && !c.cancelled);
  const checkinsToday = s.clients.filter(c => c.checkins.some(x => x.startsWith(today))).length;
  const inactive = s.clients.filter(c => !c.checkins.some(x => new Date(x) > new Date(now.getTime() - 10 * 864e5)));

  return (
    <Screen>
      <Header eyebrow={`${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS_SHORT[now.getMonth()].toLowerCase()}`} title="Painel"
        right={<Pressable onPress={logout} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Sair"><Icon name="log-out-outline" size={18} color={C.secondary} /></Pressable>} />

      {/* Revenue card */}
      <View style={{ borderRadius: R.lg, padding: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ color: C.muted, fontSize: 13 }}>Recebido em {monthLabel(month).toLowerCase()}</Text>
        <Row style={{ alignItems: 'flex-end', marginTop: 4, gap: 8 }}>
          <Text style={{ color: C.gold, fontSize: 36, lineHeight: 40, fontWeight: '500', ...num }}>{euro(received)}</Text>
          <Text style={{ color: C.muted, fontSize: 14, marginBottom: 4, ...num }}>de {euro(expected)}</Text>
        </Row>
        <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 16, gap: 2, backgroundColor: C.surface2 }}>
          <View style={{ flex: paid.length, backgroundColor: C.success }} />
          <View style={{ flex: pending.length, backgroundColor: C.warning }} />
          <View style={{ flex: overdue.length, backgroundColor: C.danger }} />
        </View>
        <Row style={{ marginTop: 16, justifyContent: 'space-between' }}>
          {([['paid', 'Pagos', paid.length], ['pending', 'Pendentes', pending.length], ['overdue', 'Em atraso', overdue.length]] as [PayStatus, string, number][]).map(([k, l, n]) => (
            <Pressable key={k} onPress={() => openClients(k)} style={{ alignItems: 'flex-start' }}>
              <Row style={{ gap: 6 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: STATUS_COLOR[k] }} /><Text style={{ color: C.muted, fontSize: 13 }}>{l}</Text></Row>
              <Text style={{ color: C.text, fontSize: 20, lineHeight: 28, fontWeight: '500', ...num }}>{n}</Text>
            </Pressable>
          ))}
        </Row>
      </View>

      <Row style={{ marginTop: 12 }}>
        <Stat label="Clientes ativos" value={String(s.clients.length)} sub={`${s.clients.filter(c => c.founder).length} sócios fundadores`} />
        <Stat label="Check-ins hoje" value={String(checkinsToday)} sub={`${todayClasses.reduce((a, c) => a + c.attendees.length, 0)} reservas hoje`} />
      </Row>

      {overdue.length > 0 && (
        <Section title="Pagamentos em atraso" action="Ver todos" onAction={() => go('payments')}>
          <Card style={{ paddingVertical: 4 }}>
          {overdue.slice(0, 3).map(({ c, fee }, i) => (
            <Pressable key={c.id} onPress={() => openClient(c.id)} style={({ pressed }) => ({ height: 64, justifyContent: 'center', borderTopWidth: i ? 1 : 0, borderTopColor: C.border, opacity: pressed ? 0.7 : 1 })}>
              <Row>
                <Avatar name={c.name} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 15 }}>{c.name}</Text>
                  <Text style={{ color: C.muted, fontSize: 13, ...num }}>{unpaidMonths(c, month).length === 1 ? '1 mês' : `${unpaidMonths(c, month).length} meses`} · {euro(fee * unpaidMonths(c, month).length)}</Text>
                </View>
                <Icon name="chevron-forward" size={16} color={C.faint} />
              </Row>
            </Pressable>
          ))}
          </Card>
        </Section>
      )}

      <Section title="Aulas de hoje" action="Gerir" onAction={() => go('classes')}>
        {todayClasses.length ? todayClasses.map(c => <ClassCard key={c.id} c={c} />) : <Card><Empty icon="moon-outline" text="Sem aulas hoje" /></Card>}
      </Section>

      {inactive.length > 0 && (
        <Section title="Sem treinar há mais de 10 dias">
          {inactive.slice(0, 4).map(c => (
            <Card key={c.id} onPress={() => openClient(c.id)} style={{ marginBottom: 8, padding: 12 }}>
              <Row><Avatar name={c.name} size={32} /><Text style={{ color: C.text, flex: 1, fontSize: 15 }}>{c.name}</Text><Tag text="Risco de abandono" color={C.warning} /></Row>
            </Card>
          ))}
        </Section>
      )}
    </Screen>
  );
}

/* ---------------- Clients list ---------------- */
function Clients({ filter, setFilter, open }: { filter: PayStatus | 'all'; setFilter: (f: PayStatus | 'all') => void; open: (id: string) => void }) {
  const { s, addClient } = useStore();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const month = currentMonth();
  const counts = { all: s.clients.length, paid: 0, pending: 0, overdue: 0 } as Record<string, number>;
  s.clients.forEach(c => counts[paymentStatus(c, month)]++);
  const list = useMemo(() => s.clients
    .filter(c => filter === 'all' || paymentStatus(c, month) === filter)
    .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)), [s.clients, filter, q, month]);

  return (
    <Screen>
      <Header eyebrow={`${s.clients.length} membros`} title="Clientes" right={<Btn small title="Novo" icon="add" onPress={() => setAdding(true)} />} />
      <Field label="Pesquisar" placeholder="Nome do cliente…" value={q} onChangeText={setQ} />
      <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <Chip label="Todos" count={counts.all} active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Pagos" count={counts.paid} active={filter === 'paid'} onPress={() => setFilter('paid')} />
        <Chip label="Pendentes" count={counts.pending} active={filter === 'pending'} onPress={() => setFilter('pending')} />
        <Chip label="Em atraso" count={counts.overdue} active={filter === 'overdue'} onPress={() => setFilter('overdue')} />
      </Row>
      {list.length === 0 && <Empty icon="people-outline" text="Nenhum cliente encontrado" />}
      {list.map(c => (
        <Card key={c.id} onPress={() => open(c.id)} style={{ marginBottom: 8, padding: 12 }}>
          <Row>
            <Avatar name={c.name} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '500' }}>{c.name}</Text>
              <Text style={{ color: C.muted, fontSize: 12 }}>{planOf(s, c).name}{c.founder ? ' · Fundador' : ''}</Text>
            </View>
            <StatusBadge status={paymentStatus(c, month)} />
          </Row>
        </Card>
      ))}
      <NewClientSheet visible={adding} onClose={() => setAdding(false)} onSave={addClient} />
    </Screen>
  );
}

function NewClientSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: ReturnType<typeof useStore>['addClient'] }) {
  const { s } = useStore();
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [planId, setPlan] = useState('essencial'); const [founder, setFounder] = useState(false); const [goal, setGoal] = useState('');
  return (
    <Sheet visible={visible} onClose={onClose} title="Novo cliente">
      <Field label="Nome" value={name} onChangeText={setName} placeholder="Nome completo" />
      <Field label="Telemóvel" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+351 9xx xxx xxx" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Objetivo" value={goal} onChangeText={setGoal} placeholder="Ex.: ganhar força" />
      <Text style={[font.label, { color: C.muted, marginBottom: 8 }]}>Plano</Text>
      <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {s.plans.map(p => <Chip key={p.id} label={`${p.name} · ${euro(p.price)}`} active={planId === p.id} onPress={() => setPlan(p.id)} />)}
      </Row>
      <Chip label="Sócio fundador · −20%" active={founder} onPress={() => setFounder(!founder)} />
      <Btn title="Adicionar cliente" icon="person-add" disabled={!name.trim()} style={{ marginTop: 18 }}
        onPress={() => { onSave({ name: name.trim(), phone, email, planId, founder, goal: goal || 'Saúde e bem-estar' }); setName(''); setPhone(''); setEmail(''); setGoal(''); onClose(); }} />
    </Sheet>
  );
}

/* ---------------- Client detail ---------------- */
function ClientDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { s, markPaid, unmarkPaid, remind, updateClient, addMetric, checkIn, toast } = useStore();
  const c = s.clients.find(x => x.id === id) as Client;
  const [payFor, setPayFor] = useState<string | null>(null);
  const [metricOpen, setMetricOpen] = useState(false);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [notes, setNotes] = useState(c?.notes ?? '');
  const [w, setW] = useState(''); const [f, setF] = useState('');
  if (!c) return null;
  const month = currentMonth();
  const status = paymentStatus(c, month);
  const plan = planOf(s, c);
  const fee = monthlyFee(s, c);
  const months = [0, 1, 2, 3, 4, 5].map(i => shiftMonth(month, -i)).filter(m => m >= c.joined.slice(0, 7));
  const upcoming = s.classes.filter(x => x.attendees.includes(c.id) && !x.cancelled && new Date(x.start) > new Date());
  const lastMetric = c.metrics[c.metrics.length - 1];
  const wk = s.workouts.find(x => x.id === c.workoutId);

  return (
    <Screen>
      <Header onBack={onBack} eyebrow="Ficha de cliente" title={c.name.split(' ')[0]} />
      <Row style={{ marginBottom: 16 }}>
        <Avatar name={c.name} size={60} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: C.text, fontWeight: '500', fontSize: 18 }}>{c.name}</Text>
          <Text style={{ color: C.muted }}>{c.phone}</Text>
          <Text style={{ color: C.muted, fontSize: 12 }}>Objetivo: {c.goal}</Text>
        </View>
      </Row>
      <Row style={{ marginBottom: 6 }}>
        <Btn small variant="dark" icon="call" title="Ligar" onPress={() => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`)} style={{ flex: 1 }} />
        <Btn small variant="dark" icon="logo-whatsapp" title="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${c.phone.replace(/\D/g, '')}`)} style={{ flex: 1 }} />
        <Btn small variant="dark" icon="scan" title="Check-in" onPress={() => checkIn(c.id)} style={{ flex: 1 }} />
      </Row>

      <Section title="Subscrição">
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: C.text, fontWeight: '500', fontSize: 17 }}>{plan.name}</Text>
              <Text style={{ color: C.muted, fontSize: 13 }}>{euro(fee)}/mês · renova dia {c.dueDay}{c.founder ? ' · Fundador -20%' : ''}</Text>
            </View>
            <StatusBadge status={status} />
          </Row>
          {status !== 'paid' && (
            <Row style={{ marginTop: 14 }}>
              <Btn small title="Marcar pago" icon="checkmark-done" onPress={() => setPayFor(month)} style={{ flex: 1 }} />
              <Btn small variant="ghost" title="Lembrete" icon="notifications" onPress={() => remind(c.id, month)} style={{ flex: 1 }} />
            </Row>
          )}
        </Card>
      </Section>

      <Section title="Histórico de pagamentos">
        <Card style={{ paddingVertical: 4 }}>
          {months.map((m, i) => {
            const st = paymentStatus(c, m); const p = c.payments.find(x => x.month === m);
            return (
              <Pressable key={m} onPress={() => st === 'paid' ? unmarkPaid(c.id, m) : setPayFor(m)} onLongPress={() => {}} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: '500' }}>{monthLabel(m)}</Text>
                  <Text style={{ color: C.muted, fontSize: 12 }}>{p?.paidAt ? `${p.method} · ${shortDate(p.paidAt)}` : 'Por pagar — toca para registar'}</Text>
                </View>
                <Text style={{ color: C.text, fontWeight: '500' }}>{euro(p?.amount ?? fee)}</Text>
                <StatusBadge status={st} />
              </Pressable>
            );
          })}
        </Card>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Toca num mês pago para anular o registo</Text>
      </Section>

      <Section title="Plano de treino" action="Alterar" onAction={() => setWorkoutOpen(true)}>
        <Card>
          {wk ? <><Text style={{ color: C.text, fontWeight: '500', fontSize: 16 }}>{wk.name}</Text><Text style={{ color: C.muted, marginTop: 2 }}>{wk.focus}</Text>
            <Text style={{ color: C.secondary, marginTop: 8, fontSize: 13, ...num }}>{c.workoutLog.length} treinos registados · último {c.workoutLog[0] ? shortDate(c.workoutLog[0].date) : '—'}</Text></>
            : <Text style={{ color: C.muted }}>Sem plano atribuído.</Text>}
        </Card>
      </Section>

      <Section title="Avaliação física" action="+ Nova" onAction={() => setMetricOpen(true)}>
        <Row>
          <Stat label="Peso" value={lastMetric ? `${lastMetric.weight}kg` : '—'} sub={lastMetric ? shortDate(lastMetric.date) : 'Sem registo'} />
          <Stat label="% Gordura" value={lastMetric ? `${lastMetric.fat}%` : '—'} />
          <Stat label="Check-ins" value={String(c.checkins.length)} sub="total" />
        </Row>
      </Section>

      <Section title={`Próximas aulas (${upcoming.length})`}>
        {upcoming.length ? upcoming.slice(0, 3).map(x => <ClassCard key={x.id} c={x} />) : <Text style={{ color: C.muted }}>Sem reservas.</Text>}
      </Section>

      <Section title="Notas privadas do PT">
        <Field label="Notas" multiline value={notes} onChangeText={setNotes} placeholder="Lesões, preferências, observações…" />
        <Btn small variant="ghost" title="Guardar notas" onPress={() => { updateClient(c.id, { notes }); toast('Notas guardadas'); }} style={{ alignSelf: 'flex-start' }} />
      </Section>

      <Sheet visible={!!payFor} onClose={() => setPayFor(null)} title="Registar pagamento">
        <Text style={{ color: C.muted, marginBottom: 6 }}>{c.name} · {payFor ? monthLabel(payFor) : ''}</Text>
        <Text style={{ color: C.text, fontSize: 28, fontWeight: '500', marginBottom: 16, ...num }}>{euro(fee)}</Text>
        <Text style={[font.label, { color: C.muted, marginBottom: 10 }]}>Método</Text>
        {(['MB WAY', 'Multibanco', 'Numerário', 'Cartão', 'Transferência'] as PayMethod[]).map(m => (
          <Btn key={m} variant="dark" title={m} onPress={() => { if (payFor) markPaid(c.id, payFor, m); setPayFor(null); }} style={{ marginBottom: 8 }} />
        ))}
      </Sheet>

      <Sheet visible={metricOpen} onClose={() => setMetricOpen(false)} title="Nova avaliação">
        <Field label="Peso (kg)" keyboardType="decimal-pad" value={w} onChangeText={setW} placeholder={lastMetric ? String(lastMetric.weight) : '70'} />
        <Field label="% Gordura" keyboardType="decimal-pad" value={f} onChangeText={setF} placeholder={lastMetric ? String(lastMetric.fat) : '20'} />
        <Btn title="Guardar" disabled={!w || isNaN(parseFloat(w.replace(',', '.')))} onPress={() => {
          addMetric(c.id, { date: localIso(new Date()), weight: parseFloat(w.replace(',', '.')), fat: parseFloat((f || '0').replace(',', '.')) });
          setW(''); setF(''); setMetricOpen(false);
        }} />
      </Sheet>

      <Sheet visible={workoutOpen} onClose={() => setWorkoutOpen(false)} title="Atribuir plano">
        {s.workouts.map(x => (
          <Card key={x.id} onPress={() => {
            updateClient(c.id, { workoutId: x.id, notifications: [{ id: String(Date.now()), date: localIso(new Date()), title: 'Novo plano de treino', body: `O teu PT atribuiu-te o plano "${x.name}".`, read: false, kind: 'workout' }, ...c.notifications] });
            setWorkoutOpen(false); toast('Plano atribuído e cliente notificado');
          }} style={{ marginBottom: 10, borderColor: x.id === c.workoutId ? 'rgba(245,241,234,0.2)' : C.border }}>
            <Text style={{ color: C.text, fontWeight: '500' }}>{x.name}</Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>{x.focus} · {x.days.length} treinos</Text>
          </Card>
        ))}
      </Sheet>
    </Screen>
  );
}
