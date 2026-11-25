import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { Avatar, Btn, Card, Chip, Empty, Field, ListRow, PayPill, RiskPill, Screen } from '../../ui';
import { monthKey, paymentStatus, planOf, riskOf } from '../../data';

type Filter = 'all' | 'paid' | 'pending' | 'overdue' | 'risk';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' }, { key: 'overdue', label: 'Em atraso' }, { key: 'risk', label: 'Em risco' },
  { key: 'pending', label: 'Pendentes' }, { key: 'paid', label: 'Pagos' },
];

export default function PtClientes() {
  const { s } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');
  const month = monthKey(new Date());
  const rows = s.clients.map(c => ({ c, pay: paymentStatus(c, month), risk: riskOf(c).level }));
  const match = (r: typeof rows[number], k: Filter) =>
    k === 'all' ? true : k === 'risk' ? r.risk !== 'ok' : r.pay === k;
  const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = rows.filter(r => match(r, f) && (!q || norm(r.c.name).includes(norm(q)) || r.c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))));

  return (
    <Screen title="Clientes" right={<Btn title="Novo" icon="add" small onPress={() => router.push('/novo/cliente')} />}>
      <Field label="Procurar" value={q} onChangeText={setQ} placeholder="Nome ou telemóvel" autoCorrect={false} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map(x => <Chip key={x.key} label={x.label} active={f === x.key} count={rows.filter(r => match(r, x.key)).length} onPress={() => setF(x.key)} />)}
      </ScrollView>
      <Card style={{ paddingVertical: 4 }}>
        {list.length === 0 ? <Empty icon="people-outline" text="Nenhum cliente encontrado." />
          : list.map((r, i) => (
            <ListRow key={r.c.id} first={i === 0} title={r.c.name} sub={`${planOf(s, r.c).name}${r.c.founder ? ' · Founding' : ''}`}
              icon={<Avatar name={r.c.name} size={40} dark={false} />}
              right={<View style={{ alignItems: 'flex-end', gap: 4 }}>
                <PayPill status={r.pay} />
                {r.risk !== 'ok' && <RiskPill level={r.risk} />}
              </View>}
              onPress={() => router.push(`/ficha/${r.c.id}`)} />
          ))}
      </Card>
    </Screen>
  );
}
