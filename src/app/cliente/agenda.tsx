import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { C, F, num } from '../../theme';
import { Card, Chip, Empty, Pill, Screen, SectionTitle } from '../../ui';
import { ClassRow, DayStrip, dayLabel, useMe } from '../../components';
import { ClassType, dayKey, hhmm } from '../../data';

const FILTERS: { key: ClassType | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' }, { key: 'forca', label: 'Força' }, { key: 'reformer', label: 'Reformer' }, { key: 'mobilidade', label: 'Mobilidade' },
];

export default function ClienteAgenda() {
  const { s } = useStore();
  const me = useMe();
  const [day, setDay] = useState(dayKey(new Date()));
  const [type, setType] = useState<ClassType | 'all'>('all');
  if (!me) return null;
  const now = new Date();

  const mine = s.classes.filter(c => !c.cancelled && new Date(c.start) > now && (c.attendees.includes(me.id) || c.waitlist.includes(me.id)));
  const list = s.classes.filter(c => c.start.startsWith(day) && (type === 'all' || c.type === type));

  const statusFor = (id: string) => {
    const c = s.classes.find(x => x.id === id)!;
    if (c.cancelled) return <Pill text="Cancelada" tone="bad" />;
    if (c.attendees.includes(me.id)) return <Pill text="Reservada" tone="ok" />;
    const w = c.waitlist.indexOf(me.id);
    if (w >= 0) return <Pill text={`Espera ${w + 1}.º`} tone="warn" />;
    if (new Date(c.start) < now) return <Pill text="Terminou" />;
    const free = c.capacity - c.attendees.length;
    return free > 0
      ? <Text style={[{ fontFamily: F.medium, fontSize: 14, color: C.secondary }, num]}>{free} {free === 1 ? 'lugar' : 'lugares'}</Text>
      : <Pill text="Cheia" tone="gold" />;
  };

  return (
    <Screen title="Agenda">
      {mine.length > 0 && <>
        <SectionTitle title="As minhas reservas" />
        <Card style={{ paddingVertical: 4 }}>
          {mine.map((c, i) => (
            <ClassRow key={c.id} c={c} first={i === 0} onPress={() => router.push(`/aula/${c.id}`)}
              status={<Text style={{ fontFamily: F.medium, fontSize: 13, color: C.secondary }}>{dayLabel(c.start, now)}</Text>} />
          ))}
        </Card>
      </>}

      <SectionTitle title="Horário" />
      <DayStrip value={day} onChange={setDay} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map(f => <Chip key={f.key} label={f.label} active={type === f.key} onPress={() => setType(f.key)} />)}
      </ScrollView>
      <Card style={{ paddingVertical: 4 }}>
        {list.length === 0
          ? <Empty icon="calendar-clear-outline" text="Não há aulas neste dia." />
          : list.map((c, i) => <ClassRow key={c.id} c={c} first={i === 0} onPress={() => router.push(`/aula/${c.id}`)} status={statusFor(c.id)} />)}
      </Card>
      <View style={{ height: 4 }} />
      {list.length > 0 && <Text style={{ fontFamily: F.body, fontSize: 13, color: C.secondary, textAlign: 'center' }}>Primeira aula às {hhmm(list[0].start)} · toca numa aula para reservar</Text>}
    </Screen>
  );
}
