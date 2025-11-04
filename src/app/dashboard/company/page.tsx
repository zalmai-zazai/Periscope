import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";
import User from "@/models/User";
import { LogoutButton } from "@/components/LogoutButton";
import { JoinCodeManager } from "./JoinCodeManager";
import { TeamManager } from "./TeamManager";
import { CompanySettings } from "@/components/CompanySettings";

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }
  if (session.user?.role !== "admin") {
    redirect("/dashboard");
  }
  await dbConnect();

  // Get company data
  const company = await Company.findOne({ _id: session.user.companyId });
  // Get users in this company
  // Update this line to include isActive:
  const users = await User.find({ companyId: session.user.companyId }).select(
    "name email role isActive" // ADD isActive here
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Company Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <LogoutButton />

              <span className="text-gray-600 dark:text-gray-300">Welcome!</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {company?.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Join Code
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white font-mono">
                {company?.joinCode}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subscription Plan
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {company?.subscription?.plan || "Free"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Role
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white capitalize">
                {session.user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Company Settings Card */}
        <CompanySettings initialCompany={JSON.parse(JSON.stringify(company))} />

        {/* Team Members Card */}
        <JoinCodeManager joinCode={company?.joinCode} />
        <TeamManager initialUsers={JSON.parse(JSON.stringify(users))} />
        {/* Join Code Section - Using Client Component */}
      </main>
    </div>
  );
}
