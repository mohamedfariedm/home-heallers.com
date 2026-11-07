import { Suspense } from 'react';
import Header from '@/layouts/hydrogen/header';
import Sidebar from '@/layouts/hydrogen/sidebar';

function SidebarFallback() {
  return (
    <aside className="fixed bottom-0 start-0 z-50 hidden h-full w-[270px] border-e border-gray-100 bg-white xl:block 2xl:w-72" />
  );
}

export default function HydrogenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-grow bg-gradient-to-br from-slate-50 via-[#E8ECF5]/40 to-blue-50/20 dark:bg-gray-50">
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar className="fixed hidden xl:block" />
      </Suspense>
      <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
        <Header />
        <div className="flex flex-grow flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 lg:pt-3 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9">
          {children}
        </div>
      </div>
    </main>
  );
}
