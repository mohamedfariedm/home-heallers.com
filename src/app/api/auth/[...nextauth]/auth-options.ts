// app/api/auth/[...nextauth]/auth-options.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import client from '@/framework/utils';

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
            console.log('Authorize - Using provided user data:', credentials.user);
            return JSON.parse(credentials.user);
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
            const permissions = data.data.permissions?.map((perm: any) => perm.name) || [];
            console.log('Authorize - Permissions:', permissions);
            return {
              id: data.data.user.id.toString(),
              email: data.data.user.email,
              name: data.data.user.name.en,
              token: data.data.token,
              permissions,
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
        token.permissions = user.permissions;
        console.log('JWT callback - Token:', token);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.token = token.token;
      session.user.permissions = token.permissions;
      console.log('Session callback - Session:', session);
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