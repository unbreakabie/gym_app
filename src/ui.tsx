// Shared UI building blocks in the Pulse visual language.
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle, TextStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R, num } from './theme';
import { PayStatus, STATUS_LABEL, initials } from './data';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export const Icon = Ionicons;

/* Logo: gold disc with a slanted P — echoes the @pulsewclub avatar. */
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: size * 0.58, fontWeight: '900', fontStyle: 'italic', marginLeft: size * 0.04, marginTop: -size * 0.03 }}>P</Text>
    </View>
  );
}
export function Wordmark({ size = 22, color = C.text }: { size?: number; color?: string }) {
  return <Text style={{ color, fontSize: size, fontWeight: '900', fontStyle: 'italic', letterSpacing: size * 0.22 }}>PULSE</Text>;
}

export function Screen({ children, scroll = true, padded = true }: { children: React.ReactNode; scroll?: boolean; padded?: boolean }) {
  const inset = useSafeAreaInsets();
  const style = { paddingTop: inset.top + 16, paddingHorizontal: padded ? 20 : 0, paddingBottom: 112 };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: C.bg }, style]}>{children}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={style} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Header({ eyebrow, title, right, onBack }: { eyebrow?: string; title: string; right?: React.ReactNode; onBack?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={s.iconBtn} accessibilityLabel="Voltar">
          <Icon name="chevron-back" size={20} color={C.text} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>{eyebrow}</Text> : null}
        <Text style={{ color: C.text, fontSize: 28, lineHeight: 34, fontWeight: '500' }} numberOfLines={1}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style, onPress, gold }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[]; onPress?: () => void; gold?: boolean }) {
  const base = [s.card, gold && { backgroundColor: C.gold, borderColor: C.gold }, style] as ViewStyle[];
  if (!onPress) return <View style={base}>{children}</View>;
  return <Pressable onPress={onPress} style={({ pressed }) => [...base, pressed && { backgroundColor: C.surface2 }]}>{children}</Pressable>;
}

export function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 32 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: C.text, fontSize: 17, lineHeight: 24, fontWeight: '500' }}>{title}</Text>
        {action ? <Pressable onPress={onAction} hitSlop={10}><Text style={{ color: C.secondary, fontSize: 14 }}>{action}</Text></Pressable> : null}
      </View>
      {children}
    </View>
  );
}

export function Btn({ title, onPress, variant = 'gold', icon, small, style, disabled }: {
  title: string; onPress?: () => void; variant?: 'gold' | 'ghost' | 'dark' | 'danger'; icon?: IconName; small?: boolean; style?: ViewStyle; disabled?: boolean;
}) {
  // gold = the one primary action; ghost/dark = quiet secondary on the raised surface; danger = destructive text.
  const bg = { gold: C.gold, ghost: C.surface2, dark: C.surface2, danger: 'transparent' }[variant];
  const fg = disabled ? C.muted : { gold: C.onGold, ghost: C.text, dark: C.text, danger: C.danger }[variant];
  const border = { gold: C.gold, ghost: C.border, dark: C.border, danger: C.border }[variant];
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [{
      backgroundColor: disabled ? C.surface2 : bg, borderColor: disabled ? C.border : border, borderWidth: 1, borderRadius: small ? 8 : 10,
      height: small ? 36 : 48, paddingHorizontal: small ? 12 : 16,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    }, pressed && { transform: [{ scale: 0.97 }] }, style]}>
      {icon ? <Icon name={icon} size={16} color={fg} /> : null}
      <Text numberOfLines={1} style={{ color: fg, fontWeight: small ? '500' : '600', fontSize: small ? 14 : 15, flexShrink: 1 }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, count }: { label: string; active?: boolean; onPress?: () => void; count?: number }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: C.surface2, borderColor: 'rgba(245,241,234,0.16)' }]} accessibilityState={{ selected: !!active }}>
      <Text style={{ color: active ? C.text : C.muted, fontWeight: '500', fontSize: 14 }}>
        {label}{count !== undefined ? <Text style={{ color: C.faint, ...num }}>  {count}</Text> : null}
      </Text>
    </Pressable>
  );
}

export const STATUS_COLOR: Record<PayStatus, string> = { paid: C.success, pending: C.warning, overdue: C.danger };
/* Status reads as a small coloured dot plus text — no tinted pill. */
export function StatusBadge({ status }: { status: PayStatus }) {
  const col = STATUS_COLOR[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col }} />
      <Text style={{ color: C.secondary, fontSize: 13 }}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function Tag({ text, color }: { text: string; color?: string }) {
  return (
    <View style={{ paddingHorizontal: 8, height: 22, justifyContent: 'center', borderRadius: R.sm, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {color ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} /> : null}
      <Text style={{ color: C.secondary, fontSize: 12 }}>{text}</Text>
    </View>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.secondary, fontWeight: '500', fontSize: Math.round(size * 0.36) }}>{initials(name)}</Text>
    </View>
  );
}

export function Stat({ label, value, sub, color = C.text, style }: { label: string; value: string; sub?: string; color?: string; style?: ViewStyle }) {
  return (
    <View style={[s.card, { flex: 1, padding: 16 }, style]}>
      <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>{label}</Text>
      <Text style={{ color, fontSize: 28, lineHeight: 32, fontWeight: '500', marginTop: 4, ...num }} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {sub ? <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 4 }}>{sub}</Text> : null}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;
}

export function T({ children, style, muted, size = 15, bold }: { children: React.ReactNode; style?: TextStyle | TextStyle[]; muted?: boolean; size?: number; bold?: boolean }) {
  return <Text style={[{ color: muted ? C.muted : C.text, fontSize: size, fontWeight: bold ? '500' : '400' }, style as TextStyle]}>{children}</Text>;
}

export function Progress({ value, color = C.gold, height = 4 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: C.surface2, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height, backgroundColor: color }} />
    </View>
  );
}

/* The signature: a square set mark, gold when done. Used for sets, weekly sessions and check-ins. */
export function Mark({ on, size = 12 }: { on: boolean; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: Math.max(3, Math.round(size / 5)), backgroundColor: on ? C.gold : C.surface2, borderWidth: 1, borderColor: on ? C.gold : C.border, alignItems: 'center', justifyContent: 'center' }}>
      {on && size >= 20 ? <Icon name="checkmark" size={Math.round(size / 2)} color={C.onGold} /> : null}
    </View>
  );
}

export function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 8 }}>{label}</Text>
      <TextInput placeholderTextColor={C.faint} {...props}
        style={[{ backgroundColor: C.surface2, borderRadius: R.md, borderWidth: 1, borderColor: C.border, color: C.text, paddingHorizontal: 12, height: 44, fontSize: 15 }, props.multiline && { height: 96, paddingVertical: 12, textAlignVertical: 'top' }]} />
    </View>
  );
}

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const inset = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1, backgroundColor: '#000000AA' }} onPress={onClose} />
        <View style={{ backgroundColor: C.surface, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, borderTopWidth: 1, borderColor: C.border, maxHeight: '88%', paddingBottom: inset.bottom + 16 }}>
          <View style={{ alignItems: 'center', paddingTop: 8 }}><View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.surface2 }} /></View>
          <Row style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
            <Text style={{ color: C.text, fontSize: 20, lineHeight: 28, fontWeight: '500', flex: 1 }}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fechar"><Icon name="close" size={20} color={C.muted} /></Pressable>
          </Row>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Empty({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, gap: 12 }}>
      <Icon name={icon} size={24} color={C.faint} />
      <Text style={{ color: C.muted, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}

export type Tab = { key: string; label: string; icon: IconName; badge?: number };
export function TabBar({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (k: string) => void }) {
  const inset = useSafeAreaInsets();
  return (
    <View style={[s.tabbar, { paddingBottom: Math.max(inset.bottom, 10) }]}>
      {tabs.map(t => {
        const on = t.key === active;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} style={{ flex: 1, alignItems: 'center', gap: 4, paddingTop: 8 }} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <View>
              <Icon name={`${t.icon}-outline` as IconName} size={22} color={on ? C.text : C.muted} />
              {t.badge ? <View style={s.badge} /> : null}
            </View>
            <Text style={{ fontSize: 11, fontWeight: '500', color: on ? C.text : C.muted }}>{t.label}</Text>
            <View style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: on ? C.gold : 'transparent' }} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toast({ msg }: { msg: string | null }) {
  const inset = useSafeAreaInsets();
  if (!msg) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: inset.top + 8, left: 20, right: 20, alignItems: 'center' }}>
      <View style={{ backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, height: 44, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
        <Icon name="checkmark" size={16} color={C.gold} />
        <Text style={{ color: C.text, fontSize: 14, fontWeight: '500' }}>{msg}</Text>
      </View>
    </View>
  );
}

/* A decorative check-in code drawn with Views (deterministic from the member id). */
export function MemberCode({ id, size = 168 }: { id: string; size?: number }) {
  const n = 21; const cell = size / n;
  let h = 7; for (const ch of id) h = (h * 131 + ch.charCodeAt(0)) >>> 0;
  const finder = (r: number, c: number) => {
    const inF = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]]) if (inF(r0, c0)) {
      const rr = r - r0, cc = c - c0;
      return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) ? 1 : 0;
    }
    return -1;
  };
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    let on = finder(r, c);
    if (on === -1) { h = (h * 1103515245 + 12345) >>> 0; on = (h >>> 16) % 2; }
    if (on) cells.push(<View key={`${r}-${c}`} style={{ position: 'absolute', left: c * cell, top: r * cell, width: cell + 0.5, height: cell + 0.5, backgroundColor: '#111' }} />);
  }
  return <View style={{ width: size, height: size, backgroundColor: '#fff' }}>{cells}</View>;
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16 },
  chip: { paddingHorizontal: 12, height: 36, justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: 'transparent' },
  iconBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  tabbar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', backgroundColor: '#0E0E10F2', borderTopWidth: 1, borderTopColor: C.border },
  badge: { position: 'absolute', top: 0, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: C.danger, borderWidth: 1.5, borderColor: '#0E0E10' },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
});
