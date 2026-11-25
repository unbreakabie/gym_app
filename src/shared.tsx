// Pieces used by both the client and the trainer app.
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { C, R, num } from './theme';
import { CLASS_META, ClassSession, WEEKDAYS_SHORT, addDays, dayKey, hhmm } from './data';
import { Icon, IconName, Progress, Row, Tag } from './ui';

export function DayStrip({ value, onChange, days = 7 }: { value: string; onChange: (k: string) => void; days?: number }) {
  const today = new Date();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {Array.from({ length: days }, (_, i) => {
        const d = addDays(today, i); const k = dayKey(d); const on = k === value;
        return (
          <Pressable key={k} onPress={() => onChange(k)} accessibilityState={{ selected: on }} style={{
            width: 52, height: 64, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', gap: 4,
            backgroundColor: on ? C.surface2 : 'transparent', borderWidth: 1, borderColor: on ? 'rgba(245,241,234,0.16)' : C.border,
          }}>
            <Text style={{ color: on ? C.secondary : C.muted, fontSize: 12 }}>{i === 0 ? 'Hoje' : WEEKDAYS_SHORT[d.getDay()]}</Text>
            <Text style={{ color: on ? C.gold : C.text, fontSize: 18, fontWeight: '500', ...num }}>{d.getDate()}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ClassCard({ c, right, onPress, highlight }: { c: ClassSession; right?: React.ReactNode; onPress?: () => void; highlight?: boolean }) {
  const meta = CLASS_META[c.type];
  const full = c.attendees.length >= c.capacity;
  const past = new Date(c.start) < new Date();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [{
      backgroundColor: pressed ? C.surface2 : C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.border,
      padding: 16, marginBottom: 8, opacity: c.cancelled || past ? 0.5 : 1,
    }]}>
      <Row style={{ alignItems: 'flex-start', gap: 16 }}>
        <View style={{ width: 48 }}>
          <Text style={{ color: C.text, fontSize: 17, lineHeight: 24, fontWeight: '500', ...num }}>{hhmm(c.start)}</Text>
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, ...num }}>{c.duration} min</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Row style={{ gap: 8 }}>
            <Icon name={`${meta.icon}-outline` as IconName} size={16} color={C.muted} />
            <Text style={{ color: C.text, fontWeight: '500', fontSize: 15, lineHeight: 24, flex: 1 }} numberOfLines={1}>{c.title}</Text>
          </Row>
          <Row style={{ gap: 8 }}>
            {highlight ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold }} /> : null}
            <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>{highlight ? 'Reservado · ' : ''}com {c.coach}</Text>
          </Row>
          {c.cancelled ? <View style={{ marginTop: 4 }}><Tag text="Cancelada" color={C.danger} /></View> : (
            <View style={{ gap: 8, marginTop: 8 }}>
              <Progress value={c.attendees.length / c.capacity} color={full ? C.danger : C.muted} />
              <Text style={{ color: full ? C.danger : C.muted, fontSize: 12, ...num }}>
                {full ? `Esgotada${c.waitlist.length ? ` · ${c.waitlist.length} em espera` : ''}` : `${c.attendees.length} de ${c.capacity} · ${c.capacity - c.attendees.length} vagas`}
              </Text>
            </View>
          )}
        </View>
        {right}
      </Row>
    </Pressable>
  );
}
