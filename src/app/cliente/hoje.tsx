import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { C, F } from '../../theme';
import { Big, Body, Btn, Card, GoalRing, IconBtn, Pill, Row, Screen, Small, Strong, Title } from '../../ui';
import { CardHead, dayLabel, useMe } from '../../components';
import { firstName, greeting, plural, todayLong } from '../../greet';
import {
  daysSince, localIso, monthKey, euro, hhmm, monthLabel, monthlyFee, nextWorkoutDay, paymentStatus, streakInfo,
} from '../../data';

export default function ClienteHoje() {
  const { s } = useStore();
  const me = useMe();
  if (!me) return null;
  const now = new Date();
  const nowIso = localIso(now);
  const st = streakInfo(me, now);
  const unread = me.notifications.filter(n => !n.read).length;

  const upcoming = s.classes.filter(c => !c.cancelled && c.attendees.includes(me.id) && new Date(c.start).getTime() > now.getTime() - 30 * 60000);
  const next = upcoming[0];
  const waiting = s.classes.find(c => !c.cancelled && c.waitlist.includes(me.id) && new Date(c.start) > now);
  // Behind on the week? Suggest the next class that still has spots.
  const suggestion = !next && st.left > 0
    ? s.classes.find(c => !c.cancelled && new Date(c.start) > now && c.attendees.length < c.capacity && c.type !== 'pt')
    : undefined;

  const workout = nextWorkoutDay(s, me);
  const month = monthKey(now);
  const pay = paymentStatus(me, month, now);
  const dueIn = me.dueDay - now.getDate();
  const showPay = pay === 'overdue' || (pay === 'pending' && dueIn <= 5);
  const news = s.announcements.find(a => daysSince(a.date, now) <= 7);
  const checkedToday = me.checkins.some(x => x.startsWith(nowIso.slice(0, 10)));

  const goalText = st.left === 0
    ? 'Semana fechada. Bom trabalho.'
    : `${st.left === 1 ? 'Falta 1 treino' : `Faltam ${st.left} treinos`} para fechar a semana.`;

  return (
        <Screen>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Small>{todayLong(now)}</Small>
              <Title>{greeting(now)}, {firstName(me.name)}</Title>
            </View>
            <IconBtn icon="notifications-outline" label="Notificações" badge={unread} onPress={() => router.push('/notificacoes')} />
          </Row>

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <GoalRing done={st.done} goal={st.goal} />
            <View style={{ flex: 1, gap: 2 }}>
              <Strong>{goalText}</Strong>
              <Small>
                {st.streak > 0 ? `Sequência de ${plural(st.streak, 'semana', 'semanas')}` : 'Começa uma sequência esta semana'}
                {st.pauseUsedThisMonth ? ' · pausa do mês usada' : ''}
              </Small>
            </View>
          </Card>

          {next ? (
            <Card tone="ink" style={{ padding: 20 }}>
              <CardHead icon="time-outline" text={`${dayLabel(next.start, now)} às ${hhmm(next.start)}`} dark />
              <Text style={{ fontFamily: F.display, fontSize: 26, lineHeight: 32, color: C.onInk }}>{next.title}</Text>
              <Small style={{ color: C.onInkMuted }}>Com {next.coach} · {next.duration} min · {next.attendees.length} de {next.capacity} lugares</Small>
              <Row style={{ marginTop: 8 }}>
                <Btn title={checkedToday ? 'Check-in feito' : 'Fazer check-in'} variant="gold" icon={checkedToday ? 'checkmark' : 'qr-code-outline'}
                  disabled={checkedToday} onPress={() => router.push('/checkin')} style={{ flex: 1 }} />
                <Btn title="Detalhes" variant="outlineLight" onPress={() => router.push(`/aula/${next.id}`)} />
              </Row>
            </Card>
          ) : (
            <Card tone="ink" style={{ padding: 20 }}>
              <CardHead icon="calendar-outline" text="Sem aulas reservadas" dark />
              {suggestion ? <>
                <Text style={{ fontFamily: F.display, fontSize: 22, lineHeight: 28, color: C.onInk }}>{suggestion.title}, {dayLabel(suggestion.start, now).toLowerCase()} às {hhmm(suggestion.start)}</Text>
                <Small style={{ color: C.onInkMuted }}>Ainda há {suggestion.capacity - suggestion.attendees.length} lugares com {suggestion.coach}.</Small>
                <Row style={{ marginTop: 8 }}>
                  <Btn title="Ver aula" variant="gold" onPress={() => router.push(`/aula/${suggestion.id}`)} style={{ flex: 1 }} />
                  <Btn title="Agenda" variant="outlineLight" onPress={() => router.push('/cliente/agenda')} />
                </Row>
              </> : <Btn title="Ver agenda" variant="gold" onPress={() => router.push('/cliente/agenda')} />}
            </Card>
          )}

          {waiting && (
            <Card tone="inset" onPress={() => router.push(`/aula/${waiting.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Strong style={{ fontSize: 15 }}>Lista de espera: {waiting.title}</Strong>
                <Small>{dayLabel(waiting.start, now)} às {hhmm(waiting.start)} · és o {waiting.waitlist.indexOf(me.id) + 1}.º · avisamos se abrir lugar</Small>
              </View>
            </Card>
          )}

          {workout && (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <CardHead icon="barbell-outline" text="Treino de hoje" />
                <Strong>{workout.day.name} · {workout.plan.name}</Strong>
                <Small>{plural(workout.day.exercises.length, 'exercício', 'exercícios')}</Small>
              </View>
              <Btn title="Começar" variant="outline" small onPress={() => router.push('/treino')} />
            </Card>
          )}

          {showPay && (
            <Card tone="gold" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Strong style={{ fontSize: 15 }}>{monthLabel(month)} · {euro(monthlyFee(s, me))}</Strong>
                {pay === 'overdue'
                  ? <Pill text="Em atraso" tone="bad" />
                  : <Small style={{ color: C.goldText }}>{dueIn <= 0 ? 'Vence hoje' : `Vence a ${me.dueDay}`}</Small>}
              </View>
              <Btn title="Pagar" small onPress={() => router.push('/pagar')} />
            </Card>
          )}

          {news && (
            <Card>
              <CardHead icon="megaphone-outline" text={news.tag} />
              <Strong>{news.title}</Strong>
              <Body style={{ color: C.secondary }}>{news.body}</Body>
            </Card>
          )}

          {st.streak >= 4 && st.left === 0 && (
            <Card tone="inset" style={{ alignItems: 'center' }}>
              <Big style={{ color: C.goldText }}>{st.streak}</Big>
              <Small>semanas seguidas a cumprir o objetivo</Small>
            </Card>
          )}
        </Screen>
  );
}

