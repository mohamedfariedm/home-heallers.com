"use client";
import FileDashboard from '@/app/shared/file/dashboard';
import { useTranslation } from 'react-i18next';



export default function FileDashboardPage() {
    const { t } = useTranslation("common");

  return <FileDashboard />;
}
