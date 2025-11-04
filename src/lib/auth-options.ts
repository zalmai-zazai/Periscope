import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./mongodb-client";
import dbConnect from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔍 Starting authentication for:", credentials?.email);

          await dbConnect();

          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing email or password");
            return null;
          }

          // Find user by email
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          }).select("+password");

          if (!user) {
            console.log("❌ No user found with email:", credentials.email);
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            console.log("❌ User account is inactive:", credentials.email);
            throw new Error("Your account has been suspended");
          }

          console.log("🔍 User found, verifying password...");

          // Verify password
          const isPasswordValid = await user.comparePassword(
            credentials.password
          );

          if (!isPasswordValid) {
            console.log("❌ Invalid password for:", credentials.email);
            return null;
          }

          console.log("✅ Password valid, returning user data");

          // Return user data without password
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId.toString(),
          };
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role and companyId to token on sign in
      if (user) {
        // user can be AdapterUser | YourUserModel — cast locally for these custom fields
        const u = user as any;
        if (u.role) {
          token.role = u.role;
        }
        if (u.companyId) {
          // ensure companyId is a string (mongoose ObjectId may be an object)
          token.companyId =
            typeof u.companyId === "string" ? u.companyId : String(u.companyId);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add role and companyId to session
      if (token) {
        // Ensure session.user object exists (defensive)
        session.user = session.user ?? ({} as any);

        // token.sub is the user id set by next-auth
        if (token.sub) {
          session.user.id = token.sub;
        }

        // token.role / token.companyId may be undefined, so guard
        if ((token as any).role) {
          session.user.role = (token as any).role as string;
        }
        if ((token as any).companyId) {
          session.user.companyId = (token as any).companyId as string;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
};
