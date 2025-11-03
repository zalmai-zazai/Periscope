import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import SignUpForm from "./SignUpForm";

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  // If user is already signed in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return <SignUpForm />;
}
