import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store';
import { Btn, Chip, Field, Label, Row, Screen } from '../../ui';
import { DayStrip } from '../../components';
import { CLASS_META, ClassType, dayKey } from '../../data';

const TYPES: ClassType[] = ['forca', 'reformer', 'mobilidade', 'pt'];
const TITLE: Record<ClassType, string> = { forca: 'Treino de Força', reformer: 'Pilates Reformer', mobilidade: 'Mobilidade & Core', pt: 'Sessão PT' };
const CAP: Record<ClassType, number> = { forca: 10, reformer: 6, mobilidade: 12, pt: 1 };

export default function NovaAula() {
  const params = useLocalSearchParams<{ day?: string }>();
  const { addClass } = useStore();
  const [day, setDay] = useState(params.day ?? dayKey(new Date()));
  const [type, setType] = useState<ClassType>('forca');
  const [title, setTitle] = useState(TITLE.forca);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState('50');
  const [capacity, setCapacity] = useState(String(CAP.forca));
  const [coach, setCoach] = useState('Mike');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/pt/agenda'));
  const okTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const valid = okTime && +duration > 0 && +capacity > 0 && title.trim().length > 2;

  return (
    <Screen title="Nova aula" onBack={close} bottomPad={40}>
      <Label>Dia</Label>
      <DayStrip value={day} onChange={setDay} />
      <Label>Tipo</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {TYPES.map(t => <Chip key={t} label={CLASS_META[t].label} active={t === type} onPress={() => { setType(t); setTitle(TITLE[t]); setCapacity(String(CAP[t])); }} />)}
      </ScrollView>
      <Field label="Nome" value={title} onChangeText={setTitle} />
      <Row style={{ alignItems: 'flex-start' }}>
        <Field label="Hora" value={time} onChangeText={setTime} placeholder="18:00" style={{ width: 100 }} />
        <Field label="Minutos" value={duration} onChangeText={setDuration} keyboardType="number-pad" style={{ width: 100 }} />
        <Field label="Lugares" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" style={{ width: 100 }} />
      </Row>
      <Field label="Treinador" value={coach} onChangeText={setCoach} />
      <Btn title="Criar aula" disabled={!valid} onPress={() => {
        addClass({ type, title: title.trim(), coach: coach.trim() || 'Mike', start: `${day}T${time}:00`, duration: +duration, capacity: +capacity });
        close();
      }} />
    </Screen>
  );
}
