import { useMutation } from '@tanstack/react-query';
import client from '@/framework/utils';
import { setAuthCredentials } from '@/utils/auth-utils';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { usePermissions } from '@/context/PermissionsContext';
import { signIn, signOut } from 'next-auth/react';

export function useLogin() {
  const { setPermissions } = usePermissions();

  return useMutation({
    mutationFn: client.auth.login,
    onSuccess: async ({ data }) => {
      console.log('useLogin - Response:', data);
      const token = data?.data?.token;
      const userId = data?.data?.user?.id;
      const permissions = data?.data?.permissions?.map((perm: any) => perm.name) || [];
      console.log('useLogin - Permissions:', permissions);

      if (token) {
        setAuthCredentials(token);
        setPermissions(permissions);
        localStorage.setItem('permissions', JSON.stringify(permissions));

        // Pass user data directly to next-auth session
        const signInResponse = await signIn('credentials', {
          redirect: false,
          // Pass the full user object to avoid another API call in authorize
          user: JSON.stringify({
            id: userId.toString(),
            email: data?.data?.user?.email,
            name: data?.data?.user?.name?.en,
            token,
            permissions,
          }),
        });

        if (signInResponse?.error) {
          console.error('useLogin - Next-auth signIn error:', signInResponse.error);
          toast.error('Failed to sign in with session.');
          return;
        }

        toast.success('Login successful');

        window.location.replace('/');

        setTimeout(() => {
          if (userId) {
            Cookies.set('userId', userId);
          }
        }, 0);
      } else {
        console.error('useLogin - No token found in response');
        toast.error('Login failed: No token received.');
      }
    },
    onError: (error) => {
      console.error('useLogin - Error:', error);
      toast.error("User doesn't exist. Verify your email and password.");
      setAuthCredentials('');
      setPermissions([]);
      localStorage.removeItem('permissions');
    },
  });
}

export function useLogout() {
  const { setPermissions } = usePermissions();

  return useMutation({
    mutationFn: client.auth.logout,
    onSuccess: () => {
      console.log('useLogout - Logout successful');
      setAuthCredentials('');
      setPermissions([]);
      localStorage.removeItem('permissions');
      Cookies.remove('userId');
      signOut({ callbackUrl: '/en/auth/login' });
    },
    onError: (error) => {
      console.error('useLogout - Error:', error);
      toast.error('Logout failed. Please try again.');
    },
  });
}
