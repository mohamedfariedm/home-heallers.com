'use client'
import React from 'react'
import { QueryClient, QueryClientProvider,  DehydratedState } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type Props = {
  dehydratedState: DehydratedState,
  children: React.ReactNode
}

export default function Providers({ children }: any) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <I18nextProvider i18n={i18n}>   
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
    
    </I18nextProvider>
  )
}