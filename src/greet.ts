import { MONTHS, WEEKDAYS } from './data';

export const greeting = (d = new Date()) => d.getHours() < 12 ? 'Bom dia' : d.getHours() < 20 ? 'Boa tarde' : 'Boa noite';
export const todayLong = (d = new Date()) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()}`;
export const firstName = (name: string) => name.split(' ')[0];
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
