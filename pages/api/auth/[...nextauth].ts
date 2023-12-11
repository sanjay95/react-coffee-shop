import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// My imports.
import validateCredentials from "../../../utils/db/validate-credentials";
import AffinidiProvider from "utils/AffinidiProvider";
import {
  authJwtSecret,
  providerClientId,
  providerClientSecret,
} from "utils/env";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: authJwtSecret,
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // Get user db document and validate credentials.
        let responseData = null;
        try {
          responseData = await validateCredentials(email, password);
          if (!responseData) {
            throw new Error();
          }
        } catch (error) {
          throw new Error(
            responseData
              ? responseData.errorMessage
              : "Failed to connect to the database!"
          );
        }

        // No user was found in our database.
        if (!responseData.user) {
          throw new Error(responseData.errorMessage);
        }

        // Return user object.
        return {
          id: responseData.user.id,
          email: responseData.user.email,
          name: `${responseData.user.firstName} ${responseData.user.lastName}`,
          image: null,
        };
      },
    }),
    AffinidiProvider({
      clientId: providerClientId,
      clientSecret: providerClientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      return {
        ...token,
        ...(account?.access_token && { accessToken: account?.access_token }),
        ...(account?.id_token && { idToken: account?.id_token }),
      };
    },
    async session({ session, token }) {
      return {
        ...session,
        ...(session.user && { user: { ...session.user, userId: token.sub } }),
        ...(token.accessToken && { accessToken: token.accessToken }),
        ...(token.idToken && { idToken: token.idToken }),
      };
    },
    // session: async ({ session, token }) => {
    //   if (session?.user && token.sub) {
    //     session.user.id = token.sub;
    //   }
    //   return session;
    // },
  },

};

// Handles all other auth routes.
export default NextAuth(authOptions);
