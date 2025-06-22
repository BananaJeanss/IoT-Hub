import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  // extend the default Session for custom properties
  // has image, name, and email by default
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
      isEmailVerified?: boolean;
    };
  }

  // extend the default User for custom properties
  interface User extends DefaultUser {
    isEmailVerified?: boolean;
  }
}
