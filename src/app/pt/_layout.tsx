import React from 'react';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useStore } from '../../store';
import { PillTabBar } from '../../components';

export default function PtLayout() {
  const { s } = useStore();
  if (s.session?.role !== 'trainer') return <Redirect href="/" />;
  return (
    <Tabs screenOptions={{ headerShown: false }}
      tabBar={p => <PillTabBar {...p} icons={{ hoje: 'sunny-outline', clientes: 'people-outline', agenda: 'calendar-outline', caixa: 'card-outline' }} />}>
      <Tabs.Screen name="hoje" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="clientes" options={{ title: 'Clientes' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="caixa" options={{ title: 'Caixa' }} />
    </Tabs>
  );
}
