'use client'
import ProductsTable from '@/app/shared/products/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useProducts } from '@/framework/products';
import Spinner from '@/components/ui/spinner';
import ProductForm from '@/app/shared/products/product-form'
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';

import ProfileSettingsView from '@/app/shared/account-settings/profile-settings';
import { useFindUsers } from '@/framework/users';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Profile',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Profile',
    },
  ],
};

export default function ProfilePage() {

  const id:any =Cookies.get('userId');    
  const { data,isLoading} = useFindUsers(id)  
    return<>
    
    {
        isLoading ? (
            <div className="m-auto">
                <Spinner size="lg" />
            </div>
        ) : (
    <ProfileSettingsView initValues={data?.data}/>
    )
  }
    </>
    

  ;
}
