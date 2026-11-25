import React, { useState } from 'react';
import { Share, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { C, F, num } from '../../theme';
import { Bar, Btn, Card, Empty, IconBtn, ListRow, PayPill, Row, Screen, SectionTitle, Sheet, Small, Strong } from '../../ui';
import { monthSummary } from '../../trainer';
import { Client, PayMethod, euro, monthKey, monthLabel, monthlyFee, shiftMonth } from '../../data';

const MANUAL: PayMethod[] = ['Numerário', 'Transferência', 'MB WAY', 'Multibanco'];

export default function PtCaixa() {
  const { s, remind, remindAll, markPaid } = useStore();
  const cur = monthKey(new Date());
  const [month, setMonth] = useState(cur);
  const [paying, setPaying] = useState<Client | null>(null);
  const sum = monthSummary(s, new Date(), month);

  const report = () => Share.share({
    message: `Pulse · ${sum.label}\nRecebido: ${euro(sum.received)} de ${euro(sum.expected)}\nPagos: ${sum.paid.length} · Pendentes: ${sum.pending.length} · Em atraso: ${sum.overdue.length}\n\nEm atraso:\n${sum.overdue.map(c => `- ${c.name} (${euro(monthlyFee(s, c))})`).join('\n') || '- ninguém'}`,
  });

  const group = (title: string, list: Client[], kind: 'overdue' | 'pending' | 'paid') => list.length > 0 && <>
    <SectionTitle title={`${title} · ${list.length}`} />
    <Card style={{ paddingVertical: 4 }}>
      {list.map((c, i) => {
        const p = c.payments.find(x => x.month === month);
        return (
          <ListRow key={c.id} first={i === 0} title={c.name}
            sub={kind === 'paid' && p?.paidAt ? `${euro(p.amount)} · ${p.method}` : `${euro(monthlyFee(s, c))} · vence a ${c.dueDay}`}
            onPress={() => router.push(`/ficha/${c.id}`)}
            right={kind === 'paid' ? <PayPill status="paid" /> : <Row style={{ gap: 6 }}>
              {kind === 'overdue' && <Btn title="Lembrar" small variant="outline" onPress={() => remind(c.id, month)} />}
              <Btn title="Pago" small onPress={() => setPaying(c)} />
            </Row>} />
        );
      })}
    </Card>
  </>;

  return (
    <Screen title="Caixa" right={<IconBtn icon="share-outline" label="Partilhar relatório" onPress={report} />}>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconBtn icon="chevron-back" label="Mês anterior" onPress={() => setMonth(m => shiftMonth(m, -1))} />
        <Strong>{sum.label}</Strong>
        <IconBtn icon="chevron-forward" label="Mês seguinte" onPress={() => setMonth(m => shiftMonth(m, 1))} />
      </Row>
      <Card tone="ink" style={{ padding: 20, gap: 10 }}>
        <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.gold }}>Recebido</Text>
        <Row style={{ alignItems: 'baseline', gap: 8 }}>
          <Text style={[{ fontFamily: F.display, fontSize: 36, color: C.onInk }, num]}>{euro(sum.received)}</Text>
          <Small style={{ color: C.onInkMuted }}>de {euro(sum.expected)}</Small>
        </Row>
        <Bar value={sum.expected ? sum.received / sum.expected : 0} dark />
        {sum.overdue.length > 0 && <Small style={{ color: '#FFC2B4' }}>{euro(sum.overdueAmount)} em atraso</Small>}
      </Card>
      {sum.overdue.length > 1 && <Btn title={`Lembrar os ${sum.overdue.length} em atraso`} icon="notifications-outline" onPress={() => remindAll(month)} />}
      {group('Em atraso', sum.overdue, 'overdue')}
      {group('Pendentes', sum.pending, 'pending')}
      {group('Pagos', sum.paid, 'paid')}
      {sum.paid.length + sum.pending.length + sum.overdue.length === 0 && <Empty icon="wallet-outline" text="Sem clientes neste mês." />}

      <Sheet visible={!!paying} onClose={() => setPaying(null)} title="Registar pagamento">
        {paying && <>
          <Card tone="inset">
            <Strong>{paying.name}</Strong>
            <Small>{monthLabel(month)} · {euro(monthlyFee(s, paying))}</Small>
          </Card>
          <Small>MB WAY e Multibanco vão ser confirmados automaticamente. Usa isto para numerário, transferência ou correções.</Small>
          <View style={{ gap: 10 }}>
            {MANUAL.map(m => <Btn key={m} title={m} variant="outline" onPress={() => { markPaid(paying.id, month, m); setPaying(null); }} />)}
          </View>
        </>}
      </Sheet>
    </Screen>
  );
}
