import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store';
import { C, F, num } from '../../theme';
import { Bar, Btn, Card, Empty, Icon, IconName, ListRow, Pill, Row, Screen, SectionTitle, Sheet, Small, Strong, Title } from '../../ui';
import { ClassRow } from '../../components';
import { greeting, todayLong } from '../../greet';
import { monthSummary, whatsappUrl } from '../../trainer';
import { dayKey, euro, hhmm, riskOf } from '../../data';

export default function PtHoje() {
  const { s, remindAll, snoozeRisk, markContacted } = useStore();
  const inset = useSafeAreaInsets();
  const [create, setCreate] = useState(false);
  const now = new Date();
  const sum = monthSummary(s, now);

  const atRisk = s.clients
    .map(c => ({ c, r: riskOf(c, now) }))
    .filter(x => x.r.level !== 'ok')
    .sort((a, b) => b.r.days - a.r.days);
  const today = dayKey(now);
  const todays = s.classes.filter(c => c.start.startsWith(today));
  const fullWithWait = todays.filter(c => !c.cancelled && c.waitlist.length > 0 && new Date(c.start) > now);
  const nothing = sum.overdue.length === 0 && atRisk.length === 0 && fullWithWait.length === 0;

  const go = (path: '/novo/cliente' | '/novo/aula' | '/novo/aviso' | '/pt/caixa') => { setCreate(false); router.push(path); };
  const createItems: { icon: IconName; label: string; sub: string; path: '/novo/cliente' | '/novo/aula' | '/novo/aviso' | '/pt/caixa' }[] = [
    { icon: 'person-add-outline', label: 'Novo cliente', sub: 'Adiciona e envia o convite', path: '/novo/cliente' },
    { icon: 'calendar-outline', label: 'Nova aula', sub: 'Marca uma aula no horário', path: '/novo/aula' },
    { icon: 'megaphone-outline', label: 'Novo aviso', sub: 'Notifica todos os clientes', path: '/novo/aviso' },
    { icon: 'cash-outline', label: 'Registar pagamento', sub: 'Numerário ou transferência', path: '/pt/caixa' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Screen bottomPad={190}>
        <View>
          <Small>{todayLong(now)}</Small>
          <Title>{greeting(now)}, Mike</Title>
        </View>

        <Card tone="ink" style={{ padding: 20, gap: 10 }} onPress={() => router.push('/pt/caixa')} label="Ver caixa do mês">
          <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.gold }}>{sum.label} · recebido</Text>
          <Row style={{ alignItems: 'baseline', gap: 8 }}>
            <Text style={[{ fontFamily: F.display, fontSize: 38, color: C.onInk }, num]}>{euro(sum.received)}</Text>
            <Small style={{ color: C.onInkMuted }}>de {euro(sum.expected)}</Small>
          </Row>
          <Bar value={sum.expected ? sum.received / sum.expected : 0} dark />
          <Row style={{ gap: 8, flexWrap: 'wrap' }}>
            <Pill text={`${sum.paid.length} pagos`} tone="dark" />
            <Pill text={`${sum.pending.length} pendentes`} tone="dark" />
            <Pill text={`${sum.overdue.length} em atraso`} tone={sum.overdue.length ? 'bad' : 'dark'} />
          </Row>
        </Card>

        <SectionTitle title="Precisa de ti" />
        <Card style={{ paddingVertical: 4, gap: 0 }}>
          {nothing && <Empty icon="checkmark-done-outline" text="Tudo em dia. Ninguém em atraso nem em risco." />}
          {sum.overdue.length > 0 && (
            <ListRow first title={`${sum.overdue.length} ${sum.overdue.length === 1 ? 'mensalidade' : 'mensalidades'} em atraso`}
              sub={`${sum.overdue.slice(0, 3).map(c => c.name.split(' ')[0]).join(', ')}${sum.overdue.length > 3 ? '…' : ''} · ${euro(sum.overdueAmount)}`}
              right={<Btn title="Lembrar" small onPress={() => remindAll(sum.month)} />} />
          )}
          {atRisk.map(({ c, r }, i) => (
            <View key={c.id} style={{ borderTopWidth: sum.overdue.length || i ? 1 : 0, borderTopColor: C.hairline, paddingVertical: 12, gap: 8 }}>
              <Pressable accessibilityRole="button" onPress={() => router.push(`/ficha/${c.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Strong style={{ fontSize: 15 }}>{c.name} · {r.days} dias</Strong>
                  <Small>{r.level === 'risk' ? 'Em risco de desistir' : 'A observar'} · objetivo {c.weeklyGoal}x por semana</Small>
                </View>
                <Btn title="WhatsApp" small variant="outline" icon="logo-whatsapp"
                  onPress={() => Linking.openURL(whatsappUrl(c.phone, `Olá ${c.name.split(' ')[0]}, sentimos a tua falta no Pulse! Está tudo bem? Tens lugar no treino desta semana, diz-me quando te dá jeito.`))} />
              </Pressable>
              <Row style={{ gap: 4 }}>
                <Btn title="Já falei" small variant="ghost" onPress={() => markContacted(c.id)} />
                <Btn title="Adiar 7 dias" small variant="ghost" onPress={() => snoozeRisk(c.id, 7)} />
              </Row>
            </View>
          ))}
          {fullWithWait.map(c => (
            <ListRow key={c.id} title={`${c.title} ${hhmm(c.start)} cheia`} sub={`${c.waitlist.length} em lista de espera`}
              right={<Btn title="Ver" small variant="outline" onPress={() => router.push(`/aula/${c.id}`)} />} />
          ))}
        </Card>

        <SectionTitle title="Aulas de hoje" action="Agenda" onAction={() => router.push('/pt/agenda')} />
        <Card style={{ paddingVertical: 4 }}>
          {todays.length === 0 ? <Empty icon="calendar-clear-outline" text="Sem aulas hoje." />
            : todays.map((c, i) => <ClassRow key={c.id} c={c} first={i === 0} onPress={() => router.push(`/aula/${c.id}`)} />)}
        </Card>
      </Screen>

      <Pressable accessibilityRole="button" accessibilityLabel="Criar" onPress={() => setCreate(true)}
        style={({ pressed }) => ({ position: 'absolute', right: 20, bottom: Math.max(inset.bottom, 12) + 84, width: 56, height: 56, borderRadius: 28, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>
        <Icon name="add" size={28} color={C.gold} />
      </Pressable>

      <Sheet visible={create} onClose={() => setCreate(false)} title="Criar">
        <Card style={{ paddingVertical: 4 }}>
          {createItems.map((it, i) => (
            <ListRow key={it.label} first={i === 0} title={it.label} sub={it.sub} onPress={() => go(it.path)}
              icon={<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name={it.icon} size={20} color={C.ink} /></View>} />
          ))}
        </Card>
      </Sheet>
    </View>
  );
}
