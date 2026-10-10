export interface HighlightsPagePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  settings: boolean;
}

const has = (userPermissions: string[], key: string) =>
  userPermissions.includes(key);

export function resolveHighlightsPermissions(
  userPermissions: string[] = []
): HighlightsPagePermissions {
  const highlights = has(userPermissions, 'highlights');

  return {
    view: highlights,
    create: highlights,
    update: highlights,
    delete: highlights,
    settings: highlights,
  };
}
