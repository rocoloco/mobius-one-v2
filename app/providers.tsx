'use client'

import { HeroUIProvider } from '@heroui/react'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  )
}