import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { Btn, Chip, Field, Label, Row, Screen, Small } from '../../ui';
import { euro } from '../../data';

export default function NovoCliente() {
  const { s, addClient } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+351 ');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');
  const [planId, setPlanId] = useState(s.plans[0].id);
  const [founder, setFounder] = useState(false);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/pt/clientes'));
  const valid = name.trim().length > 2 && phone.replace(/\D/g, '').length >= 9 && /.+@.+\..+/.test(email);
  const plan = s.plans.find(p => p.id === planId)!;

  return (
    <Screen title="Novo cliente" onBack={close} bottomPad={40}>
      <Field label="Nome" value={name} onChangeText={setName} placeholder="Nome e apelido" autoCapitalize="words" />
      <Field label="Telemóvel" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Recebe aqui o convite para entrar" />
      <Field label="Objetivo" value={goal} onChangeText={setGoal} placeholder="Ex.: ganhar força" />
      <Label>Plano</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {s.plans.map(p => <Chip key={p.id} label={p.name} active={p.id === planId} onPress={() => setPlanId(p.id)} />)}
      </ScrollView>
      <Row>
        <Chip label="Founding Member (−20%)" active={founder} onPress={() => setFounder(f => !f)} />
      </Row>
      <Small>{euro(Math.round(plan.price * (founder ? 0.8 : 1) * 100) / 100)} por mês</Small>
      <Btn title="Adicionar cliente" disabled={!valid}
        onPress={() => { addClient({ name: name.trim(), phone: phone.trim(), email: email.trim(), planId, founder, goal: goal.trim() || 'Ganhar força' }); close(); }} />
    </Screen>
  );
}
