"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserInfoStep } from "./components/UserInfoStep";
import { CompanySelectionStep } from "./components/CompanySelectionStep";
export default function SignUpForm() {
  const [step, setStep] = useState(1); // 1: user info, 2: company selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // User form data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Company selection data
  const [companySelection, setCompanySelection] = useState({
    option: "", // 'create' | 'join' | 'invite'
    companyName: "",
    joinCode: "",
  });

  const router = useRouter();

  // Handle the final account creation
  const handleCreateAccount = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🔍 Creating account with:", { userData, companySelection });

      // Validation
      if (!companySelection.option) {
        setError("Please select a company setup option");
        return;
      }

      if (
        companySelection.option === "create" &&
        !companySelection.companyName.trim()
      ) {
        setError("Please enter a company name");
        return;
      }

      if (
        companySelection.option === "join" &&
        !companySelection.joinCode.trim()
      ) {
        setError("Please enter a join code");
        return;
      }

      // Call our updated signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          option: companySelection.option,
          companyName: companySelection.companyName,
          joinCode: companySelection.joinCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      console.log("✅ Account creation response:", result);

      // Auto-login after successful account creation
      const loginResult = await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error(
          "Account created but auto-login failed. Please sign in manually."
        );
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Account creation error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <a
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              sign in to existing account
            </a>
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 1: User Information */}
        {step === 1 && (
          <UserInfoStep
            userData={userData}
            setUserData={setUserData}
            onNext={() => setStep(2)}
          />
        )}

        {/* Step 2: Company Selection */}
        {step === 2 && (
          <CompanySelectionStep
            companySelection={companySelection}
            setCompanySelection={setCompanySelection}
            onBack={() => setStep(1)}
            onSubmit={handleCreateAccount}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
