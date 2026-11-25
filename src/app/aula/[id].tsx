import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store';
import { C, F } from '../../theme';
import { Avatar, Bar, Body, Btn, Card, Empty, Field, ListRow, Pill, Row, Screen, SectionTitle, Small, Strong } from '../../ui';
import { dayLabel } from '../../components';
import { CLASS_META, hhmm } from '../../data';

export default function Aula() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, book, cancelBooking, cancelClass } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const c = s.classes.find(x => x.id === id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!c) return <Screen title="Aula" onBack={back}><Empty icon="alert-circle-outline" text="Esta aula já não existe." /></Screen>;

  const role = s.session?.role;
  const meId = s.session?.clientId;
  const now = new Date();
  const past = new Date(c.start) < now;
  const booked = !!meId && c.attendees.includes(meId);
  const waitPos = meId ? c.waitlist.indexOf(meId) : -1;
  const full = c.attendees.length >= c.capacity;
  const nameOf = (cid: string) => s.clients.find(x => x.id === cid)?.name ?? 'Cliente';

  return (
    <Screen onBack={back} title={c.title} eyebrow={`${dayLabel(c.start, now)} · ${hhmm(c.start)}`} bottomPad={40}>
      <Card tone="ink" style={{ padding: 20, gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.gold }}>{CLASS_META[c.type].label} · {c.duration} min</Text>
          {c.cancelled && <Pill text="Cancelada" tone="bad" />}
        </Row>
        <Text style={{ fontFamily: F.display, fontSize: 22, color: C.onInk }}>Com {c.coach}</Text>
        <Bar value={c.attendees.length / c.capacity} dark />
        <Small style={{ color: C.onInkMuted }}>{c.attendees.length} de {c.capacity} lugares{c.waitlist.length ? ` · ${c.waitlist.length} em lista de espera` : ''}</Small>
      </Card>

      {role === 'client' && !c.cancelled && !past && (
        <Card style={{ gap: 12 }}>
          {booked ? <>
            <Strong>Tens lugar nesta aula.</Strong>
            <Small>Lembramos-te 2 horas antes. Se não puderes vir, cancela para dar o lugar a quem está à espera.</Small>
            <Btn title="Cancelar reserva" variant="danger" onPress={() => cancelBooking(c.id, meId!)} />
          </> : waitPos >= 0 ? <>
            <Strong>Estás em lista de espera ({waitPos + 1}.º).</Strong>
            <Small>Se alguém cancelar, ficas com o lugar e recebes uma notificação.</Small>
            <Btn title="Sair da lista de espera" variant="outline" onPress={() => cancelBooking(c.id, meId!)} />
          </> : <>
            <Strong>{full ? 'Aula cheia' : `${c.capacity - c.attendees.length} lugares livres`}</Strong>
            <Small>{full ? 'Entra na lista de espera e avisamos-te se abrir lugar.' : 'Reserva já o teu lugar.'}</Small>
            <Btn title={full ? 'Entrar na lista de espera' : 'Reservar'} onPress={() => book(c.id, meId!)} />
          </>}
        </Card>
      )}

      {role === 'trainer' && <>
        <SectionTitle title={`Inscritos · ${c.attendees.length}`} />
        <Card style={{ paddingVertical: 4 }}>
          {c.attendees.length === 0 ? <Empty icon="people-outline" text="Ainda ninguém reservou." />
            : c.attendees.map((a, i) => <ListRow key={a} first={i === 0} title={nameOf(a)} icon={<Avatar name={nameOf(a)} size={36} />} onPress={() => router.push(`/ficha/${a}`)} />)}
        </Card>
        {c.waitlist.length > 0 && <>
          <SectionTitle title={`Lista de espera · ${c.waitlist.length}`} />
          <Card style={{ paddingVertical: 4 }}>
            {c.waitlist.map((a, i) => <ListRow key={a} first={i === 0} title={`${i + 1}. ${nameOf(a)}`} sub="Entra automaticamente se abrir lugar" onPress={() => router.push(`/ficha/${a}`)} />)}
          </Card>
        </>}
        {!c.cancelled && !past && (
          <Card style={{ gap: 12 }}>
            {!confirm
              ? <Btn title="Cancelar aula" variant="danger" onPress={() => setConfirm(true)} />
              : <>
                <Strong>Cancelar esta aula?</Strong>
                <Body style={{ color: C.secondary }}>{c.attendees.length} {c.attendees.length === 1 ? 'cliente recebe' : 'clientes recebem'} uma notificação.</Body>
                <Field label="Mensagem (opcional)" value={msg} onChangeText={setMsg} placeholder="Ex.: Mike doente, retomamos amanhã" />
                <Row>
                  <Btn title="Manter" variant="outline" onPress={() => setConfirm(false)} style={{ flex: 1 }} />
                  <Btn title="Cancelar aula" onPress={() => { cancelClass(c.id, msg.trim() || undefined); setConfirm(false); }} style={{ flex: 1 }} />
                </Row>
              </>}
          </Card>
        )}
      </>}
      <View />
    </Screen>
  );
}
