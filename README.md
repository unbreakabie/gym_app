# Pulse Wellness Club — App (demo)

iOS + Android app (Expo / React Native) built in the visual identity of @pulsewclub (black + gold, *Excellence in Motion*). The whole UI is in European Portuguese.

## Two apps in one
On the login screen you pick **Cliente** or **Personal Trainer**. Both share the same data, so anything the PT does (registering a payment, posting an announcement, cancelling a class) shows up straight away in the client app.

### Client
- **Início**: membership card (plan, Founding Member badge, payment status, *Pay now*), QR check-in, weekly goal, upcoming bookings, club news, notifications
- **Aulas**: weekly timetable (Força, Reformer, Mobilidade), book or cancel, waitlist, request a PT session
- **Treino**: training plan assigned by the PT, exercise checklist, history
- **Progresso**: weight / body-fat chart, check-ins, personal records
- **Perfil**: subscription, payment history, MB WAY / Multibanco / card payment (simulated), plan change, settings

### Personal Trainer
- **Painel**: revenue for the month (received vs expected), paid / pending / overdue counts, overdue list, today's classes, clients at risk of dropping out (no training in 10+ days)
- **Clientes**: search, filter by payment status, add a client, client record (call / WhatsApp, check-in, mark as paid, send a reminder, payment history, assign a training plan, body assessment, private notes)
- **Pagamentos**: who paid and who didn't, month by month; reminders one at a time or to everyone overdue; share the report
- **Aulas**: day-by-day timetable, occupancy, attendees and waitlist, create a class, cancel a class (attendees are notified)
- **Avisos**: publish news / campaigns, which notifies every client

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
