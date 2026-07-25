export interface WithdrawalsPermissions {
  view: boolean;
  settle: boolean;
  reject: boolean;
}

const hasAny = (userPermissions: string[], keys: string[]) =>
  keys.some((key) => userPermissions.includes(key));

export function resolveWithdrawalsPermissions(
  userPermissions: string[] = []
): WithdrawalsPermissions {
  const canManage = hasAny(userPermissions, ['withdrawals.approve']);
  return {
    view: canManage,
    settle: canManage,
    reject: canManage,
  };
}
