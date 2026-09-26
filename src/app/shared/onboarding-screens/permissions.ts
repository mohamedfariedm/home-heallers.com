export interface OnboardingScreensPagePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export function resolveOnboardingScreensPermissions(
  userPermissions: string[] = []
): OnboardingScreensPagePermissions {
  const allowed = userPermissions.includes('onboarding_screens');

  return {
    view: allowed,
    create: allowed,
    update: allowed,
    delete: allowed,
  };
}
