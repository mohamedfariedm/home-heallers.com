'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import LocaleSync from '@/components/locale-sync'

type Props = {
  children: React.ReactNode
  locale: string
}

export default function Providers({ children, locale }: Props) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleSync locale={locale} />
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </I18nextProvider>
  )
}
