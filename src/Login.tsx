import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R, font, BRAND } from './theme';
import { useStore } from './store';
import { Avatar, Btn, Icon, LogoMark, Row, Wordmark } from './ui';

export default function Login() {
  const { s, login } = useStore();
  const inset = useSafeAreaInsets();
  const [pickClient, setPickClient] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ flexGrow: 1, paddingTop: inset.top + 24, paddingHorizontal: 24, paddingBottom: inset.bottom + 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <LogoMark size={40} />
        <View><Wordmark size={18} /><Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Wellness Club · {BRAND.city}</Text></View>
      </View>

      <View style={{ marginTop: 64 }}>
        <Text style={{ color: C.text, fontSize: 40, lineHeight: 44, fontWeight: '500' }}>Treino de força para a saúde, longevidade e performance</Text>
        <Text style={{ color: C.secondary, marginTop: 16, fontSize: 17, lineHeight: 24 }}>As tuas aulas, o plano do teu PT e a tua mensalidade, num só sítio</Text>
        <Text style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>PT Studio · Treino de Força · Pilates Reformer</Text>
      </View>

      <View style={{ flex: 1, minHeight: 40 }} />

      {!pickClient ? (
        <View style={{ gap: 12 }}>
          <Btn title="Entrar como Cliente" onPress={() => setPickClient(true)} />
          <Btn title="Entrar como Personal Trainer" variant="ghost" onPress={() => login('trainer')} />
          <Text style={{ color: C.faint, textAlign: 'center', fontSize: 12, marginTop: 8 }}>Versão de demonstração · {BRAND.tagline}</Text>
        </View>
      ) : (
        <View>
          <Row style={{ marginBottom: 12 }}>
            <Pressable onPress={() => setPickClient(false)} hitSlop={10}><Icon name="chevron-back" size={22} color={C.text} /></Pressable>
            <Text style={[font.label, { color: C.muted }]}>Escolhe um cliente de demonstração</Text>
          </Row>
          {s.clients.slice(0, 5).map(c => (
            <Pressable key={c.id} onPress={() => login('client', c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, marginBottom: 8 }}>
              <Avatar name={c.name} size={38} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: '500' }}>{c.name}</Text>
                <Text style={{ color: C.muted, fontSize: 13 }}>{s.plans.find(p => p.id === c.planId)?.name}{c.founder ? ' · Sócio fundador' : ''}</Text>
              </View>
              <Icon name="chevron-forward" size={16} color={C.faint} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
