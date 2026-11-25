import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { Btn, Card, Chip, Field, Label, ListRow, Screen, SectionTitle, Small } from '../../ui';
import { shortDate } from '../../data';

const TAGS = ['Novidade', 'Horário', 'Campanha', 'Evento', 'Workshop'];

export default function NovoAviso() {
  const { s, announce } = useStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState(TAGS[0]);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/pt/hoje'));
  return (
    <Screen title="Novo aviso" onBack={close} bottomPad={40}>
      <Label>Tipo</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {TAGS.map(t => <Chip key={t} label={t} active={t === tag} onPress={() => setTag(t)} />)}
      </ScrollView>
      <Field label="Título" value={title} onChangeText={setTitle} placeholder="Ex.: Novo horário de sábado" />
      <Field label="Mensagem" value={body} onChangeText={setBody} multiline placeholder="O que os clientes precisam de saber" />
      <Small>Vai para todos os {s.clients.length} clientes como notificação.</Small>
      <Btn title="Publicar aviso" disabled={title.trim().length < 3 || body.trim().length < 3}
        onPress={() => { announce(title.trim(), body.trim(), tag); close(); }} />
      {s.announcements.length > 0 && <>
        <SectionTitle title="Publicados" />
        <Card style={{ paddingVertical: 4 }}>
          {s.announcements.slice(0, 5).map((a, i) => <ListRow key={a.id} first={i === 0} title={a.title} sub={`${a.tag} · ${shortDate(a.date)}`} />)}
        </Card>
      </>}
    </Screen>
  );
}
