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
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }
  if (session.user?.role !== "admin") {
    redirect("/dashboard");
  }
  await dbConnect();
  const isAdmin = session.user?.role === "admin";
  // Get company data
  const company = await Company.findOne({ _id: session.user.companyId });
  // Get users in this company
  // Update this line to include isActive:
  const users = await User.find({ companyId: session.user.companyId }).select(
    "name email role isActive" // ADD isActive here
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={isAdmin} session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* Back to Dashboard Link - Left on desktop, top-left on mobile */}
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base order-1 sm:order-1 self-start sm:self-auto"
          >
            ← Back to Dashboard
          </Link>

          {/* Title and Description - Center on both mobile and desktop */}
          <div className="text-center order-2 sm:order-2">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-white">
              Company Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              Configure company settings and manage user access and permissions
            </p>
          </div>

          {/* Spacer - Hidden on mobile, visible on desktop */}
          <div className="hidden sm:block w-24 order-3 sm:order-3"></div>
        </div>
        {/* Company Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 p-6 mb-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Company Information
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="group p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Company Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                {company?.name}
              </p>
            </div>

            {/* Join Code */}
            <div className="group p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                Join Code
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-600 px-3 py-2 rounded border transition-all duration-300 group-hover:border-green-300 dark:group-hover:border-green-600 group-hover:text-green-700 dark:group-hover:text-green-300">
                {company?.joinCode}
              </p>
            </div>

            {/* Subscription Plan */}
            <div className="group p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Subscription Plan
              </label>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  {company?.subscription?.plan || "Free"}
                </p>
                {company?.subscription?.plan &&
                  company.subscription.plan !== "Free" && (
                    <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full font-medium">
                      Active
                    </span>
                  )}
              </div>
            </div>

            {/* Your Role */}
            <div className="group p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:scale-[1.02]">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                Your Role
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize transition-colors duration-300 group-hover:text-orange-700 dark:group-hover:text-orange-300">
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
