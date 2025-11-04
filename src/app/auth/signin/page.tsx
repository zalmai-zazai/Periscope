import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // If user is already signed in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
