import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Archivo_500Medium, Archivo_700Bold } from '@expo-google-fonts/archivo';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { StoreProvider, useStore } from '../store';
import { C } from '../theme';
import { Toast } from '../ui';

function Shell() {
  const { ready, toastMsg } = useStore();
  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.ink} /></View>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="treino" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="pagar" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="novo/cliente" options={{ presentation: 'modal' }} />
        <Stack.Screen name="novo/aula" options={{ presentation: 'modal' }} />
        <Stack.Screen name="novo/aviso" options={{ presentation: 'modal' }} />
      </Stack>
      <Toast msg={toastMsg} />
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ Archivo_500Medium, Archivo_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
