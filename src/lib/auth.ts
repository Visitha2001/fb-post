import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              savedFaces: [],
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user", error);
          return false;
        }
      }
      return false;
    },
    async session({ session }) {
      if (session?.user?.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          (session.user as any).id = dbUser._id.toString();
        }
      }
      return session;
    },
  },
  secret: process.env.JWT_SECRET || "default_secret",
};
