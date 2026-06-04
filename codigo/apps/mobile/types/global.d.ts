// expo-router@3.5 + @types/react@19 type mismatch in monorepos.
// expo-router's ReactNode (from module import) includes `bigint` (react@19),
// but the global React.ReactNode doesn't. Patching the global to include it.
import type React from 'react'

declare global {
  namespace React {
    type ReactNode =
      | React.ReactChild
      | React.ReactFragment
      | React.ReactPortal
      | boolean
      | null
      | undefined
      | bigint
  }
}
