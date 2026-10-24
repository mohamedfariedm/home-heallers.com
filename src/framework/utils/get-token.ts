import Cookies from 'js-cookie';
import { getLocaleFromPathname } from '@/lib/locale';

export const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return Cookies.get('auth_token');
};

export const getLocale = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return getLocaleFromPathname(window.location.pathname);
};
