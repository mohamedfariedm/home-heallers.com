'use client';

import WorkflowsPanel from '@/app/shared/work-management/workflows-panel';
import { WmPageHeader } from '@/app/shared/work-management/ui';

export default function WorkflowsPage() {
  return (
    <div>
      <WmPageHeader
        title="Workflows"
        description="Configurable status flows per department or project (Development, HR, Support, or custom)."
      />
      <WorkflowsPanel />
    </div>
  );
}
