import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { C, R, num } from '../theme';
import { useStore, currentMonth } from '../store';
import {
  CLASS_META, ClassType, MONTHS, MONTHS_SHORT, WEEKDAYS, dayKey, monthlyFee, paymentStatus, planOf, shortDate, unpaidMonths, euro, monthLabel, hhmm, addDays,
} from '../data';
import { Btn, Card, Chip, Empty, Header, Icon, Mark, MemberCode, Row, Screen, Section, Sheet, TabBar, Tag, Toast, Wordmark } from '../ui';
import { ClassCard, DayStrip } from '../shared';
import { PaySheet, ProfileScreen, ProgressScreen, WorkoutScreen, useMe } from './ClientMore';

export default function ClientApp() {
  const { s, toastMsg } = useStore();
  const [tab, setTab] = useState('home');
  const me = s.clients.find(c => c.id === s.session?.clientId)!;
  if (!me) return null;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {tab === 'home' && <Home go={setTab} />}
      {tab === 'classes' && <Classes />}
      {tab === 'workout' && <WorkoutScreen />}
      {tab === 'progress' && <ProgressScreen />}
      {tab === 'profile' && <ProfileScreen />}
      <TabBar active={tab} onChange={setTab} tabs={[
        { key: 'home', label: 'Início', icon: 'home' },
        { key: 'classes', label: 'Aulas', icon: 'calendar' },
        { key: 'workout', label: 'Treino', icon: 'barbell' },
        { key: 'progress', label: 'Progresso', icon: 'trending-up' },
        { key: 'profile', label: 'Perfil', icon: 'person', badge: paymentStatus(me, currentMonth()) === 'overdue' ? 1 : undefined },
      ]} />
      <Toast msg={toastMsg} />
    </View>
  );
}

function Home({ go }: { go: (t: string) => void }) {
  const { s, checkIn, readNotifications } = useStore();
  const me = useMe();
  const [qr, setQr] = useState(false);
  const [pay, setPay] = useState(false);
  const [notes, setNotes] = useState(false);
  const now = new Date();
  const month = currentMonth();
  const status = paymentStatus(me, month);
  const owed = unpaidMonths(me, month);
  const plan = planOf(s, me);
  const fee = monthlyFee(s, me);
  const unread = me.notifications.filter(n => !n.read).length;

  const myNext = s.classes.filter(c => !c.cancelled && c.attendees.includes(me.id) && new Date(c.start).getTime() + c.duration * 60000 > now.getTime()).slice(0, 3);
  const weekStart = addDays(now, -((now.getDay() + 6) % 7)); weekStart.setHours(0, 0, 0, 0);
  const thisWeek = me.checkins.filter(x => new Date(x) >= weekStart).length;
  const checkedToday = me.checkins.some(x => x.startsWith(dayKey(now)));
  const memberNo = String(Number(me.id.replace(/\D/g, '')) || 0).padStart(4, '0');

  return (
    <Screen>
      <Header eyebrow={me.name} title={`${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS_SHORT[now.getMonth()].toLowerCase()}`}
        right={
          <Pressable onPress={() => { setNotes(true); readNotifications(me.id); }} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`Notificações${unread ? `, ${unread} por ler` : ''}`}>
            <Icon name="notifications-outline" size={18} color={C.secondary} />
            {unread > 0 && <View style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold }} />}
          </Pressable>
        } />

      {/* Membership card — the screen's one gold object */}
      <View style={{ borderRadius: R.lg, padding: 20, backgroundColor: C.gold, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Wordmark size={16} color={C.onGold} />
          <Text style={{ color: C.onGold, opacity: 0.7, fontSize: 13 }}>{me.founder ? 'Sócio fundador' : 'Membro'}</Text>
        </Row>
        <Text style={{ color: C.onGold, fontSize: 24, lineHeight: 30, fontWeight: '500', marginTop: 32 }}>{plan.name}</Text>
        <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ color: C.onGold, opacity: 0.7, fontSize: 13 }}>{me.name}</Text>
          <Text style={{ color: C.onGold, opacity: 0.7, fontSize: 13, ...num }}>Nº {memberNo}</Text>
        </Row>
        <View style={{ height: 1, backgroundColor: 'rgba(20,18,16,0.15)', marginVertical: 16 }} />
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: C.onGold, opacity: 0.7, fontSize: 13 }}>
              {status === 'paid' ? `Mensalidade de ${MONTHS[now.getMonth()].toLowerCase()}` : owed.length > 1 ? `${owed.length} mensalidades em falta` : `Vence a ${me.dueDay} ${MONTHS_SHORT[now.getMonth()].toLowerCase()}`}
            </Text>
            <Text style={{ color: C.onGold, fontSize: 17, lineHeight: 24, fontWeight: '500', ...num }}>{status === 'paid' ? 'Paga' : euro(fee * owed.length)}</Text>
          </View>
          {status !== 'paid'
            ? <Pressable onPress={() => setPay(true)} style={({ pressed }) => [{ backgroundColor: C.onGold, height: 40, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }, pressed && { transform: [{ scale: 0.97 }] }]}><Text style={{ color: C.goldLight, fontWeight: '600', fontSize: 15 }}>Pagar</Text></Pressable>
            : <Icon name="checkmark-circle-outline" size={22} color={C.onGold} />}
        </Row>
      </View>
      {status === 'overdue' && (
        <Row style={{ marginTop: 12, padding: 12, borderRadius: R.md, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, gap: 8 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.danger }} />
          <Text style={{ color: C.secondary, flex: 1, fontSize: 13, lineHeight: 20 }}>Mensalidade em atraso. Regulariza para manteres as reservas</Text>
        </Row>
      )}

      {/* Quick actions */}
      <Row style={{ marginTop: 12 }}>
        <Card style={{ flex: 1, gap: 12 }} onPress={() => setQr(true)}>
          <Icon name="qr-code-outline" size={18} color={C.secondary} />
          <View>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '500' }}>Check-in</Text>
            <Row style={{ gap: 6 }}>
              {checkedToday ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.success }} /> : null}
              <Text style={{ color: C.muted, fontSize: 13 }}>{checkedToday ? 'Feito hoje' : 'Mostra na receção'}</Text>
            </Row>
          </View>
        </Card>
        <Card style={{ flex: 1, gap: 12 }} onPress={() => go('classes')}>
          <Icon name="calendar-outline" size={18} color={C.secondary} />
          <View>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '500' }}>Reservar</Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>Aulas e PT</Text>
          </View>
        </Card>
      </Row>

      {/* Weekly rhythm — the set-mark signature */}
      <Section title="Esta semana" action={thisWeek >= 3 ? 'Objetivo cumprido' : `${thisWeek} de 3 treinos`}>
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((l, i) => {
              const d = addDays(weekStart, i); const done = me.checkins.some(x => x.startsWith(dayKey(d)));
              const isToday = dayKey(d) === dayKey(now);
              return (
                <View key={i} style={{ alignItems: 'center', gap: 8 }}>
                  <Mark on={done} size={28} />
                  <Text style={{ color: isToday ? C.text : C.muted, fontSize: 12, fontWeight: isToday ? '500' : '400' }}>{l}</Text>
                </View>
              );
            })}
          </Row>
        </Card>
      </Section>

      <Section title="Próximas reservas" action="Horário" onAction={() => go('classes')}>
        {myNext.length ? myNext.map(c => <ClassCard key={c.id} c={c} highlight right={<Text style={{ color: C.muted, fontSize: 13, lineHeight: 24 }}>{dayKey(new Date(c.start)) === dayKey(now) ? 'Hoje' : shortDate(c.start)}</Text>} />)
          : <Card><Empty icon="calendar-outline" text="Ainda sem reservas" /></Card>}
      </Section>

      <Section title="Novidades do clube">
        {s.announcements.slice(0, 3).map(a => (
          <Card key={a.id} style={{ marginBottom: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}><Tag text={a.tag} /><Text style={{ color: C.muted, fontSize: 12, ...num }}>{shortDate(a.date)}</Text></Row>
            <Text style={{ color: C.text, fontWeight: '500', fontSize: 15, lineHeight: 22, marginTop: 12 }}>{a.title}</Text>
            <Text style={{ color: C.secondary, fontSize: 14, marginTop: 4, lineHeight: 20 }}>{a.body}</Text>
          </Card>
        ))}
      </Section>

      <Sheet visible={qr} onClose={() => setQr(false)} title="Check-in">
        <View style={{ alignItems: 'center', gap: 16 }}>
          <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: R.lg }}><MemberCode id={me.id} size={200} /></View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: C.text, fontWeight: '500', fontSize: 17 }}>{me.name}</Text>
            <Text style={{ color: C.muted, fontSize: 13, ...num }}>Nº {memberNo}</Text>
          </View>
          <Text style={{ color: C.secondary, textAlign: 'center', fontSize: 14, lineHeight: 20 }}>Mostra este código na receção para registares a entrada.</Text>
          <Btn title={checkedToday ? 'Check-in já feito hoje' : 'Simular leitura na receção'} disabled={checkedToday} onPress={() => { checkIn(me.id); setQr(false); }} style={{ alignSelf: 'stretch' }} />
        </View>
      </Sheet>

      <Sheet visible={notes} onClose={() => setNotes(false)} title="Notificações">
        {me.notifications.length ? me.notifications.map((n, i) => (
          <Row key={n.id} style={{ alignItems: 'flex-start', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.border }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={({ payment: 'card-outline', class: 'calendar-outline', news: 'megaphone-outline', workout: 'barbell-outline' } as const)[n.kind]} size={16} color={C.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '500' }}>{n.title}</Text>
              <Text style={{ color: C.secondary, fontSize: 14, marginTop: 2, lineHeight: 20 }}>{n.body}</Text>
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 4, ...num }}>{shortDate(n.date)} · {hhmm(n.date)}</Text>
            </View>
          </Row>
        )) : <Empty icon="notifications-off-outline" text="Sem notificações" />}
      </Sheet>

      <PaySheet visible={pay} onClose={() => setPay(false)} />
    </Screen>
  );
}

function Classes() {
  const { s, book, cancelBooking, toast } = useStore();
  const me = useMe();
  const [day, setDay] = useState(dayKey(new Date()));
  const [type, setType] = useState<ClassType | 'all'>('all');
  const list = useMemo(() => s.classes.filter(c => c.start.startsWith(day) && (type === 'all' || c.type === type)), [s.classes, day, type]);
  const myCount = s.classes.filter(c => !c.cancelled && c.attendees.includes(me.id) && new Date(c.start) > new Date()).length;

  return (
    <Screen>
      <Header eyebrow={myCount === 1 ? '1 reserva ativa' : `${myCount} reservas ativas`} title="Aulas" />
      <DayStrip value={day} onChange={setDay} />
      <Row style={{ marginTop: 16, marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Chip label="Todas" active={type === 'all'} onPress={() => setType('all')} />
        {(['forca', 'reformer', 'mobilidade'] as ClassType[]).map(t => <Chip key={t} label={CLASS_META[t].label} active={type === t} onPress={() => setType(t)} />)}
      </Row>
      {list.length === 0 && <Card><Empty icon="moon-outline" text="Sem aulas neste dia" /></Card>}
      {list.map(c => {
        const mine = c.attendees.includes(me.id); const waiting = c.waitlist.includes(me.id);
        const past = new Date(c.start) < new Date();
        const full = c.attendees.length >= c.capacity;
        return (
          <ClassCard key={c.id} c={c} highlight={mine} right={past || c.cancelled ? null : mine || waiting ? (
            <Btn small variant="danger" title={waiting ? 'Sair da espera' : 'Cancelar'} onPress={() => cancelBooking(c.id, me.id)} />
          ) : (
            <Btn small variant="ghost" title={full ? 'Lista de espera' : 'Reservar'} onPress={() => book(c.id, me.id)} />
          )} />
        );
      })}
      <Card style={{ marginTop: 8 }}>
        <Row>
          <Icon name="person-outline" size={18} color={C.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '500' }}>Sessão PT Studio</Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>Treino individual com o teu PT</Text>
          </View>
          <Btn small variant="ghost" title="Pedir" onPress={() => toast('Pedido enviado ao teu PT')} />
        </Row>
      </Card>
      <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 16 }}>Cancelamentos até 2 h antes da aula</Text>
    </Screen>
  );
}
