import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UsuarioSession } from '@brain-master/shared/tipos'

interface AuthState {
  access_token: string | null
  usuario: UsuarioSession | null
  setAuth: (access_token: string, usuario: UsuarioSession) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access_token: null,
      usuario: null,
      setAuth: (access_token, usuario) => set({ access_token, usuario }),
      clearAuth: () => set({ access_token: null, usuario: null }),
    }),
    {
      name: 'bm-auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
