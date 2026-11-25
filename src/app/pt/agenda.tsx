import React, { useState } from 'react';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { Btn, Card, Empty, Screen, Small } from '../../ui';
import { ClassRow, DayStrip } from '../../components';
import { dayKey } from '../../data';

export default function PtAgenda() {
  const { s } = useStore();
  const [day, setDay] = useState(dayKey(new Date()));
  const list = s.classes.filter(c => c.start.startsWith(day));
  const booked = list.filter(c => !c.cancelled).reduce((n, c) => n + c.attendees.length, 0);
  const spots = list.filter(c => !c.cancelled).reduce((n, c) => n + c.capacity, 0);
  return (
    <Screen title="Agenda" right={<Btn title="Nova aula" icon="add" small onPress={() => router.push({ pathname: '/novo/aula', params: { day } })} />}>
      <DayStrip value={day} onChange={setDay} />
      {list.length > 0 && <Small style={{ paddingHorizontal: 4 }}>{list.length} aulas · {booked} de {spots} lugares reservados</Small>}
      <Card style={{ paddingVertical: 4 }}>
        {list.length === 0 ? <Empty icon="calendar-clear-outline" text="Sem aulas neste dia." />
          : list.map((c, i) => <ClassRow key={c.id} c={c} first={i === 0} onPress={() => router.push(`/aula/${c.id}`)} />)}
      </Card>
    </Screen>
  );
}
