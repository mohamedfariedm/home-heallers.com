export interface GeoRegionsPagePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export function resolveGeoRegionsPermissions(
  userPermissions: string[] = []
): GeoRegionsPagePermissions {
  const allowed = userPermissions.includes('geo_regions');

  return {
    view: allowed,
    create: allowed,
    update: allowed,
    delete: allowed,
  };
}
