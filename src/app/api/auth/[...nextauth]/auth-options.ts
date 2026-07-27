// app/api/auth/[...nextauth]/auth-options.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import client from '@/framework/utils';
import { extractRolesFromLoginPayload } from '@/utils/kpi-export';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        user: { label: 'User', type: 'text' }, // Add user field for pre-authenticated data
      },
      async authorize(credentials) {
        try {
          // If user data is provided (from signIn), use it directly
          if (credentials?.user) {
            const parsed = JSON.parse(credentials.user);
            // Never put permissions in the JWT — cookie size blows up nginx buffers.
            const { permissions: _permissions, ...safeUser } = parsed;
            return safeUser;
          }

          // Otherwise, make API call to authenticate
          console.log('Authorize - Making login request with:', credentials);
          const response = await client.auth.login({
            email: credentials?.email,
            password: credentials?.password,
          });
          console.log('Authorize - Login response:', response);
          const { data } = response;

          if (data?.data?.token) {
            const roles = extractRolesFromLoginPayload(data);
            return {
              id: data.data.user.id.toString(),
              email: data.data.user.email,
              name: data.data.user.name.en,
              token: data.data.token,
              roles,
            };
          }
          console.log('Authorize - No token found in response');
          return null;
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.token = user.token;
        token.roles = user.roles;
      }
      // Drop any legacy permissions claim from older cookies
      if ('permissions' in token) {
        delete token.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.token = token.token;
      session.user.roles = token.roles;
      return session;
    },
  },
  pages: {
    signIn: '/en/auth/login',
    signOut: '/en/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in .env
};

export default NextAuth(authOptions);