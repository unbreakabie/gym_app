import React, { useState } from 'react';
import { Linking, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { useStore } from '../../store';
import { C, F, num } from '../../theme';
import { Avatar, Btn, Card, Empty, ListRow, MemberCode, PayPill, Pill, Row, Screen, SectionTitle, Segmented, Small, Strong } from '../../ui';
import { useMe } from '../../components';
import {
  Metric, activityDays, dec, euro, monthKey, monthLabel, monthlyFee, paymentStatus, planOf, shiftMonth, shortDate, unpaidMonths,
} from '../../data';

function Trend({ data, pick, unit }: { data: Metric[]; pick: (m: Metric) => number; unit: string }) {
  const w = 300, h = 90, pad = 8;
  if (data.length < 2) return <Small>Ainda não há avaliações suficientes para um gráfico.</Small>;
  const vals = data.map(pick), min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const pts = vals.map((v, i) => [pad + (i * (w - 2 * pad)) / (vals.length - 1), pad + (1 - (v - min) / span) * (h - 2 * pad)]);
  const first = vals[0], last = vals[vals.length - 1], diff = last - first;
  return (
    <View style={{ gap: 6 }}>
      <Row style={{ alignItems: 'baseline', gap: 8 }}>
        <Text style={[{ fontFamily: F.display, fontSize: 28, color: C.text }, num]}>{dec(last)} {unit}</Text>
        <Small style={num}>{diff <= 0 ? '−' : '+'}{dec(Math.abs(diff))} {unit} desde {shortDate(data[0].date)}</Small>
      </Row>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} accessibilityLabel={`Evolução de ${dec(first)} para ${dec(last)} ${unit}`}>
        <Polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={C.goldDeep} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <Circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={5} fill={C.ink} />
      </Svg>
    </View>
  );
}

export default function Eu() {
  const { s, logout, resetDemo, setWeeklyGoal, toast } = useStore();
  const me = useMe();
  const [metric, setMetric] = useState<'weight' | 'fat'>('weight');
  const [prefs, setPrefs] = useState({ classes: true, plan: true, goal: true, news: true });
  if (!me) return null;
  const plan = planOf(s, me);
  const cur = monthKey(new Date());
  const months = [0, -1, -2, -3, -4, -5].map(k => shiftMonth(cur, k)).filter(m => m >= me.joined.slice(0, 7));
  const owed = unpaidMonths(me, cur);
  const total = activityDays(me).length;

  const pref = (key: keyof typeof prefs, label: string, sub: string, first?: boolean) => (
    <ListRow first={first} title={label} sub={sub}
      right={<Switch value={prefs[key]} onValueChange={v => setPrefs(p => ({ ...p, [key]: v }))} trackColor={{ true: C.ink, false: C.border }} thumbColor="#FFFFFF" accessibilityLabel={label} />} />
  );

  return (
    <Screen title="Eu">
      <Row>
        <Avatar name={me.name} size={56} />
        <View style={{ flex: 1 }}>
          <Strong style={{ fontSize: 18 }}>{me.name}</Strong>
          <Small>{plan.name}{me.founder ? ' · Founding Member' : ''} · sócio desde {shortDate(me.joined)}</Small>
        </View>
      </Row>

      <Card tone="ink" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 }}>
        <View style={{ padding: 8, backgroundColor: '#FFFFFF', borderRadius: 12 }}><MemberCode id={me.id} size={92} /></View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.gold }}>Cartão de sócio</Text>
          <Text style={{ fontFamily: F.display, fontSize: 20, color: C.onInk }}>{plan.name}</Text>
          <Small style={{ color: C.onInkMuted }}>{euro(monthlyFee(s, me))} / mês{me.founder ? ' · 20% Founding' : ''}</Small>
          <View style={{ marginTop: 4 }}><PayPill status={paymentStatus(me, cur)} /></View>
        </View>
      </Card>

      <SectionTitle title="Objetivo semanal" />
      <Card>
        <Small>Quantas vezes queres treinar por semana? Aulas e treinos do plano contam.</Small>
        <Segmented value={me.weeklyGoal} onChange={v => setWeeklyGoal(me.id, v)}
          options={[{ value: 2, label: '2 vezes' }, { value: 3, label: '3 vezes' }, { value: 4, label: '4 vezes' }]} />
        <Small>Tens uma pausa grátis por mês: se falhares uma semana, a sequência mantém-se.</Small>
      </Card>

      <SectionTitle title="Progresso" />
      <Card>
        <Strong style={{ fontSize: 15 }}>{total} treinos no Pulse</Strong>
        <Segmented value={metric} onChange={setMetric} options={[{ value: 'weight', label: 'Peso' }, { value: 'fat', label: '% gordura' }]} />
        <Trend data={me.metrics} pick={m => (metric === 'weight' ? m.weight : m.fat)} unit={metric === 'weight' ? 'kg' : '%'} />
      </Card>
      {me.prs.length > 0 && (
        <Card style={{ paddingVertical: 4 }}>
          {me.prs.map((p, i) => (
            <ListRow key={p.name} first={i === 0} title={p.name} sub={`Antes ${p.prev} kg`}
              right={<Row style={{ gap: 8 }}><Text style={[{ fontFamily: F.display, fontSize: 18, color: C.text }, num]}>{p.value} kg</Text><Pill text={`+${p.value - p.prev}`} tone="gold" /></Row>} />
          ))}
        </Card>
      )}

      <SectionTitle title="Pagamentos" />
      <Card style={{ paddingVertical: 4 }}>
        {months.map((m, i) => {
          const p = me.payments.find(x => x.month === m);
          const st = paymentStatus(me, m);
          return <ListRow key={m} first={i === 0} title={monthLabel(m)}
            sub={p?.paidAt ? `${euro(p.amount)} · ${p.method} · ${shortDate(p.paidAt)}` : euro(monthlyFee(s, me))}
            right={<PayPill status={st} />} />;
        })}
      </Card>
      {owed.length > 0 && <Btn title={`Pagar ${monthLabel(owed[0])}`} onPress={() => router.push('/pagar')} />}
      <Small style={{ paddingHorizontal: 4 }}>Para mudar de plano, fala com o teu PT. As faturas chegam por email.</Small>

      <SectionTitle title="Notificações" />
      <Card style={{ paddingVertical: 4 }}>
        {pref('classes', 'Lembrete de aula', '2 horas antes de cada reserva', true)}
        {pref('plan', 'Novo plano de treino', 'Quando o PT atualiza o teu plano')}
        {pref('goal', 'Ajuda com o objetivo', 'À quinta, se a semana estiver atrasada')}
        {pref('news', 'Avisos do clube', 'Campanhas, horários e eventos')}
      </Card>
      <Small style={{ paddingHorizontal: 4 }}>Avisos de pagamento, aulas canceladas e lugares libertados chegam sempre. Nunca enviamos nada entre as 21:00 e as 8:00.</Small>

      <SectionTitle title="Clube e privacidade" />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow first title="@pulsewclub" sub="Instagram" onPress={() => Linking.openURL('https://www.instagram.com/pulsewclub/')} />
        <ListRow title="Exportar os meus dados" sub="Recebes um ficheiro com tudo o que guardamos" onPress={() => toast('Disponível quando as contas reais estiverem ativas')} />
        <ListRow title="Apagar conta" sub="Apaga os teus dados de saúde e de treino" onPress={() => toast('Disponível quando as contas reais estiverem ativas')} />
      </Card>

      <Row>
        <Btn title="Terminar sessão" variant="outline" onPress={() => { logout(); router.replace('/entrar'); }} style={{ flex: 1 }} />
        <Btn title="Repor demo" variant="ghost" onPress={resetDemo} />
      </Row>
      {me.metrics.length === 0 && me.prs.length === 0 && <Empty icon="analytics-outline" text="A tua primeira avaliação física aparece aqui." />}
    </Screen>
  );
}
