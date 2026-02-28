import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import type { Db } from "mongodb";

let auth: any = null;

export const initializeAuth = (database: Db): any => {
  auth = betterAuth({
    database: mongodbAdapter(database),
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
  });
  return auth;
};

export const getAuth = (): any => {
  if (!auth) {
    throw new Error("Auth not initialized. Call initializeAuth first.");
  }
  return auth;
};
