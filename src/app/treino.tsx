import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../store';
import { C, F, R, num } from '../theme';
import { Bar, Body, Btn, Card, Empty, Icon, Row, Screen, Small, Strong } from '../ui';
import { useMe } from '../components';
import { nextWorkoutDay, streakInfo } from '../data';

const restSeconds = (rest: string) => {
  const n = parseFloat(rest.replace(',', '.'));
  if (isNaN(n)) return 60;
  return /min/.test(rest) ? Math.round(n * 60) : Math.round(n);
};
const mmss = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

// Focused workout mode: one exercise at a time, tick each set, rest timer between sets.
export default function Treino() {
  const { s, logWorkout } = useStore();
  const me = useMe();
  const [idx, setIdx] = useState(0);
  const [sets, setSets] = useState<Record<string, boolean[]>>({});
  const [rest, setRest] = useState(0);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/cliente/hoje'));

  const w = me ? nextWorkoutDay(s, me) : null;
  if (!me || !w) return <Screen title="Treino" onBack={close}><Empty icon="barbell-outline" text="O teu PT ainda não te atribuiu um plano." /></Screen>;
  const { plan, day } = w;

  if (finished) {
    const timesDone = me.workoutLog.filter(l => l.day === day.name).length;
    const st = streakInfo(me);
    return (
      <Screen onBack={close} title="Treino concluído" bottomPad={40}>
        <Card tone="ink" style={{ padding: 22, gap: 10 }}>
          <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.gold }}>{plan.name} · {day.name}</Text>
          <Text style={{ fontFamily: F.display, fontSize: 26, color: C.onInk }}>Mais um feito.</Text>
          <Small style={{ color: C.onInkMuted }}>
            É a {timesDone}.ª vez que fazes o {day.name}. {st.left === 0 ? 'Semana fechada!' : `${st.left === 1 ? 'Falta 1 treino' : `Faltam ${st.left} treinos`} para fechar a semana.`}
          </Small>
        </Card>
        <Small style={{ paddingHorizontal: 4 }}>Com a conta real, vais poder registar os pesos de cada série e ver a comparação com a última vez.</Small>
        <Btn title="Voltar a Hoje" onPress={close} />
      </Screen>
    );
  }

  const ex = day.exercises[idx];
  const key = `${idx}`;
  const marks = sets[key] ?? Array(ex.sets).fill(false);
  const doneCount = day.exercises.reduce((n, e, i) => n + (sets[`${i}`]?.filter(Boolean).length ?? 0), 0);
  const totalSets = day.exercises.reduce((n, e) => n + e.sets, 0);

  const startRest = (secs: number) => {
    if (timer.current) clearInterval(timer.current);
    setRest(secs);
    timer.current = setInterval(() => setRest(r => {
      if (r <= 1) { if (timer.current) clearInterval(timer.current); return 0; }
      return r - 1;
    }), 1000);
  };
  const toggle = (i: number) => {
    const next = [...marks]; next[i] = !next[i];
    setSets(p => ({ ...p, [key]: next }));
    if (next[i] && next.some(x => !x)) startRest(restSeconds(ex.rest));
  };
  const last = idx === day.exercises.length - 1;

  return (
    <Screen onBack={close} eyebrow={`${plan.name} · ${day.name}`} title={`Exercício ${idx + 1} de ${day.exercises.length}`} bottomPad={40}>
      <Bar value={doneCount / totalSets} />
      <Card style={{ padding: 22, gap: 12 }}>
        <Text style={{ fontFamily: F.display, fontSize: 28, lineHeight: 34, color: C.text }}>{ex.name}</Text>
        <Body style={{ color: C.secondary }}>{ex.sets} séries × {ex.reps} · descanso {ex.rest}</Body>
        {ex.note && <Row style={{ gap: 8 }}><Icon name="information-circle-outline" size={18} color={C.goldText} /><Body style={{ color: C.goldText, flex: 1 }}>{ex.note}</Body></Row>}
        <Row style={{ flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
          {marks.map((on, i) => (
            <Pressable key={i} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`Série ${i + 1}`} onPress={() => toggle(i)}
              style={{ width: 64, height: 64, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.ink : C.surface2, gap: 2 }}>
              {on ? <Icon name="checkmark" size={22} color={C.gold} /> : <Text style={[{ fontFamily: F.display, fontSize: 18, color: C.text }, num]}>{i + 1}</Text>}
              <Text style={{ fontFamily: F.body, fontSize: 11, color: on ? C.onInkMuted : C.secondary }}>{ex.reps}</Text>
            </Pressable>
          ))}
        </Row>
      </Card>

      {rest > 0 && (
        <Card tone="gold" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="timer-outline" size={22} color={C.goldText} />
          <View style={{ flex: 1 }}><Strong>Descanso</Strong><Small style={{ color: C.goldText }}>Próxima série quando o tempo acabar</Small></View>
          <Text style={[{ fontFamily: F.display, fontSize: 26, color: C.text }, num]}>{mmss(rest)}</Text>
          <Btn title="Saltar" small variant="outline" onPress={() => startRest(0)} />
        </Card>
      )}

      <Row>
        <Btn title="Anterior" variant="outline" disabled={idx === 0} onPress={() => setIdx(i => i - 1)} style={{ flex: 1 }} />
        {last
          ? <Btn title="Terminar treino" onPress={() => { logWorkout(me.id, day.name); setFinished(true); }} style={{ flex: 1.4 }} />
          : <Btn title="Seguinte" onPress={() => { setIdx(i => i + 1); startRest(0); }} style={{ flex: 1.4 }} />}
      </Row>
      <Small style={{ textAlign: 'center' }}>{doneCount} de {totalSets} séries feitas</Small>
    </Screen>
  );
}
