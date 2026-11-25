import React, { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { C, R, font, num } from '../theme';
import { useStore, currentMonth } from '../store';
import {
  CLASS_META, ClassSession, ClassType, PayStatus, STATUS_LABEL, dayKey, euro, hhmm, localIso, monthLabel, monthlyFee, paymentStatus, shiftMonth, shortDate,
} from '../data';
import { Avatar, Btn, Card, Chip, Empty, Field, Header, Icon, Row, STATUS_COLOR, Screen, Section, Sheet, StatusBadge, Tag } from '../ui';
import { ClassCard, DayStrip } from '../shared';

/* ---------------- Payments: who paid this month ---------------- */
export function PaymentsScreen({ open }: { open: (id: string) => void }) {
  const { s, remind, remindAll } = useStore();
  const [month, setMonth] = useState(currentMonth());
  const cur = currentMonth();
  const rows = s.clients.map(c => ({ c, st: paymentStatus(c, month), fee: monthlyFee(s, c), p: c.payments.find(x => x.month === month) }))
    .filter(r => r.c.joined.slice(0, 7) <= month);
  const sum = (st: PayStatus) => rows.filter(r => r.st === st).reduce((a, r) => a + (r.p?.amount ?? r.fee), 0);
  const groups: PayStatus[] = ['overdue', 'pending', 'paid'];
  const paidPct = rows.length ? rows.filter(r => r.st === 'paid').length / rows.length : 0;

  const share = () => {
    const lines = groups.map(g => `${STATUS_LABEL[g].toUpperCase()} (${rows.filter(r => r.st === g).length})\n` +
      rows.filter(r => r.st === g).map(r => `• ${r.c.name} — ${euro(r.p?.amount ?? r.fee)}${r.p?.method ? ` (${r.p.method})` : ''}`).join('\n')).join('\n\n');
    Share.share({ message: `Pulse Wellness Club — Pagamentos ${monthLabel(month)}\nRecebido: ${euro(sum('paid'))}\n\n${lines}` }).catch(() => {});
  };

  return (
    <Screen>
      <Header eyebrow="Mensalidades" title="Pagamentos" right={<Pressable onPress={share} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Partilhar relatório"><Icon name="share-outline" size={18} color={C.secondary} /></Pressable>} />

      <Row style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={10} style={{ padding: 8 }}><Icon name="chevron-back" size={20} color={C.secondary} /></Pressable>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '500' }}>{monthLabel(month)}</Text>
        <Pressable disabled={month >= cur} onPress={() => setMonth(shiftMonth(month, 1))} hitSlop={10} style={{ padding: 8, opacity: month >= cur ? 0.3 : 1 }}><Icon name="chevron-forward" size={20} color={C.secondary} /></Pressable>
      </Row>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={[font.label, { color: C.muted }]}>Recebido</Text>
            <Text style={{ color: C.gold, fontSize: 28, lineHeight: 34, fontWeight: '500', ...num }}>{euro(sum('paid'))}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[font.label, { color: C.muted }]}>Por receber</Text>
            <Text style={{ color: C.text, fontSize: 20, lineHeight: 34, fontWeight: '500', ...num }}>{euro(sum('overdue') + sum('pending'))}</Text>
          </View>
        </Row>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: C.surface2, marginTop: 16, overflow: 'hidden' }}>
          <View style={{ width: `${paidPct * 100}%`, height: 4, backgroundColor: C.gold }} />
        </View>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 8, ...num }}>{rows.filter(r => r.st === 'paid').length} de {rows.length} clientes pagaram</Text>
      </Card>

      {rows.some(r => r.st === 'overdue') && (
        <Btn title={`Enviar lembrete a todos em atraso (${rows.filter(r => r.st === 'overdue').length})`} icon="notifications-outline" variant="ghost" onPress={() => remindAll(month)} style={{ marginTop: 12 }} />
      )}

      {groups.map(g => {
        const list = rows.filter(r => r.st === g);
        if (!list.length) return null;
        return (
          <Section key={g} title={`${STATUS_LABEL[g]} · ${list.length}`}>
            <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
            {list.map(({ c, fee, p }, i) => (
              <Pressable key={c.id} onPress={() => open(c.id)} style={({ pressed }) => ({ height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.border, opacity: pressed ? 0.7 : 1 })}>
                  <Avatar name={c.name} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.text, fontSize: 15 }}>{c.name}</Text>
                    <Row style={{ gap: 6 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: STATUS_COLOR[g] }} /><Text style={{ color: C.muted, fontSize: 13, ...num }}>
                      {p?.paidAt ? `${p.method} · ${shortDate(p.paidAt)}` : g === 'pending' ? `Vence a ${c.dueDay}` : `Venceu a ${c.dueDay}`}
                    </Text></Row>
                  </View>
                  <Text style={{ color: C.text, fontSize: 15, ...num }}>{euro(p?.amount ?? fee)}</Text>
                  {g !== 'paid' && (
                    <Pressable onPress={() => remind(c.id, month)} hitSlop={8} style={{ padding: 6 }} accessibilityLabel={`Lembrar ${c.name}`}>
                      <Icon name="notifications-outline" size={18} color={C.muted} />
                    </Pressable>
                  )}
              </Pressable>
            ))}
            </Card>
          </Section>
        );
      })}
    </Screen>
  );
}

/* ---------------- Classes management ---------------- */
export function ClassesAdmin() {
  const { s, cancelClass, addClass } = useStore();
  const [day, setDay] = useState(dayKey(new Date()));
  const [sel, setSel] = useState<ClassSession | null>(null);
  const [adding, setAdding] = useState(false);
  const list = s.classes.filter(c => c.start.startsWith(day));
  const live = sel ? s.classes.find(c => c.id === sel.id) ?? null : null;
  const name = (id: string) => s.clients.find(c => c.id === id)?.name ?? '—';
  const occ = list.length ? list.reduce((a, c) => a + c.attendees.length, 0) / list.reduce((a, c) => a + c.capacity, 0) : 0;

  return (
    <Screen>
      <Header eyebrow={`Ocupação ${Math.round(occ * 100)}%`} title="Aulas" right={<Btn small title="Nova" icon="add" onPress={() => setAdding(true)} />} />
      <DayStrip value={day} onChange={setDay} />
      <View style={{ height: 14 }} />
      {list.length ? list.map(c => <ClassCard key={c.id} c={c} onPress={() => setSel(c)} right={<Icon name="chevron-forward" size={18} color={C.faint} />} />)
        : <Card><Empty icon="calendar-outline" text="Sem aulas neste dia" /></Card>}

      <Sheet visible={!!live} onClose={() => setSel(null)} title={live?.title ?? ''}>
        {live && <>
          <Text style={{ color: C.muted }}>{shortDate(live.start)} · {hhmm(live.start)} · {live.duration} min · {live.coach}</Text>
          <Section title={`Inscritos ${live.attendees.length}/${live.capacity}`}>
            {live.attendees.length ? live.attendees.map(id => (
              <Row key={id} style={{ paddingVertical: 8 }}><Avatar name={name(id)} size={32} /><Text style={{ color: C.text, flex: 1 }}>{name(id)}</Text>
                {s.clients.find(c => c.id === id)?.checkins.some(x => x.startsWith(live.start.slice(0, 10))) ? <Tag text="Presente" color={C.success} /> : null}
              </Row>
            )) : <Text style={{ color: C.muted }}>Ainda sem inscritos.</Text>}
          </Section>
          {live.waitlist.length > 0 && (
            <Section title={`Lista de espera ${live.waitlist.length}`}>
              {live.waitlist.map(id => <Row key={id} style={{ paddingVertical: 6 }}><Avatar name={name(id)} size={28} /><Text style={{ color: C.muted }}>{name(id)}</Text></Row>)}
            </Section>
          )}
          {!live.cancelled && new Date(live.start) > new Date() && (
            <Btn title="Cancelar aula e notificar" variant="danger" icon="close-circle" onPress={() => { cancelClass(live.id); setSel(null); }} style={{ marginTop: 20 }} />
          )}
        </>}
      </Sheet>

      <NewClassSheet visible={adding} day={day} onClose={() => setAdding(false)} onSave={addClass} />
    </Screen>
  );
}

function NewClassSheet({ visible, day, onClose, onSave }: { visible: boolean; day: string; onClose: () => void; onSave: ReturnType<typeof useStore>['addClass'] }) {
  const [type, setType] = useState<ClassType>('forca');
  const [time, setTime] = useState('18:30');
  const [cap, setCap] = useState('8');
  const [coach, setCoach] = useState('Mike');
  const [dur, setDur] = useState('50');
  const titles: Record<ClassType, string> = { forca: 'Treino de Força', reformer: 'Pilates Reformer', mobilidade: 'Mobilidade & Core', pt: 'Sessão PT Studio' };
  const valid = /^\d{1,2}:\d{2}$/.test(time) && Number(cap) > 0;
  return (
    <Sheet visible={visible} onClose={onClose} title="Nova aula">
      <Text style={{ color: C.muted, marginBottom: 12 }}>{shortDate(day + 'T00:00:00')}</Text>
      <Text style={[font.label, { color: C.muted, marginBottom: 8 }]}>Tipo</Text>
      <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {(Object.keys(CLASS_META) as ClassType[]).map(t => <Chip key={t} label={CLASS_META[t].label} active={type === t} onPress={() => { setType(t); if (t === 'pt') setCap('1'); }} />)}
      </Row>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}><Field label="Hora" value={time} onChangeText={setTime} placeholder="18:30" /></View>
        <View style={{ flex: 1 }}><Field label="Duração (min)" value={dur} onChangeText={setDur} keyboardType="number-pad" /></View>
        <View style={{ flex: 1 }}><Field label="Vagas" value={cap} onChangeText={setCap} keyboardType="number-pad" /></View>
      </Row>
      <Field label="Treinador" value={coach} onChangeText={setCoach} />
      <Btn title="Criar aula" icon="add-circle" disabled={!valid} onPress={() => {
        const [h, m] = time.split(':').map(Number);
        const [y, mo, d] = day.split('-').map(Number);
        onSave({ type, title: titles[type], coach, start: localIso(new Date(y, mo - 1, d, h, m)), duration: Number(dur) || 50, capacity: Number(cap) });
        onClose();
      }} />
    </Sheet>
  );
}

/* ---------------- Announcements ---------------- */
export function AnnouncementsScreen() {
  const { s, announce } = useStore();
  const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [tag, setTag] = useState('Novidade');
  return (
    <Screen>
      <Header eyebrow={`Para ${s.clients.length} clientes`} title="Avisos" />
      <Card>
        <Field label="Título" value={title} onChangeText={setTitle} placeholder="Ex.: Horário de Natal" />
        <Field label="Mensagem" value={body} onChangeText={setBody} multiline placeholder="Escreve o aviso para todos os clientes…" />
        <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {['Novidade', 'Horário', 'Campanha', 'Workshop', 'Desafio'].map(t => <Chip key={t} label={t} active={tag === t} onPress={() => setTag(t)} />)}
        </Row>
        <Btn title="Publicar e notificar" icon="send" disabled={!title.trim() || !body.trim()} onPress={() => { announce(title.trim(), body.trim(), tag); setTitle(''); setBody(''); }} />
      </Card>
      <Section title="Publicados">
        {s.announcements.map(a => (
          <Card key={a.id} style={{ marginBottom: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}><Tag text={a.tag} /><Text style={{ color: C.faint, fontSize: 12 }}>{shortDate(a.date)}</Text></Row>
            <Text style={{ color: C.text, fontWeight: '500', fontSize: 16, marginTop: 8 }}>{a.title}</Text>
            <Text style={{ color: C.muted, marginTop: 4, lineHeight: 20 }}>{a.body}</Text>
          </Card>
        ))}
      </Section>
    </Screen>
  );
}
