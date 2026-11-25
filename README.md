# Pulse Wellness Club — App (demo)

iOS + Android app (Expo / React Native) built in the visual identity of @pulsewclub (black + gold, *Excellence in Motion*). The whole UI is in European Portuguese.

## Two apps in one
On the sign-in screen you pick **Cliente** or **Personal Trainer** (demo; real accounts come with the backend). Both share the same data.

Visual style: **Giz** (light chalk background, black ink, gold accents). Navigation uses Expo Router; every screen lives in `src/app/`.

### Cliente (`src/app/cliente/`)
- **Hoje**: weekly goal ring and streak, next booked class with check-in, today's workout, the monthly fee only when it is due, latest club news
- **Agenda**: my bookings and waitlist, day-by-day timetable with filters
- **Eu**: member card, weekly goal (2 / 3 / 4), progress chart and records, payments, notification settings, privacy
- Focused screens: `treino` (one exercise at a time, sets and rest timer), `pagar` (MB WAY / Multibanco, simulated), `checkin`, `aula/[id]`, `notificacoes`

### Personal Trainer (`src/app/pt/`)
- **Hoje**: month revenue, "Precisa de ti" (overdue fees, clients at risk with WhatsApp / Já falei / Adiar, full classes with waitlist), today's classes, + button (new client, class, announcement, payment)
- **Clientes**: search and filters (em atraso, em risco, pendentes, pagos); client record in `ficha/[id]` (resumo, treino, avaliações, pagamentos, notas)
- **Agenda**: classes by day, create and cancel (with a message to attendees)
- **Caixa**: month by month, remind one or all overdue, register cash / transfer, share report

### Code map
- `src/data.ts`: data model, seed data and rules (fees, payment status, weekly goal and streak with one free pause a month, at-risk detection)
- `src/store.tsx`: shared state and actions (AsyncStorage for now; Supabase in the next phase)
- `src/theme.ts`, `src/ui.tsx`, `src/components.tsx`: Giz tokens and component set

## Run it
```powershell
npm install
npx expo start
```
- On your phone: install **Expo Go** (App Store / Play Store) and scan the QR code.
- In the browser: `npx expo start --web`.

## Publish to the stores
```powershell
npx eas-cli@latest build --platform all
npx eas-cli@latest submit
```
(Needs an Apple Developer account at €99/year and Google Play at a one-time $25.)

## Before going to production
This version keeps its data **on the device** (AsyncStorage) so it can be shown as a demo. For real use:
1. A backend with authentication (e.g. Supabase or Firebase): the `src/store.tsx` API stays the same.
2. Real payments: Easypay / SIBS (MB WAY + Multibanco) or Stripe, with automatic confirmation via webhook.
3. Push notifications (expo-notifications) for reminders and payments.
4. The official logo and photos of the gym in `assets/`.
