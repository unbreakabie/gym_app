import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { BRAND, C, F } from '../theme';
import { Avatar, Body, Btn, Card, Icon, Small, Strong } from '../ui';
import { planOf } from '../data';

// Demo sign-in. Real accounts (email code, Cliente / PT roles) replace this in Phase 3.
export default function Entrar() {
  const { s, login } = useStore();
  const inset = useSafeAreaInsets();
  const [pick, setPick] = useState(false);

  const go = (role: 'client' | 'trainer', id?: string) => {
    login(role, id);
    router.replace(role === 'trainer' ? '/pt/hoje' : '/cliente/hoje');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ flexGrow: 1, paddingTop: inset.top + 28, paddingHorizontal: 20, paddingBottom: inset.bottom + 28, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.display, fontSize: 18, color: C.gold }}>P</Text>
        </View>
        <View>
          <Text style={{ fontFamily: F.display, fontSize: 18, letterSpacing: 2, color: C.ink }}>{BRAND.short}</Text>
          <Small>Wellness Club · {BRAND.city}</Small>
        </View>
      </View>

      <View style={{ marginTop: 48, gap: 14 }}>
        <Text style={{ fontFamily: F.display, fontSize: 38, lineHeight: 44, color: C.ink }}>Força para a saúde, longevidade e performance.</Text>
        <Body style={{ color: C.secondary, fontSize: 17, lineHeight: 24 }}>As tuas aulas, o plano do teu PT e a tua mensalidade, num só sítio.</Body>
      </View>

      <View style={{ flex: 1, minHeight: 32 }} />

      {!pick ? (
        <Card tone="ink" style={{ gap: 12, padding: 20 }}>
          <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.gold }}>Versão de demonstração</Text>
          <Btn title="Entrar como Cliente" variant="gold" onPress={() => setPick(true)} />
          <Btn title="Entrar como Personal Trainer" variant="outlineLight" onPress={() => go('trainer')} />
          <Small style={{ color: C.onInkMuted, textAlign: 'center' }}>{BRAND.tagline}</Small>
        </Card>
      ) : (
        <Card style={{ gap: 4 }}>
          <Pressable accessibilityRole="button" onPress={() => setPick(false)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
            <Icon name="chevron-back" size={20} color={C.ink} />
            <Strong style={{ fontSize: 15 }}>Escolhe um cliente de demonstração</Strong>
          </Pressable>
          {s.clients.slice(0, 5).map(c => (
            <Pressable key={c.id} accessibilityRole="button" onPress={() => go('client', c.id)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, borderTopWidth: 1, borderTopColor: C.hairline, opacity: pressed ? 0.7 : 1 })}>
              <Avatar name={c.name} size={40} />
              <View style={{ flex: 1 }}>
                <Strong style={{ fontSize: 15 }}>{c.name}</Strong>
                <Small>{planOf(s, c).name}{c.founder ? ' · Founding Member' : ''}</Small>
              </View>
              <Icon name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}
