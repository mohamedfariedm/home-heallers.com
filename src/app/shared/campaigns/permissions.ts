export interface CampaignsPagePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export function resolveCampaignsPermissions(
  userPermissions: string[] = []
): CampaignsPagePermissions {
  const allowed = userPermissions.includes('campaigns');

  return {
    view: allowed,
    create: allowed,
    update: allowed,
    delete: allowed,
  };
}
