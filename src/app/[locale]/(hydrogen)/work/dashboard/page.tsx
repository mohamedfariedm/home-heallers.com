'use client';

import { Button } from '@/components/ui/button';
import WorkDashboard from '@/app/shared/work-management/dashboard';
import { WmPageHeader } from '@/app/shared/work-management/ui';
import { useResetWmDemoData } from '@/framework/work-management/work-items';
import { WmActorSwitcher } from '@/framework/work-management/actor-switcher';
import WmNotificationsPanel from '@/app/shared/work-management/notifications-panel';

export default function WorkDashboardPage() {
  const reset = useResetWmDemoData();
  return (
    <div>
      <WmPageHeader
        title="Work Management Dashboard"
        description="KPIs across departments. Click a card to open the filtered work list. (Mock data — localStorage)"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <WmActorSwitcher />
            <Button
              variant="outline"
              size="sm"
              isLoading={reset.isPending}
              onClick={() => reset.mutate()}
            >
              Reset demo data
            </Button>
          </div>
        }
      />
      <div className="mb-6">
        <WmNotificationsPanel />
      </div>
      <WorkDashboard />
    </div>
  );
}
