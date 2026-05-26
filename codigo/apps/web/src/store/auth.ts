import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UsuarioSession } from '@brain-master/shared/tipos'

interface AuthState {
  usuario: UsuarioSession | null
  _hasHydrated: boolean
  setAuth: (usuario: UsuarioSession) => void
  clearAuth: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      _hasHydrated: false,
      setAuth: (usuario) => set({ usuario }),
      clearAuth: () => set({ usuario: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'bm-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
