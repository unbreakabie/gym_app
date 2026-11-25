import { Redirect } from 'expo-router';
import { useStore } from '../store';

/** Sends people to the right home for their role. */
export default function Index() {
  const { s } = useStore();
  if (!s.session) return <Redirect href="/entrar" />;
  return <Redirect href={s.session.role === 'trainer' ? '/pt/hoje' : '/cliente/hoje'} />;
}
