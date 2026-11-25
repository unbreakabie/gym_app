import React from 'react';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useStore } from '../../store';
import { PillTabBar } from '../../components';

export default function ClienteLayout() {
  const { s } = useStore();
  if (s.session?.role !== 'client') return <Redirect href="/" />;
  return (
    <Tabs screenOptions={{ headerShown: false }}
      tabBar={p => <PillTabBar {...p} icons={{ hoje: 'sunny-outline', agenda: 'calendar-outline', eu: 'person-outline' }} />}>
      <Tabs.Screen name="hoje" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="eu" options={{ title: 'Eu' }} />
    </Tabs>
  );
}
