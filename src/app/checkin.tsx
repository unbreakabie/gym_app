import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../store';
import { C, R } from '../theme';
import { Btn, Card, Icon, Screen, Small, Strong } from '../ui';
import { useMe } from '../components';
import { localIso } from '../data';

// Check-in at reception: the client scans the QR poster on the wall.
// The camera scan arrives with the backend (Phase 3); the demo simulates the scan.
export default function Checkin() {
  const { checkIn } = useStore();
  const me = useMe();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/cliente/hoje'));
  if (!me) return null;
  const done = me.checkins.some(x => x.startsWith(localIso(new Date()).slice(0, 10)));
  return (
    <Screen title="Check-in" onBack={close} bottomPad={40}>
      <View style={{ aspectRatio: 1, maxWidth: '100%', borderRadius: R.xl, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <View style={{ width: '62%', aspectRatio: 1, borderRadius: R.lg, borderWidth: 3, borderColor: C.gold, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={done ? 'checkmark-circle' : 'qr-code-outline'} size={64} color={C.gold} />
        </View>
      </View>
      <Card style={{ gap: 6 }}>
        <Strong>{done ? 'Check-in de hoje feito.' : 'Aponta a câmara ao QR da receção.'}</Strong>
        <Small>{done ? 'Bom treino! Conta para o teu objetivo semanal.' : 'O código está na parede junto à entrada. Só conta um check-in por dia.'}</Small>
      </Card>
      {done
        ? <Btn title="Voltar" onPress={close} />
        : <Btn title="Simular leitura do QR" icon="scan-outline" onPress={() => { checkIn(me.id); close(); }} />}
    </Screen>
  );
}
