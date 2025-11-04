import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // your user id
      role:
        | "admin"
        | "estimator"
        | "project-manager"
        | "inspector"
        | "mitigation-tech";
      companyId: string; // if you have this
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}
