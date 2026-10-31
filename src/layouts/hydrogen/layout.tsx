import Header from '@/layouts/hydrogen/header';
import Sidebar from '@/layouts/hydrogen/sidebar';

export default function HydrogenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-grow bg-gray-50/60 dark:bg-gray-50">
      <Sidebar className="fixed hidden dark:bg-gray-50 xl:block pb-5" />
      <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
        <Header />
        <div className="flex flex-grow flex-col px-4 pb-6 pt-3 md:px-5 lg:px-6 lg:pb-8 lg:pt-4 3xl:px-8 3xl:pt-5 4xl:px-10 4xl:pb-9">
          {children}
        </div>
      </div>
    </main>
  );
}
