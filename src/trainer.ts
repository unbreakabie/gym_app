// Calculations for the trainer's screens.
import { AppState, Client, monthKey, monthLabel, monthlyFee, paymentStatus } from './data';

export function monthSummary(s: AppState, today = new Date(), month = monthKey(today)) {
  const active = s.clients.filter(c => c.joined.slice(0, 7) <= month);
  const paid: Client[] = [], pending: Client[] = [], overdue: Client[] = [];
  let received = 0, expected = 0, overdueAmount = 0;
  for (const c of active) {
    const fee = monthlyFee(s, c);
    expected += fee;
    const st = paymentStatus(c, month, today);
    if (st === 'paid') { paid.push(c); received += c.payments.find(p => p.month === month)?.amount ?? fee; }
    else if (st === 'pending') pending.push(c);
    else { overdue.push(c); overdueAmount += fee; }
  }
  const r = (n: number) => Math.round(n * 100) / 100;
  return { month, label: monthLabel(month), paid, pending, overdue, received: r(received), expected: r(expected), overdueAmount: r(overdueAmount) };
}

export const whatsappUrl = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export const TRAINER_NAME = 'Mike';
