import { Stack } from 'expo-router'
import { Colors } from '@/constants/colors'

export default function AppLayout() {
  return (
    // @ts-expect-error expo-router@3.5 + @types/react@19 monorepo type mismatch
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  )
}
