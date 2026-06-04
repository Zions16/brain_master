import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '@/store/auth.store'

export default function RootLayout() {
  const { access_token } = useAuthStore()
  const segments = useSegments()

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'

    if (!access_token && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (access_token && inAuthGroup) {
      router.replace('/(app)')
    }
  }, [access_token, segments])

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
