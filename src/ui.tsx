// Giz component set: every screen is built from these.
import React from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleProp,
  Text, TextInput, TextStyle, View, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Circle, Rect } from 'react-native-svg';
import { C, F, R, num } from './theme';
import type { PayStatus, RiskLevel } from './data';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export const Icon = Ionicons;

/* ---------------- text ---------------- */
type TProps = { children: React.ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number };
export const Title = ({ children, style }: TProps) =>
  <Text accessibilityRole="header" style={[{ fontFamily: F.display, fontSize: 30, lineHeight: 36, color: C.text }, style]}>{children}</Text>;
export const H2 = ({ children, style }: TProps) =>
  <Text accessibilityRole="header" style={[{ fontFamily: F.display, fontSize: 22, lineHeight: 28, color: C.text }, style]}>{children}</Text>;
export const Body = ({ children, style, numberOfLines }: TProps) =>
  <Text numberOfLines={numberOfLines} style={[{ fontFamily: F.body, fontSize: 15, lineHeight: 21, color: C.text }, style]}>{children}</Text>;
export const Strong = ({ children, style, numberOfLines }: TProps) =>
  <Text numberOfLines={numberOfLines} style={[{ fontFamily: F.semibold, fontSize: 16, lineHeight: 22, color: C.text }, style]}>{children}</Text>;
export const Small = ({ children, style, numberOfLines }: TProps) =>
  <Text numberOfLines={numberOfLines} style={[{ fontFamily: F.body, fontSize: 13, lineHeight: 18, color: C.secondary }, style]}>{children}</Text>;
export const Label = ({ children, style }: TProps) =>
  <Text style={[{ fontFamily: F.semibold, fontSize: 15, color: C.text, marginBottom: 8, marginTop: 4 }, style]}>{children}</Text>;
export const Big = ({ children, style }: TProps) =>
  <Text style={[{ fontFamily: F.display, fontSize: 40, lineHeight: 46, color: C.text }, num, style]}>{children}</Text>;

/* ---------------- layout ---------------- */
export function Screen({ children, scroll = true, title, eyebrow, right, onBack, bottomPad = 120 }: {
  children: React.ReactNode; scroll?: boolean; title?: string; eyebrow?: string; right?: React.ReactNode;
  onBack?: () => void; bottomPad?: number;
}) {
  const inset = useSafeAreaInsets();
  const head = (title || onBack) ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        {onBack && <IconBtn icon="chevron-back" label="Voltar" onPress={onBack} plain />}
        <View style={{ flex: 1 }}>
          {eyebrow && <Small>{eyebrow}</Small>}
          {title && <Title style={onBack ? { fontSize: 24, lineHeight: 30 } : undefined}>{title}</Title>}
        </View>
      </View>
      {right}
    </View>
  ) : null;
  const pad = { paddingTop: inset.top + 16, paddingHorizontal: 20, paddingBottom: inset.bottom + bottomPad };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: C.bg }, pad]}>{head}{children}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={[pad, { gap: 14 }]} keyboardShouldPersistTaps="handled">
      {head}{children}
    </ScrollView>
  );
}

export const Row = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) =>
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;

type CardTone = 'white' | 'ink' | 'gold' | 'inset';
const CARD_BG: Record<CardTone, string> = { white: C.surface, ink: C.ink, gold: C.goldTint, inset: C.surface2 };
export function Card({ children, tone = 'white', style, onPress, label }: {
  children: React.ReactNode; tone?: CardTone; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string;
}) {
  const base: ViewStyle = { backgroundColor: CARD_BG[tone], borderRadius: R.lg, padding: 18, gap: 8 };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>{children}</Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 }}>
      <Strong style={{ fontSize: 15 }}>{title}</Strong>
      {action && <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12}><Text style={{ fontFamily: F.medium, fontSize: 14, color: C.goldText }}>{action}</Text></Pressable>}
    </Row>
  );
}

/** A row inside a white card: title, subtitle, and something on the right. */
export function ListRow({ title, sub, right, onPress, first, icon }: {
  title: string; sub?: string; right?: React.ReactNode; onPress?: () => void; first?: boolean; icon?: React.ReactNode;
}) {
  const inner = (
    <>
      {icon}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Strong style={{ fontSize: 15 }} numberOfLines={1}>{title}</Strong>
        {sub ? <Small numberOfLines={2}>{sub}</Small> : null}
      </View>
      {right}
    </>
  );
  const style: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10, borderTopWidth: first ? 0 : 1, borderTopColor: C.hairline };
  if (!onPress) return <View style={style}>{inner}</View>;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [style, pressed && { opacity: 0.7 }]}>{inner}</Pressable>;
}

/* ---------------- controls ---------------- */
type BtnVariant = 'ink' | 'gold' | 'outline' | 'outlineLight' | 'ghost' | 'danger';
export function Btn({ title, onPress, variant = 'ink', icon, small, style, disabled, loading }: {
  title: string; onPress?: () => void; variant?: BtnVariant; icon?: IconName; small?: boolean;
  style?: StyleProp<ViewStyle>; disabled?: boolean; loading?: boolean;
}) {
  const v = {
    ink: { bg: C.ink, fg: C.onInk, bd: C.ink },
    gold: { bg: C.gold, fg: C.ink, bd: C.gold },
    outline: { bg: 'transparent', fg: C.ink, bd: C.ink },
    outlineLight: { bg: 'transparent', fg: C.onInk, bd: C.onInkMuted },
    ghost: { bg: 'transparent', fg: C.goldText, bd: 'transparent' },
    danger: { bg: 'transparent', fg: C.danger, bd: C.danger },
  }[variant];
  const h = small ? 40 : 50;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [{
        height: h, minWidth: 44, borderRadius: R.pill, paddingHorizontal: small ? 16 : 22,
        backgroundColor: v.bg, borderWidth: 1.5, borderColor: v.bd,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      }, style]}>
      {loading ? <ActivityIndicator color={v.fg} /> : <>
        {icon && <Icon name={icon} size={small ? 16 : 18} color={v.fg} />}
        <Text style={{ fontFamily: F.semibold, fontSize: small ? 13 : 15, color: v.fg }}>{title}</Text>
      </>}
    </Pressable>
  );
}

export function IconBtn({ icon, label, onPress, plain, badge, dark }: {
  icon: IconName; label: string; onPress?: () => void; plain?: boolean; badge?: number; dark?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6}
      style={({ pressed }) => [{
        width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
        backgroundColor: plain ? 'transparent' : dark ? C.ink : C.surface, opacity: pressed ? 0.7 : 1,
      }]}>
      <Icon name={icon} size={20} color={dark ? C.gold : C.ink} />
      {!!badge && <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
        <Text style={{ color: '#fff', fontSize: 10, fontFamily: F.semibold }}>{badge}</Text>
      </View>}
    </Pressable>
  );
}

export function Chip({ label, active, onPress, count }: { label: string; active?: boolean; onPress?: () => void; count?: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!active }} onPress={onPress}
      style={{ height: 38, paddingHorizontal: 14, borderRadius: R.pill, justifyContent: 'center', backgroundColor: active ? C.ink : C.surface, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={{ fontFamily: F.medium, fontSize: 14, color: active ? C.onInk : C.text }}>{label}</Text>
      {count !== undefined && <Text style={[{ fontFamily: F.medium, fontSize: 13, color: active ? C.gold : C.muted }, num]}>{count}</Text>}
    </Pressable>
  );
}

/** Segmented choice, e.g. weekly goal 2 / 3 / 4. */
export function Segmented<T extends string | number>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.surface2, borderRadius: R.pill, padding: 4, gap: 4 }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <Pressable key={String(o.value)} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)}
            style={{ flex: 1, height: 42, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.ink : 'transparent' }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 14, color: on ? C.onInk : C.text }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: F.medium, fontSize: 14, color: C.secondary }}>{label}</Text>
      <TextInput placeholderTextColor={C.muted} accessibilityLabel={label} {...props}
        style={[{ height: props.multiline ? 110 : 50, borderRadius: R.md, backgroundColor: C.surface2, paddingHorizontal: 16, paddingTop: props.multiline ? 14 : 0, fontFamily: F.body, fontSize: 16, color: C.text, textAlignVertical: props.multiline ? 'top' : 'center' }, props.style]} />
    </View>
  );
}

/* ---------------- status ---------------- */
type PillTone = 'ok' | 'warn' | 'bad' | 'neutral' | 'gold' | 'dark';
const PILL: Record<PillTone, { bg: string; fg: string }> = {
  ok: { bg: C.successTint, fg: C.success }, warn: { bg: C.warningTint, fg: C.warning }, bad: { bg: C.dangerTint, fg: C.danger },
  neutral: { bg: C.surface2, fg: C.secondary }, gold: { bg: C.goldTint, fg: C.goldText }, dark: { bg: C.inkSoft, fg: C.onInk },
};
export function Pill({ text, tone = 'neutral' }: { text: string; tone?: PillTone }) {
  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, height: 26, borderRadius: 13, justifyContent: 'center', backgroundColor: PILL[tone].bg }}>
      <Text style={{ fontFamily: F.medium, fontSize: 12, color: PILL[tone].fg }}>{text}</Text>
    </View>
  );
}
const PAY_TONE: Record<PayStatus, PillTone> = { paid: 'ok', pending: 'warn', overdue: 'bad' };
const PAY_LABEL: Record<PayStatus, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Em atraso' };
export const PayPill = ({ status }: { status: PayStatus }) => <Pill text={PAY_LABEL[status]} tone={PAY_TONE[status]} />;
const RISK_TONE: Record<RiskLevel, PillTone> = { ok: 'neutral', watch: 'warn', risk: 'bad' };
const RISK_TEXT: Record<RiskLevel, string> = { ok: 'Ativo', watch: 'A observar', risk: 'Em risco' };
export const RiskPill = ({ level }: { level: RiskLevel }) => <Pill text={RISK_TEXT[level]} tone={RISK_TONE[level]} />;

export function Avatar({ name, size = 44, dark = true }: { name: string; size?: number; dark?: boolean }) {
  const ini = name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: dark ? C.ink : C.surface2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: F.semibold, fontSize: size * 0.36, color: dark ? C.gold : C.ink }}>{ini}</Text>
    </View>
  );
}

export function Bar({ value, dark, height = 8 }: { value: number; dark?: boolean; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: dark ? '#34312C' : C.border, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height, borderRadius: height / 2, backgroundColor: dark ? C.gold : C.goldDeep }} />
    </View>
  );
}

/** Weekly goal ring: `done` of `goal`. */
export function GoalRing({ done, goal, size = 76 }: { done: number; goal: number; size?: number }) {
  const r = size / 2 - 6, circ = 2 * Math.PI * r, frac = Math.min(1, goal ? done / goal : 0);
  return (
    <View accessible accessibilityLabel={`${done} de ${goal} treinos esta semana`} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.border} strokeWidth={8} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.goldDeep} strokeWidth={8} fill="none"
          strokeDasharray={`${circ * frac} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={[{ fontFamily: F.display, fontSize: size * 0.24, color: C.text }, num]}>{done}/{goal}</Text>
    </View>
  );
}

/* ---------------- overlays ---------------- */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const inset = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityLabel="Fechar" onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.overlay }} />
        <View style={{ backgroundColor: C.bg, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: '88%', paddingBottom: inset.bottom + 16 }}>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
            <H2>{title}</H2>
            <IconBtn icon="close" label="Fechar" onPress={onClose} />
          </Row>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 14 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Toast({ msg }: { msg: string | null }) {
  const inset = useSafeAreaInsets();
  if (!msg) return null;
  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 20, right: 20, bottom: inset.bottom + 96, backgroundColor: C.ink, borderRadius: R.md, paddingVertical: 14, paddingHorizontal: 18 }}>
      <Text style={{ fontFamily: F.medium, fontSize: 15, color: C.onInk }}>{msg}</Text>
    </View>
  );
}

export function Empty({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}>
      <Icon name={icon} size={28} color={C.muted} />
      <Small style={{ textAlign: 'center' }}>{text}</Small>
    </View>
  );
}

/** Member code shown at reception. A pattern made from the member id (a real QR comes with the backend). */
export function MemberCode({ id, size = 168 }: { id: string; size?: number }) {
  const n = 21, cell = size / n;
  let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    if (finder) {
      const fx = x >= n - 7 ? x - (n - 7) : x, fy = y >= n - 7 ? y - (n - 7) : y;
      if (fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4)) cells.push({ x, y });
      continue;
    }
    h = (h * 1103515245 + 12345) >>> 0;
    if ((h >>> 16) % 2) cells.push({ x, y });
  }
  return (
    <Svg width={size} height={size} accessibilityLabel="Código de sócio">
      <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" />
      {cells.map(c => <Rect key={`${c.x}-${c.y}`} x={c.x * cell} y={c.y * cell} width={cell} height={cell} fill={C.ink} />)}
    </Svg>
  );
}
