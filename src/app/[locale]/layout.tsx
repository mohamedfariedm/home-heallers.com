import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';
import Provider from './Provider';
import { ThemeProvider } from '@/app/shared/theme-provider';
import { siteConfig } from '@/config/site.config';
import "@fontsource/lexend-deca"; // Defaults to weight 400
import "@fontsource/lexend-deca/400.css"; // Specify weight
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/400.css"; // Specify weight


const NextProgress = dynamic(() => import('@/components/next-progress'), {
  ssr: false,
});
// styles
import '@/app/globals.css';
import { PermissionsProvider } from '@/context/PermissionsContext';



export function generateStaticParams() {
  return ['en', 'ar'].map(locale => ({ locale }));
}

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  // Add CSRF meta tag
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000'),
  csrfToken: process.env.CSRF_TOKEN || 'your-csrf-token', // Set in .env or generate dynamically
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string;}
}) {
  const session = await getServerSession(authOptions);
  const language= locale
  console.log('main Layout : ',language)

  return (
<html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <meta name="csrf-token" content={process.env.CSRF_TOKEN || 'your-csrf-token'} />
      </head>
      <body
        suppressHydrationWarning
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        
        <Provider>
          <AuthProvider session={session}>
            <ThemeProvider>
              <PermissionsProvider initialPermissions={session?.user?.permissions || []}>
                <NextProgress />
                {children}
                <Toaster />
                <GlobalDrawer />
                <GlobalModal />
              </PermissionsProvider>
            </ThemeProvider>
          </AuthProvider>
        </Provider>
        
      </body>
    </html>
  );
}
