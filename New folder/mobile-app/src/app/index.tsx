import { Redirect } from 'expo-router';

export default function Index() {
  // Root layout handles auth-based routing via _layout.tsx
  // This simply redirects into the app group
  return <Redirect href="/(app)" />;
}
