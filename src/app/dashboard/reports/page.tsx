import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { ReportsDashboard } from "@/components/reports/ReportsDashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/LogoutButton";
// import { ReportsDashboard } from "@/components/reports/ReportsDashboard";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  await dbConnect();

  // Fetch projects for this user/company
  let query: any = { companyId: session.user.companyId };

  // Role-based filtering (same as your dashboard)
  if (session.user?.role === "inspector") {
    query.inspectorId = session.user.id;
  } else if (session.user?.role === "mitigation-tech") {
    query.$or = [
      { mitTechId: session.user.id },
      {
        status: "needs_field_review",
        $or: [{ mitTechId: { $exists: false } }, { mitTechId: null }],
      },
    ];
  } else if (session.user?.role === "estimator") {
    query.$or = [
      { estimatorId: session.user.id },
      { status: { $in: ["ready_for_estimate", "estimating", "sent"] } },
    ];
  }

  const projects = await Project.find(query)
    .select("name projectNumber status clientName createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Reports Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                Welcome, {session.user?.name}!
              </span>

              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReportsDashboard
          projects={JSON.parse(JSON.stringify(projects))}
          userRole={session.user.role}
        />
      </main>
    </div>
  );
}
