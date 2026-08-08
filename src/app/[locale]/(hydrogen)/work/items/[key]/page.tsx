'use client';

import { useParams } from 'next/navigation';
import WorkItemDetail from '@/app/shared/work-management/work-item-detail';

export default function WorkItemDetailPage() {
  const params = useParams();
  const key = decodeURIComponent(String(params?.key ?? ''));
  return <WorkItemDetail itemKey={key} />;
}
