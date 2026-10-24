export interface WalletPermissions {
  view: boolean;
  deposit: boolean;
  withdraw: boolean;
}

export function resolveWalletPermissions(
  userPermissions: string[] = []
): WalletPermissions {
  return {
    view: userPermissions.includes('wallet.view'),
    deposit: userPermissions.includes('wallet.deposit'),
    withdraw: userPermissions.includes('wallet.withdraw'),
  };
}
