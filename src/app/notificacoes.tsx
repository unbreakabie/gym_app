import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useStore } from '../store';
import { C } from '../theme';
import { Card, Empty, Icon, IconName, ListRow, Screen } from '../ui';
import { useMe } from '../components';
import { Notification, shortDate } from '../data';

const ICON: Record<Notification['kind'], IconName> = { payment: 'card-outline', class: 'calendar-outline', news: 'megaphone-outline', workout: 'barbell-outline' };

export default function Notificacoes() {
  const { readNotifications } = useStore();
  const me = useMe();
  useEffect(() => { if (me) readNotifications(me.id); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => (router.canGoBack() ? router.back() : router.replace('/cliente/hoje'));
  if (!me) return null;
  return (
    <Screen title="Notificações" onBack={close} bottomPad={40}>
      <Card style={{ paddingVertical: 4 }}>
        {me.notifications.length === 0 ? <Empty icon="notifications-off-outline" text="Sem notificações." />
          : me.notifications.slice(0, 40).map((n, i) => (
            <ListRow key={n.id} first={i === 0} title={n.title} sub={`${n.body} · ${shortDate(n.date)}`}
              icon={<Icon name={ICON[n.kind]} size={20} color={n.read ? C.muted : C.goldText} />} />
          ))}
      </Card>
    </Screen>
  );
}
