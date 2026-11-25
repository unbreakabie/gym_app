import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { C } from './src/theme';
import Login from './src/Login';
import ClientApp from './src/client/ClientApp';
import TrainerApp from './src/trainer/TrainerApp';

function Root() {
  const { s, ready } = useStore();
  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.gold} /></View>;
  if (!s.session) return <Login />;
  return s.session.role === 'trainer' ? <TrainerApp /> : <ClientApp />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <StatusBar style="light" />
          <Root />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
