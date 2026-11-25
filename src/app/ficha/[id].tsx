import React, { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store';
import { C, F, num } from '../../theme';
import {
  Avatar, Body, Btn, Card, Chip, Empty, Field, ListRow, PayPill, Pill, RiskPill, Row, Screen, SectionTitle, Small, Strong,
} from '../../ui';
import { whatsappUrl } from '../../trainer';
import {
  activityDays, daysSince, dec, euro, localIso, monthKey, monthLabel, monthlyFee, paymentStatus, planOf, riskOf, shiftMonth,
  shortDate, streakInfo, uid,
} from '../../data';

type Tab = 'resumo' | 'treino' | 'avaliacoes' | 'pagamentos' | 'notas';
const TABS: { key: Tab; label: string }[] = [
  { key: 'resumo', label: 'Resumo' }, { key: 'treino', label: 'Treino' }, { key: 'avaliacoes', label: 'Avaliações' },
  { key: 'pagamentos', label: 'Pagamentos' }, { key: 'notas', label: 'Notas' },
];

export default function Ficha() {
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const { s, updateClient, addMetric, markPaid, unmarkPaid, remind, checkIn, toast } = useStore();
  const c = s.clients.find(x => x.id === id);
  const [tab, setTab] = useState<Tab>(initialTab ?? 'resumo');
  const [notes, setNotes] = useState(c?.notes ?? '');
  const [weight, setWeight] = useState('');
  const [fat, setFat] = useState('');
  const back = () => (router.canGoBack() ? router.back() : router.replace('/pt/clientes'));
  if (!c) return <Screen title="Cliente" onBack={back}><Empty icon="person-outline" text="Cliente não encontrado." /></Screen>;

  const cur = monthKey(new Date());
  const risk = riskOf(c);
  const st = streakInfo(c);
  const days = activityDays(c);
  const last = days[days.length - 1];
  const plan = planOf(s, c);
  const months = [0, -1, -2, -3, -4, -5].map(k => shiftMonth(cur, k)).filter(m => m >= c.joined.slice(0, 7));

  const assign = (workoutId: string) => {
    const w = s.workouts.find(x => x.id === workoutId)!;
    updateClient(c.id, {
      workoutId,
      notifications: [{ id: uid(), date: localIso(new Date()), title: 'Novo plano de treino', body: `O teu PT atribuiu-te o plano "${w.name}".`, read: false, kind: 'workout' }, ...c.notifications],
    });
    toast(`Plano "${w.name}" atribuído`);
  };
  const saveMetric = () => {
    const wv = parseFloat(weight.replace(',', '.')), fv = parseFloat(fat.replace(',', '.'));
    if (!(wv > 20 && wv < 300) || !(fv > 2 && fv < 70)) { toast('Confirma o peso (kg) e a % de gordura'); return; }
    addMetric(c.id, { date: localIso(new Date()), weight: wv, fat: fv });
    setWeight(''); setFat('');
  };

  return (
    <Screen onBack={back} title={c.name} eyebrow={`${plan.name}${c.founder ? ' · Founding Member' : ''}`} bottomPad={40}>
      <Row>
        <Avatar name={c.name} size={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <Small>{c.phone} · {c.email}</Small>
          <Row style={{ gap: 6 }}><PayPill status={paymentStatus(c, cur)} /><RiskPill level={risk.level} /></Row>
        </View>
      </Row>
      <Row style={{ flexWrap: 'wrap', gap: 8 }}>
        <Btn title="Ligar" icon="call-outline" small variant="outline" onPress={() => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`)} />
        <Btn title="WhatsApp" icon="logo-whatsapp" small variant="outline" onPress={() => Linking.openURL(whatsappUrl(c.phone, `Olá ${c.name.split(' ')[0]}!`))} />
        <Btn title="Check-in" icon="checkmark" small variant="outline" onPress={() => checkIn(c.id)} />
      </Row>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {TABS.map(t => <Chip key={t.key} label={t.label} active={tab === t.key} onPress={() => setTab(t.key)} />)}
      </ScrollView>

      {tab === 'resumo' && <>
        <Card style={{ gap: 12 }}>
          <Row style={{ justifyContent: 'space-between' }}><Small>Objetivo</Small><Strong style={{ fontSize: 15, flexShrink: 1, textAlign: 'right' }}>{c.goal}</Strong></Row>
          <Row style={{ justifyContent: 'space-between' }}><Small>Esta semana</Small><Strong style={[{ fontSize: 15 }, num]}>{st.done} de {st.goal} treinos</Strong></Row>
          <Row style={{ justifyContent: 'space-between' }}><Small>Sequência</Small><Strong style={[{ fontSize: 15 }, num]}>{st.streak} semanas</Strong></Row>
          <Row style={{ justifyContent: 'space-between' }}><Small>Último treino</Small><Strong style={[{ fontSize: 15 }, num]}>{last ? `${shortDate(last)} · ${daysSince(last) === 0 ? 'hoje' : daysSince(last) === 1 ? 'ontem' : `há ${daysSince(last)} dias`}` : 'Ainda não treinou'}</Strong></Row>
          <Row style={{ justifyContent: 'space-between' }}><Small>Treinos no total</Small><Strong style={[{ fontSize: 15 }, num]}>{days.length}</Strong></Row>
          {c.contactedAt && <Row style={{ justifyContent: 'space-between' }}><Small>Contactado</Small><Strong style={{ fontSize: 15 }}>{shortDate(c.contactedAt)}</Strong></Row>}
        </Card>
        <SectionTitle title="Plano" />
        <Card>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {s.plans.map(p => <Chip key={p.id} label={p.name} active={p.id === c.planId} onPress={() => { updateClient(c.id, { planId: p.id }); toast(`Plano mudado para ${p.name}`); }} />)}
          </ScrollView>
          <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
            <Small>{euro(monthlyFee(s, c))} / mês · vence a {c.dueDay}</Small>
            <Btn title={c.founder ? 'Founding: sim' : 'Founding: não'} small variant="ghost" onPress={() => updateClient(c.id, { founder: !c.founder })} />
          </Row>
        </Card>
      </>}

      {tab === 'treino' && <>
        <Small style={{ paddingHorizontal: 4 }}>Escolhe o plano. O cliente recebe uma notificação.</Small>
        {s.workouts.map(w => (
          <Card key={w.id} onPress={() => assign(w.id)} label={`Atribuir ${w.name}`} style={w.id === c.workoutId ? { borderWidth: 2, borderColor: C.ink } : undefined}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Strong>{w.name}</Strong>
              {w.id === c.workoutId && <Pill text="Atual" tone="gold" />}
            </Row>
            <Small>{w.focus}</Small>
            <Small>{w.days.map(d => `${d.name}: ${d.exercises.length} exercícios`).join(' · ')}</Small>
          </Card>
        ))}
        {c.workoutLog.length > 0 && <>
          <SectionTitle title="Últimos treinos" />
          <Card style={{ paddingVertical: 4 }}>
            {c.workoutLog.slice(0, 6).map((l, i) => <ListRow key={l.date + i} first={i === 0} title={l.day} sub={shortDate(l.date)} />)}
          </Card>
        </>}
      </>}

      {tab === 'avaliacoes' && <>
        <Card style={{ gap: 12 }}>
          <Strong>Nova avaliação</Strong>
          <Row style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><Field label="Peso (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="65,9" /></View>
            <View style={{ flex: 1 }}><Field label="Gordura (%)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" placeholder="26,5" /></View>
          </Row>
          <Btn title="Guardar avaliação" onPress={saveMetric} />
        </Card>
        <Card style={{ paddingVertical: 4 }}>
          {c.metrics.length === 0 ? <Empty icon="analytics-outline" text="Ainda sem avaliações." />
            : [...c.metrics].reverse().map((m, i) => (
              <ListRow key={m.date} first={i === 0} title={shortDate(m.date)}
                right={<Text style={[{ fontFamily: F.medium, fontSize: 15, color: C.text }, num]}>{dec(m.weight)} kg · {dec(m.fat)} %</Text>} />
            ))}
        </Card>
        <Small style={{ paddingHorizontal: 4 }}>Dados de saúde: só tu e o cliente os veem.</Small>
      </>}

      {tab === 'pagamentos' && (
        <Card style={{ paddingVertical: 4 }}>
          {months.map((m, i) => {
            const p = c.payments.find(x => x.month === m);
            const ps = paymentStatus(c, m);
            return (
              <ListRow key={m} first={i === 0} title={monthLabel(m)}
                sub={p?.paidAt ? `${euro(p.amount)} · ${p.method} · ${shortDate(p.paidAt)}` : euro(monthlyFee(s, c))}
                right={ps === 'paid'
                  ? <Btn title="Anular" small variant="ghost" onPress={() => unmarkPaid(c.id, m)} />
                  : <Row style={{ gap: 6 }}>
                    {ps === 'overdue' && <Btn title="Lembrar" small variant="outline" onPress={() => remind(c.id, m)} />}
                    <Btn title="Pago" small onPress={() => markPaid(c.id, m, 'Numerário')} />
                  </Row>} />
            );
          })}
        </Card>
      )}

      {tab === 'notas' && <>
        <Field label="Notas privadas (o cliente não vê)" value={notes} onChangeText={setNotes} multiline placeholder="Lesões, preferências, combinações…" />
        <Btn title="Guardar notas" onPress={() => { updateClient(c.id, { notes }); toast('Notas guardadas'); }} />
        <Body style={{ color: C.secondary, fontSize: 13 }}>Evita guardar aqui diagnósticos médicos detalhados.</Body>
      </>}
    </Screen>
  );
}
