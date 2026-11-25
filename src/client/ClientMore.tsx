import React, { useState } from 'react';
import { Linking, Pressable, Switch, Text, View } from 'react-native';
import { C, R, num, BRAND } from '../theme';
import { useStore, currentMonth } from '../store';
import {
  PayMethod, MONTHS_SHORT, WEEKDAYS_SHORT, addDays, dec, euro, monthLabel, monthlyFee, paymentStatus, planOf, shiftMonth, shortDate, unpaidMonths,
} from '../data';
import { Avatar, Btn, Card, Chip, Empty, Field, Header, Icon, IconName, Progress, Row, Screen, Section, Sheet, Stat, StatusBadge, Tag } from '../ui';

export const useMe = () => {
  const { s } = useStore();
  return s.clients.find(c => c.id === s.session?.clientId)!;
};

/* ---------------- Workout ----------------
   The session sheet: the PT's programme, with one tickable square per set (the screen's signature). */
const HAIRLINE = 'rgba(245,241,234,0.08)';
const PRESSED = { transform: [{ scale: 0.97 }] };

function SetMark({ on, onPress, label }: { on: boolean; onPress?: () => void; label?: string }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} hitSlop={4} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label}
      style={({ pressed }) => [{
        width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
        backgroundColor: on ? C.gold : C.surface2, borderWidth: 1, borderColor: on ? C.gold : HAIRLINE,
      }, pressed && PRESSED]}>
      {on ? <Icon name="checkmark" size={16} color={C.onGold} /> : null}
    </Pressable>
  );
}

export function WorkoutScreen() {
  const { s, logWorkout } = useStore();
  const me = useMe();
  const plan = s.workouts.find(w => w.id === me.workoutId);
  const [dayIdx, setDayIdx] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  if (!plan) return <Screen><Header title="Treino" /><Card><Empty icon="barbell-outline" text="O teu PT ainda não atribuiu um plano. Fala com ele na próxima sessão" /></Card></Screen>;

  const day = plan.days[dayIdx];
  const key = (ex: string, set: number) => `${dayIdx}-${ex}-${set}`;
  const total = day.exercises.reduce((a, e) => a + e.sets, 0);
  const setsDone = day.exercises.reduce((a, e) => a + Array.from({ length: e.sets }, (_, j) => done[key(e.name, j)]).filter(Boolean).length, 0);

  const now = new Date();
  const weekStart = addDays(now, -((now.getDay() + 6) % 7)); weekStart.setHours(0, 0, 0, 0);
  const weekSessions = me.workoutLog.filter(l => new Date(l.date) >= weekStart).length;
  const weekGoal = 3;

  const finish = () => {
    logWorkout(me.id, day.name);
    setDone(d => Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith(`${dayIdx}-`))));
  };

  return (
    <Screen>
      {/* Title */}
      <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>Plano do teu PT</Text>
      <Text style={{ color: C.text, fontSize: 28, lineHeight: 32, fontWeight: '500', marginTop: 4 }}>{plan.name}</Text>
      <Text style={{ color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 4 }}>{plan.focus}</Text>

      {/* Day switch */}
      <View style={{ flexDirection: 'row', marginTop: 24, padding: 4, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: HAIRLINE }} accessibilityRole="tablist">
        {plan.days.map((d, i) => {
          const on = i === dayIdx;
          return (
            <Pressable key={d.name} onPress={() => setDayIdx(i)} accessibilityRole="tab" accessibilityState={{ selected: on }}
              style={{ flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.surface2 : 'transparent', borderWidth: 1, borderColor: on ? HAIRLINE : 'transparent' }}>
              <Text style={{ color: on ? C.text : C.muted, fontSize: 14, fontWeight: '500' }}>{d.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Session sheet */}
      <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: HAIRLINE }}>
        <View style={{ padding: 20, paddingBottom: 16 }}>
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>Séries feitas</Text>
          <Text style={{ fontSize: 32, lineHeight: 36, fontWeight: '500', color: C.text, fontVariant: ['tabular-nums'], marginTop: 4 }}>
            <Text style={{ color: setsDone ? C.gold : C.text }}>{setsDone}</Text>
            <Text style={{ color: C.faint }}> / {total}</Text>
          </Text>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: C.surface2, marginTop: 16, overflow: 'hidden' }}>
            <View style={{ width: `${(setsDone / total) * 100}%`, height: 4, backgroundColor: C.gold }} />
          </View>
        </View>

        {day.exercises.map((e, i) => (
          <View key={e.name} style={{ paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: HAIRLINE }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Text style={{ width: 20, color: C.faint, fontSize: 15, lineHeight: 22, fontVariant: ['tabular-nums'] }}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 15, lineHeight: 22, fontWeight: '500' }}>{e.name}</Text>
                <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, fontVariant: ['tabular-nums'] }}>{e.sets} × {e.reps} · descanso {e.rest}</Text>
                {e.note ? (
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <Icon name="chatbubble-outline" size={14} color={C.muted} />
                    <Text style={{ color: C.sand, fontSize: 13, lineHeight: 20, flex: 1 }}>{e.note}</Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {Array.from({ length: e.sets }, (_, j) => {
                    const k = key(e.name, j); const on = !!done[k];
                    return <SetMark key={k} on={on} label={`${e.name}, série ${j + 1}`} onPress={() => setDone(d => ({ ...d, [k]: !on }))} />;
                  })}
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={finish} disabled={setsDone === 0}
        style={({ pressed }) => [{
          marginTop: 16, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
          backgroundColor: setsDone ? C.gold : C.surface2, borderWidth: 1, borderColor: setsDone ? C.gold : HAIRLINE,
        }, pressed && PRESSED]}>
        <Text style={{ color: setsDone ? C.onGold : C.muted, fontSize: 15, fontWeight: '600' }}>
          {setsDone === total ? 'Concluir treino' : setsDone ? `Concluir treino · ${setsDone} de ${total} séries` : 'Marca as séries que fizeste'}
        </Text>
      </Pressable>

      {/* History */}
      <View style={{ marginTop: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: C.text, fontSize: 17, lineHeight: 24, fontWeight: '500' }}>Histórico</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: C.muted, fontSize: 13, fontVariant: ['tabular-nums'] }}>{Math.min(weekSessions, weekGoal)} de {weekGoal} esta semana</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: weekGoal }, (_, i) => (
                <View key={i} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: i < weekSessions ? C.gold : C.surface2, borderWidth: 1, borderColor: i < weekSessions ? C.gold : HAIRLINE }} />
              ))}
            </View>
          </View>
        </View>
        <View style={{ marginTop: 8 }}>
          {me.workoutLog.length ? me.workoutLog.slice(0, 6).map((l, i) => {
            const d = new Date(l.date);
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', height: 44, borderTopWidth: i ? 1 : 0, borderTopColor: HAIRLINE }}>
                <Text style={{ color: C.text, fontSize: 15, flex: 1 }}>{l.day}</Text>
                <Text style={{ color: C.muted, fontSize: 13, fontVariant: ['tabular-nums'] }}>{WEEKDAYS_SHORT[d.getDay()]}, {shortDate(l.date)}</Text>
              </View>
            );
          }) : <Text style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>Ainda sem treinos registados</Text>}
        </View>
      </View>
    </Screen>
  );
}

/* ---------------- Progress ---------------- */
export function ProgressScreen() {
  const me = useMe();
  const m = me.metrics;
  const first = m[0], last = m[m.length - 1];
  const monthCheckins = me.checkins.filter(x => x.startsWith(currentMonth())).length;
  const max = Math.max(...m.map(x => x.weight)), min = Math.min(...m.map(x => x.weight));
  const since = first ? ` desde ${shortDate(first.date)}` : '';
  const signed = (n: number, unit: string) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${dec(Math.abs(n))} ${unit}`;

  return (
    <Screen>
      <Header eyebrow="A tua evolução" title="Progresso" />
      <Row>
        <Stat label="Peso" value={last ? `${dec(last.weight)} kg` : '—'} sub={first && last ? `${signed(last.weight - first.weight, 'kg')}${since}` : 'Sem avaliação'} />
        <Stat label="Massa gorda" value={last ? `${dec(last.fat)} %` : '—'} sub={first && last ? `${signed(last.fat - first.fat, 'pp')}${since}` : ' '} />
      </Row>
      <Row style={{ marginTop: 12 }}>
        <Stat label="Treinos este mês" value={String(monthCheckins)} sub="check-ins" />
        <Stat label="Total" value={String(me.checkins.length)} sub="desde a inscrição" />
      </Row>

      <Section title="Peso corporal" action={last ? `${dec(last.weight)} kg` : undefined}>
        <Card style={{ padding: 20 }}>
          {m.length ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 200, gap: 12 }}>
              {m.map((x, i) => {
                const lastOne = i === m.length - 1;
                const h = 40 + ((x.weight - min) / Math.max(max - min, 0.1)) * 112;
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: lastOne ? C.text : C.muted, fontSize: 12, ...num }}>{dec(x.weight)}</Text>
                    <View style={{ width: '100%', maxWidth: 28, height: h, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: lastOne ? C.gold : C.surface2 }} />
                    <Text style={{ color: C.muted, fontSize: 12, ...num }}>{shortDate(x.date)}</Text>
                  </View>
                );
              })}
            </View>
          ) : <Empty icon="analytics-outline" text="Faz a primeira avaliação física com o teu PT" />}
        </Card>
      </Section>

      <Section title="Recordes pessoais">
        <Card style={{ paddingVertical: 4 }}>
          {me.prs.length ? me.prs.map((p, i) => (
            <Row key={p.name} style={{ height: 56, borderTopWidth: i ? 1 : 0, borderTopColor: C.border }}>
              <Text style={{ color: C.text, flex: 1, fontSize: 15 }}>{p.name}</Text>
              <Text style={{ color: C.muted, fontSize: 13, ...num }}>{p.prev} →</Text>
              <Text style={{ color: C.text, fontSize: 17, fontWeight: '500', width: 64, textAlign: 'right', ...num }}>{p.value} kg</Text>
              <Text style={{ color: C.success, fontSize: 13, width: 52, textAlign: 'right', ...num }}>+{p.value - p.prev} kg</Text>
            </Row>
          )) : <Text style={{ color: C.muted, paddingVertical: 12 }}>Os teus recordes aparecem aqui</Text>}
        </Card>
      </Section>
    </Screen>
  );
}

/* ---------------- Profile ---------------- */
export function ProfileScreen() {
  const { s, logout, resetDemo, toast } = useStore();
  const me = useMe();
  const plan = planOf(s, me);
  const [pay, setPay] = useState(false);
  const [push, setPush] = useState(true);
  const [plansOpen, setPlansOpen] = useState(false);
  const month = currentMonth();
  const status = paymentStatus(me, month);
  const history = [0, 1, 2, 3].map(i => shiftMonth(month, -i)).filter(m => m >= me.joined.slice(0, 7));

  const link = (icon: IconName, label: string, onPress: () => void, color = C.text, first = false) => (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, borderTopWidth: first ? 0 : 1, borderTopColor: C.border, opacity: pressed ? 0.7 : 1 })}>
      <Icon name={icon} size={18} color={color === C.text ? C.muted : color} />
      <Text style={{ color, flex: 1, fontSize: 15 }}>{label}</Text>
      <Icon name="chevron-forward" size={16} color={C.faint} />
    </Pressable>
  );

  return (
    <Screen>
      <Row style={{ marginBottom: 24, gap: 16 }}>
        <Avatar name={me.name} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontSize: 20, lineHeight: 28, fontWeight: '500' }}>{me.name}</Text>
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>{me.email} · desde {shortDate(me.joined)}</Text>
        </View>
      </Row>

      <Card style={{ padding: 20 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: C.muted, fontSize: 13 }}>Subscrição</Text>
          <StatusBadge status={status} />
        </Row>
        <Text style={{ color: C.text, fontSize: 20, lineHeight: 28, fontWeight: '500', marginTop: 8 }}>{plan.name}</Text>
        <Row style={{ marginTop: 4, gap: 8 }}>
          <Text style={{ color: C.text, fontSize: 17, fontWeight: '500', ...num }}>{euro(monthlyFee(s, me))}<Text style={{ color: C.muted, fontSize: 13, fontWeight: '400' }}> / mês</Text></Text>
          {me.founder && <Tag text="Sócio fundador · −20%" />}
        </Row>
        <View style={{ marginTop: 16, gap: 8 }}>
          {plan.perks.map(p => <Row key={p} style={{ gap: 8 }}><Icon name="checkmark" size={16} color={C.muted} /><Text style={{ color: C.secondary, fontSize: 14 }}>{p}</Text></Row>)}
        </View>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 16 }}>Renova ao dia {me.dueDay} de cada mês</Text>
        <Row style={{ marginTop: 16, gap: 8 }}>
          {status !== 'paid' && <Btn title="Pagar" onPress={() => setPay(true)} style={{ flex: 1 }} />}
          <Btn title="Mudar plano" variant="ghost" onPress={() => setPlansOpen(true)} style={{ flex: 1 }} />
        </Row>
      </Card>

      <Section title="Pagamentos">
        <Card style={{ paddingVertical: 4 }}>
          {history.map((m, i) => {
            const st = paymentStatus(me, m); const p = me.payments.find(x => x.month === m);
            return (
              <Row key={m} style={{ height: 64, borderTopWidth: i ? 1 : 0, borderTopColor: C.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 15 }}>{monthLabel(m)}</Text>
                  <Text style={{ color: C.muted, fontSize: 13, ...num }}>{p?.paidAt ? `${p.method} · ${shortDate(p.paidAt)}` : `Vence a ${me.dueDay} ${MONTHS_SHORT[Number(m.slice(5)) - 1].toLowerCase()}`}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={{ color: C.text, fontSize: 15, ...num }}>{euro(p?.amount ?? monthlyFee(s, me))}</Text>
                  <StatusBadge status={st} />
                </View>
              </Row>
            );
          })}
        </Card>
      </Section>

      <Section title="Definições">
        <Card style={{ paddingVertical: 0 }}>
          <Row style={{ height: 48 }}>
            <Icon name="notifications-outline" size={18} color={C.muted} />
            <Text style={{ color: C.text, flex: 1, fontSize: 15 }}>Lembretes de aulas</Text>
            <Switch value={push} onValueChange={setPush} trackColor={{ true: C.gold, false: C.surface2 }} thumbColor="#fff" />
          </Row>
          {link('logo-instagram', '@pulsewclub', () => Linking.openURL('https://www.instagram.com/pulsewclub/'))}
          {link('location-outline', `${BRAND.name}, ${BRAND.city}`, () => Linking.openURL('https://maps.google.com/?q=Pulse+Wellness+Club+Beja'))}
          {link('document-text-outline', 'Regulamento e privacidade', () => toast('Regulamento interno do clube'))}
          {link('refresh-outline', 'Repor dados de demonstração', resetDemo)}
          {link('log-out-outline', 'Terminar sessão', logout, C.danger)}
        </Card>
      </Section>

      <PaySheet visible={pay} onClose={() => setPay(false)} />
      <Sheet visible={plansOpen} onClose={() => setPlansOpen(false)} title="Planos">
        {s.plans.map(p => {
          const current = p.id === me.planId;
          return (
            <Card key={p.id} style={{ marginBottom: 8, borderColor: current ? 'rgba(245,241,234,0.2)' : C.border }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: C.text, fontWeight: '500', fontSize: 17 }}>{p.name}</Text>
                <Text style={{ color: C.text, fontSize: 17, ...num }}>{euro(p.price)}</Text>
              </Row>
              <Text style={{ color: C.secondary, fontSize: 14, marginTop: 4 }}>{p.desc}</Text>
              {current ? <View style={{ marginTop: 12 }}><Tag text="Plano atual" color={C.gold} /></View>
                : <Btn small variant="ghost" title="Pedir alteração" onPress={() => { setPlansOpen(false); toast('Pedido enviado à equipa Pulse'); }} style={{ marginTop: 12, alignSelf: 'flex-start' }} />}
            </Card>
          );
        })}
      </Sheet>
    </Screen>
  );
}

/* ---------------- Payment sheet (demo: no real charge) ---------------- */
export function PaySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { s, markPaid } = useStore();
  const me = useMe();
  const [method, setMethod] = useState<PayMethod>('MB WAY');
  const [phone, setPhone] = useState(me.phone);
  const owed = unpaidMonths(me, currentMonth());
  const fee = monthlyFee(s, me);
  const ref = `${String(100 + Number(me.id.replace(/\D/g, '') || 7) * 37).padStart(3, '0')} ${String(400 + owed.length * 17)} ${currentMonth().slice(2).replace('-', '')}`;
  const line = (k: string, v: string) => (
    <Row style={{ justifyContent: 'space-between', height: 32 }}><Text style={{ color: C.muted, fontSize: 14 }}>{k}</Text><Text style={{ color: C.text, fontSize: 15, ...num }}>{v}</Text></Row>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title="Pagar mensalidade">
      {owed.length === 0 ? <Empty icon="checkmark-circle-outline" text="Está tudo pago" /> : (
        <>
          {owed.map(m => line(monthLabel(m), euro(fee)))}
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 12 }} />
          <Row style={{ justifyContent: 'space-between', marginBottom: 24 }}>
            <Text style={{ color: C.secondary, fontSize: 15 }}>Total</Text>
            <Text style={{ color: C.text, fontWeight: '500', fontSize: 28, ...num }}>{euro(fee * owed.length)}</Text>
          </Row>
          <Row style={{ gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {(['MB WAY', 'Multibanco', 'Cartão'] as PayMethod[]).map(m => <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />)}
          </Row>
          {method === 'MB WAY' && <Field label="Telemóvel MB WAY" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />}
          {method === 'Multibanco' && (
            <Card style={{ marginBottom: 16, paddingVertical: 8 }}>
              {line('Entidade', '21 312')}
              {line('Referência', ref)}
              {line('Valor', euro(fee * owed.length))}
            </Card>
          )}
          {method === 'Cartão' && <Text style={{ color: C.secondary, fontSize: 14, marginBottom: 16 }}>Vais ser redirecionado para o pagamento seguro com cartão.</Text>}
          <Btn title={method === 'Multibanco' ? 'Já paguei' : `Pagar ${euro(fee * owed.length)}`} onPress={() => { owed.forEach(m => markPaid(me.id, m, method)); onClose(); }} />
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 16, textAlign: 'center', marginTop: 12 }}>Demonstração: nenhum valor é cobrado</Text>
        </>
      )}
    </Sheet>
  );
}
