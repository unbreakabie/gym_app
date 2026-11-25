import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../store';
import { C, F, R, num } from '../theme';
import { Btn, Card, Empty, Field, Icon, IconName, Pill, Row, Screen, Small, Strong } from '../ui';
import { useMe } from '../components';
import { PayMethod, euro, monthKey, monthLabel, monthlyFee, unpaidMonths } from '../data';

type Method = 'MB WAY' | 'Multibanco';
const METHODS: { key: Method; icon: IconName; sub: string }[] = [
  { key: 'MB WAY', icon: 'phone-portrait-outline', sub: 'Aprovas na app do teu banco' },
  { key: 'Multibanco', icon: 'card-outline', sub: 'Entidade e referência para pagar no multibanco ou homebanking' },
];

// Demo payment. In Phase 4 this calls Easypay and the status updates by webhook.
export default function Pagar() {
  const { s, markPaid } = useStore();
  const me = useMe();
  const [method, setMethod] = useState<Method>('MB WAY');
  const [phone, setPhone] = useState(me?.phone ?? '');
  const [step, setStep] = useState<'choose' | 'waiting'>('choose');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/cliente/hoje'));
  if (!me) return null;

  const owed = unpaidMonths(me, monthKey(new Date()));
  if (owed.length === 0) return <Screen title="Pagamento" onBack={close} bottomPad={40}><Empty icon="checkmark-circle-outline" text="Está tudo pago. Obrigado!" /></Screen>;
  const month = owed[0];
  const amount = monthlyFee(s, me);
  const pay = () => { markPaid(me.id, month, method as PayMethod); close(); };
  const ref = '123 456 789';

  return (
    <Screen title="Pagar mensalidade" onBack={close} bottomPad={40}>
      <Card tone="ink" style={{ padding: 20 }}>
        <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.gold }}>{monthLabel(month)}{owed.length > 1 ? ` · mais ${owed.length - 1} em falta` : ''}</Text>
        <Text style={[{ fontFamily: F.display, fontSize: 40, color: C.onInk }, num]}>{euro(amount)}</Text>
        {me.founder && <Small style={{ color: C.onInkMuted }}>Inclui 20% de desconto Founding Member</Small>}
      </Card>

      {step === 'choose' ? <>
        <Card style={{ paddingVertical: 6, gap: 0 }}>
          {METHODS.map((m, i) => {
            const on = method === m.key;
            return (
              <Pressable key={m.key} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setMethod(m.key)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68, borderTopWidth: i ? 1 : 0, borderTopColor: C.hairline }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name={m.icon} size={20} color={C.ink} /></View>
                <View style={{ flex: 1 }}><Strong style={{ fontSize: 15 }}>{m.key}</Strong><Small>{m.sub}</Small></View>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
                  {on && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink }} />}
                </View>
              </Pressable>
            );
          })}
        </Card>
        {method === 'MB WAY'
          ? <>
            <Field label="Número MB WAY" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Btn title={`Enviar pedido de ${euro(amount)}`} disabled={phone.replace(/\D/g, '').length < 9} onPress={() => setStep('waiting')} />
          </>
          : <>
            <Card style={{ gap: 10 }}>
              <Row style={{ justifyContent: 'space-between' }}><Small>Entidade</Small><Strong style={num}>00000</Strong></Row>
              <Row style={{ justifyContent: 'space-between' }}><Small>Referência</Small><Strong style={num}>{ref}</Strong></Row>
              <Row style={{ justifyContent: 'space-between' }}><Small>Montante</Small><Strong style={num}>{euro(amount)}</Strong></Row>
              <Pill text="Exemplo: a referência real vem do Easypay" tone="gold" />
            </Card>
            <Btn title="Simular pagamento recebido" onPress={pay} />
          </>}
      </> : (
        <Card style={{ gap: 12, alignItems: 'center', padding: 24, borderRadius: R.lg }}>
          <Icon name="phone-portrait-outline" size={32} color={C.ink} />
          <Strong style={{ textAlign: 'center' }}>Aprova o pagamento na app MB WAY</Strong>
          <Small style={{ textAlign: 'center' }}>Enviámos um pedido de {euro(amount)} para {phone}. Tens 4 minutos. O estado muda para Pago assim que aprovares.</Small>
          <Btn title="Simular aprovação" onPress={pay} style={{ alignSelf: 'stretch' }} />
          <Btn title="Mudar método" variant="ghost" onPress={() => setStep('choose')} />
        </Card>
      )}
      <Small style={{ textAlign: 'center', paddingHorizontal: 12 }}>Versão de demonstração: nenhum valor é cobrado.</Small>
    </Screen>
  );
}
