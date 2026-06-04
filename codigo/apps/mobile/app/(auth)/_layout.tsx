import { Stack } from 'expo-router'

export default function AuthLayout() {
  // @ts-expect-error expo-router@3.5 + @types/react@19 monorepo type mismatch
  return <Stack screenOptions={{ headerShown: false }} />
}
