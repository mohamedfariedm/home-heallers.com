// utils/menuUtils.ts
interface MenuItem {
  name: string;
  href?: string;
  icon?: JSX.Element;
  permissions?: string;
  nameAr?: string;
  dropdownItems?: MenuItem[];
}

export function filterMenuItemsByPermissions(
  menuItems: MenuItem[],
  userPermissions: string[]
): MenuItem[] {
    console.log('User Permissions:', userPermissions);
    console.log('Menu Items:', menuItems);
    
  return menuItems.filter((item) => {
    // Include labels (no href or permissions)
    if (!item.href && !item.permissions) {
      return true;
    }

    // Include items without permissions or with 'all_brands'
    if (!item.permissions || item.permissions === 'clients') {
      return true;
    }

    // Include items where the user has the required permission
    return userPermissions.includes(item.permissions);
  });
}