import Cookies from 'js-cookie';

export const getToken = () => {
  if (typeof window === undefined) {
    return null;
  }
  return Cookies.get('auth_token');
};

export const getLocale = () => {
  if (typeof window === undefined) {
    return null;
  }
  return Cookies.get('NEXT_LOCALE')
}
