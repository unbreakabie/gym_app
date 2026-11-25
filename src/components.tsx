// Pieces shared by several screens: the tab bar, class rows, hooks.
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { C, F, R, num } from './theme';
import { Icon, IconName, Pill, Small, Strong } from './ui';
import { useStore } from './store';
import { CLASS_META, ClassSession, Client, WEEKDAYS, hhmm, shortDate } from './data';

export const useMe = (): Client | null => {
  const { s } = useStore();
  const id = s.session?.clientId;
  return s.clients.find(c => c.id === id) ?? null;
};

/** Floating pill tab bar. `icons` maps a route name to its icon. */
export function PillTabBar({ state, descriptors, navigateToTab, icons }: BottomTabBarProps & { icons: Record<string, IconName> }) {
  const inset = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 20, right: 20, bottom: Math.max(inset.bottom, 12) + 4, height: 64, borderRadius: 32, backgroundColor: C.surface, flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const label = descriptors[route.key].options.title ?? route.name;
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label}
            onPress={() => { if (!focused) navigateToTab(route.key); }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Icon name={icons[route.name] ?? 'ellipse-outline'} size={22} color={focused ? C.ink : C.muted} />
            <Text style={{ fontFamily: focused ? F.semibold : F.medium, fontSize: 12, color: focused ? C.ink : C.muted }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const dayLabel = (iso: string, today = new Date()) => {
  const d = new Date(iso);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - t.getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  return `${WEEKDAYS[d.getDay()]}, ${shortDate(iso)}`;
};

/** One class in a list. `status` is shown on the right (client view) or occupancy (PT view). */
export function ClassRow({ c, first, onPress, status }: { c: ClassSession; first?: boolean; onPress?: () => void; status?: React.ReactNode }) {
  const full = c.attendees.length >= c.capacity;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 68, paddingVertical: 10, borderTopWidth: first ? 0 : 1, borderTopColor: C.hairline, opacity: pressed ? 0.7 : c.cancelled ? 0.5 : 1 })}>
      <View style={{ width: 52 }}>
        <Text style={[{ fontFamily: F.display, fontSize: 17, color: C.text }, num]}>{hhmm(c.start)}</Text>
        <Small style={num}>{c.duration} min</Small>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Strong style={[{ fontSize: 15 }, c.cancelled && { textDecorationLine: 'line-through' }]} numberOfLines={1}>{c.title}</Strong>
        <Small numberOfLines={1}>{c.coach} · {CLASS_META[c.type].label}</Small>
      </View>
      {status ?? (c.cancelled ? <Pill text="Cancelada" tone="bad" />
        : <Text style={[{ fontFamily: F.medium, fontSize: 14, color: full ? C.goldText : C.secondary }, num]}>{c.attendees.length}/{c.capacity}{c.waitlist.length ? ` +${c.waitlist.length}` : ''}</Text>)}
    </Pressable>
  );
}

/** 7-day strip for picking a day. */
export function DayStrip({ value, onChange, days = 7 }: { value: string; onChange: (k: string) => void; days?: number }) {
  const today = new Date();
  const items = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { key, wd: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()], n: d.getDate() };
  });
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {items.map(it => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${it.wd} ${it.n}`} onPress={() => onChange(it.key)}
            style={{ flex: 1, height: 62, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.ink : C.surface, gap: 2 }}>
            <Text style={{ fontFamily: F.medium, fontSize: 12, color: on ? C.gold : C.secondary }}>{it.wd}</Text>
            <Text style={[{ fontFamily: F.display, fontSize: 18, color: on ? C.onInk : C.text }, num]}>{it.n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Small card heading with an icon on the left, used on Hoje. */
export function CardHead({ icon, text, dark }: { icon: IconName; text: string; dark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={15} color={dark ? C.gold : C.goldText} />
      <Text style={{ fontFamily: F.medium, fontSize: 13, color: dark ? C.gold : C.goldText }}>{text}</Text>
    </View>
  );
}
