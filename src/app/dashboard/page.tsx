import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { PendingInvites } from "@/components/PendingInvites";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { ThemeToggle } from "@/components/theme-toggle";

import Project from "@/models/Project";
import { MetricsPanel } from "@/components/MetricsPanel";
import { EnhancedMetricsPanel } from "@/components/EnhancedMetricsPanel";
import { KPIPanel } from "@/components/KPIPanel";
import { AttentionProjects } from "@/components/AttentionProjects";
import Navbar from "@/components/Navbar";
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  // Test comment: working in local-build-debug branch

  if (!session) {
    redirect("/auth/signin");
  }
  await dbConnect();

  const isAdmin = session.user?.role === "admin";
  const isInspector = session.user?.role === "inspector";
  const isEstimator = session.user?.role === "estimator";
  const teamMembersCount = await User.countDocuments({
    companyId: session.user.companyId,
    isActive: true,
  });
  const projectsCount = await Project.countDocuments({
    companyId: session.user.companyId,
  });
  const query: any = { companyId: session.user.companyId };
  // Your existing role-based filtering...
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

  // Get projects and count manually
  const projects = await Project.find(query).lean();

  // Manual counting - guaranteed to work
  const statusCountsMap: Record<string, number> = {};
  projects.forEach((project) => {
    statusCountsMap[project.status] =
      (statusCountsMap[project.status] || 0) + 1;
  });

  // Role-specific bucket definitions
  const getStatusBuckets = () => {
    const baseBuckets = [
      {
        id: "draft",
        label: "Writing Now",
        count: statusCountsMap["draft"] || 0,
        color: "bg-yellow-500",
        description: "Projects in draft phase",
      },
      {
        id: "needs_field_review",
        label: "Needs Field Review",
        count: statusCountsMap["needs_field_review"] || 0,
        color: "bg-orange-500",
        description: "Awaiting mitigation tech review",
      },
      {
        id: "field_in_progress",
        label: "In Technician Stage",
        count: statusCountsMap["field_in_progress"] || 0,
        color: "bg-blue-500",
        description: "Mitigation techs working on site",
      },
      {
        id: "ready_for_estimate",
        label: "Ready for Estimate",
        count: statusCountsMap["ready_for_estimate"] || 0,
        color: "bg-purple-500",
        description: "Ready for estimator review",
      },
      {
        id: "estimating",
        label: "In Estimation",
        count: statusCountsMap["estimating"] || 0,
        color: "bg-indigo-500",
        description: "Being processed by estimators",
      },
      {
        id: "sent",
        label: "Published",
        count: statusCountsMap["sent"] || 0,
        color: "bg-green-500",
        description: "Completed and sent to clients",
      },
    ];

    // Filter buckets based on user role
    switch (session.user?.role) {
      case "inspector":
        return baseBuckets.filter((bucket) =>
          ["draft", "needs_field_review"].includes(bucket.id),
        );
      case "mitigation-tech":
        return baseBuckets.filter((bucket) =>
          ["needs_field_review", "field_in_progress"].includes(bucket.id),
        );
      case "estimator":
        return baseBuckets.filter((bucket) =>
          ["ready_for_estimate", "estimating", "sent"].includes(bucket.id),
        );
      default:
        return baseBuckets; // Admin sees all
    }
  };

  const statusBuckets = getStatusBuckets();

  // Add this after your statusBuckets calculation
  const calculateMetrics = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Simple metrics calculation
    const completedProjects = projects.filter((p) => p.status === "sent");
    const readyProjects = projects.filter(
      (p) => p.status === "ready_for_estimate",
    );
    const estimatingProjects = projects.filter(
      (p) => p.status === "estimating",
    );

    // Weekly throughput
    const weeklyThroughput = completedProjects.filter(
      (p) => p.sentAt && new Date(p.sentAt) >= sevenDaysAgo,
    ).length;

    // Previous week throughput (for trend)
    const previousWeekThroughput = completedProjects.filter(
      (p) =>
        p.sentAt &&
        new Date(p.sentAt) >= fourteenDaysAgo &&
        new Date(p.sentAt) < sevenDaysAgo,
    ).length;

    // Cycle time (simplified)
    const cycleTimes = completedProjects
      .filter((p) => p.readyForEstimateAt && p.sentAt)
      .map((p) => {
        const ready = new Date(p.readyForEstimateAt!);
        const sent = new Date(p.sentAt!);
        return Math.ceil(
          (sent.getTime() - ready.getTime()) / (1000 * 60 * 60 * 24),
        );
      });

    const averageCycleTime =
      cycleTimes.length > 0
        ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
        : 0;

    // Oldest project in ready_for_estimate or estimating
    const pendingProjects = [...readyProjects, ...estimatingProjects];
    const oldestProject = pendingProjects.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    )[0];

    const oldestProjectAge = oldestProject
      ? Math.ceil(
          (now.getTime() - new Date(oldestProject.updatedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    return {
      weeklyThroughput,
      previousWeekThroughput,
      averageCycleTime,
      cycleTimeTrend: 0, // Simplified for now
      readyCount: readyProjects.length,
      estimatingCount: estimatingProjects.length,
      oldestProjectAge,
      oldestProjectName: oldestProject?.name,
    };
  };

  const metrics = calculateMetrics();

  // Transform real projects into chart data
  const getChartData = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Throughput Data (last 7 days)
    const dailyThroughput: Record<string, number> = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize all days with 0
    days.forEach((day) => {
      dailyThroughput[day] = 0;
    });

    // Count completed projects by day
    projects
      .filter(
        (project) =>
          project.status === "sent" &&
          project.sentAt &&
          new Date(project.sentAt) >= sevenDaysAgo,
      )
      .forEach((project) => {
        const day = new Date(project.sentAt!).toLocaleDateString("en-US", {
          weekday: "short",
        });
        dailyThroughput[day] = (dailyThroughput[day] || 0) + 1;
      });

    const throughputData = days.map((day) => ({
      day,
      throughput: dailyThroughput[day],
    }));

    // Cycle Time Data (last 10 completed projects)
    const cycleTimeData = projects
      .filter(
        (project) =>
          project.status === "sent" &&
          project.readyForEstimateAt &&
          project.sentAt,
      )
      .slice(0, 10) // Last 10 projects
      .map((project) => {
        const readyDate = new Date(project.readyForEstimateAt!);
        const sentDate = new Date(project.sentAt!);
        const cycleTime = Math.ceil(
          (sentDate.getTime() - readyDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          project:
            project.name.length > 12
              ? project.name.substring(0, 12) + "..."
              : project.name,
          cycleTime,
        };
      });

    // Status Distribution Data
    const statusCounts: Record<string, number> = {};
    projects.forEach((project) => {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      draft: "#F59E0B",
      needs_field_review: "#F97316",
      field_in_progress: "#3B82F6",
      ready_for_estimate: "#8B5CF6",
      estimating: "#6366F1",
      sent: "#10B981",
    };

    const statusLabels: Record<string, string> = {
      draft: "Draft",
      needs_field_review: "Field Review",
      field_in_progress: "In Progress",
      ready_for_estimate: "Ready",
      estimating: "Estimating",
      sent: "Sent",
    };

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      color: statusColors[status] || "#6B7280",
    }));

    // Performance Metrics
    const completedProjects = projects.filter((p) => p.status === "sent");
    const totalCycleTime = completedProjects
      .filter((p) => p.readyForEstimateAt && p.sentAt)
      .reduce((sum, p) => {
        const ready = new Date(p.readyForEstimateAt!);
        const sent = new Date(p.sentAt!);
        return (
          sum +
          Math.ceil((sent.getTime() - ready.getTime()) / (1000 * 60 * 60 * 24))
        );
      }, 0);

    const avgCycleTime =
      completedProjects.length > 0
        ? totalCycleTime / completedProjects.length
        : 0;
    const weeklyScore = Math.min(
      10,
      Math.max(1, 10 - avgCycleTime + projects.length * 0.5),
    );

    return {
      throughputData,
      cycleTimeData,
      statusData,
      avgCycleTime: Number(avgCycleTime.toFixed(1)),
      weeklyScore: Number(weeklyScore.toFixed(1)),
      totalProjects: projects.length,
      completedThisWeek: throughputData.reduce(
        (sum, day) => sum + day.throughput,
        0,
      ),
      onTimeRate:
        completedProjects.length > 0
          ? Math.round(
              (completedProjects.filter((p) => {
                if (!p.readyForEstimateAt || !p.sentAt) return false;
                const cycleTime = Math.ceil(
                  (new Date(p.sentAt).getTime() -
                    new Date(p.readyForEstimateAt).getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return cycleTime <= 5;
              }).length /
                completedProjects.length) *
                100,
            )
          : 0,
      activeProjects: projects.filter(
        (p) => !["sent", "draft"].includes(p.status),
      ).length,
    };
  };

  const chartData = getChartData();

  // Enhanced KPI Calculations
  const getKPIMetrics = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter projects for different time periods
    const weeklyProjects = projects.filter(
      (p) => new Date(p.createdAt) >= sevenDaysAgo,
    );
    const monthlyProjects = projects.filter(
      (p) => new Date(p.createdAt) >= thirtyDaysAgo,
    );

    const completedProjects = projects.filter((p) => p.status === "sent");
    const weeklyCompleted = completedProjects.filter(
      (p) => p.sentAt && new Date(p.sentAt) >= sevenDaysAgo,
    );

    // Revenue Estimation (simplified - you can enhance this later)
    const estimatedRevenue = projects.reduce((total, project) => {
      // Simple estimation - you can replace with actual revenue data
      return total + (project.status === "sent" ? 2500 : 1000);
    }, 0);

    // Calculate actual metrics
    const kpiData = {
      // Current Week Performance
      weeklyThroughput: weeklyCompleted.length,
      weeklyGrowth: weeklyProjects.length - weeklyCompleted.length, // New vs Completed
      totalProjects: projects.length,
      // Project Health
      onTimeRate: calculateOnTimeRate(completedProjects),
      bottleneckProjects: projects.filter(
        (p) =>
          ["ready_for_estimate", "estimating"].includes(p.status) &&
          new Date(p.updatedAt) <
            new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      ).length,

      // Business Metrics
      activeClients: [
        ...new Set(projects.map((p) => p.clientEmail).filter(Boolean)),
      ].length,
      estimatedRevenue: estimatedRevenue,

      // Team Performance
      avgCycleTime: chartData.avgCycleTime, // From previous calculation
      completionRate:
        projects.length > 0
          ? Math.round((completedProjects.length / projects.length) * 100)
          : 0,
    };

    return kpiData;
  };

  // Helper function for on-time rate
  const calculateOnTimeRate = (completedProjects: any[]) => {
    if (completedProjects.length === 0) return 0; // Change from 100 to 0

    // Only count projects that have BOTH timestamps
    const measurableProjects = completedProjects.filter(
      (project) => project.readyForEstimateAt && project.sentAt,
    );

    if (measurableProjects.length === 0) return 0; // No measurable projects = 0%

    const onTimeProjects = measurableProjects.filter((project) => {
      const readyDate = new Date(project.readyForEstimateAt);
      const sentDate = new Date(project.sentAt);
      const cycleTime = Math.ceil(
        (sentDate.getTime() - readyDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      return cycleTime <= 5; // 5 days is considered "on time"
    });

    return Math.round(
      (onTimeProjects.length / measurableProjects.length) * 100,
    );
  };

  const kpiMetrics = getKPIMetrics();

  ////////////////////////
  // Calculate projects needing attention (stuck for 5+ days)
  const getAttentionProjects = () => {
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 0 * 24 * 60 * 60 * 1000);

    return projects
      .filter((project) => {
        // Projects in active stages that haven't been updated in 5+ days
        const activeStages = [
          "needs_field_review",
          "field_in_progress",
          "ready_for_estimate",
          "estimating",
        ];
        const lastUpdated = new Date(project.updatedAt);
        const daysStuck = Math.ceil(
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
        );

        return activeStages.includes(project.status) && daysStuck >= 5;
      })
      .map((project) => {
        const lastUpdated = new Date(project.updatedAt);
        const daysStuck = Math.ceil(
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          ...project,
          daysStuck,
        };
      })
      .sort((a, b) => b.daysStuck - a.daysStuck); // Most stuck first
  };

  const attentionProjects = getAttentionProjects();
  //////////////////////

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={isAdmin} session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role-based welcome message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isAdmin
              ? "Company Admin Dashboard"
              : isEstimator
                ? `Estimator Dashboard`
                : isInspector
                  ? "Inspector Dashboard"
                  : "Mitigation Tech Dashboard"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {isAdmin
              ? "Manage your company, team members, and projects."
              : "Create and manage property damage assessment projects."}
          </p>
        </div>

        {/* Pending Invites - Only show for admins */}
        {/* {isAdmin && <PendingInvites />} */}
        {/* Status Buckets Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Workload Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusBuckets.map((bucket) => (
              <Link
                key={bucket.id}
                href={`/dashboard/projects?status=${bucket.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-3 h-3 rounded-full ${bucket.color}`}></div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bucket.count}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {bucket.label}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {bucket.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Company Management Card - Only for Admins */}
          {isAdmin && (
            <Link
              href="/dashboard/company"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-xl">
                  🏢
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Company Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Manage your company settings, team members, and subscription.
              </p>
            </Link>
          )}

          {/* Projects Card - For everyone */}
          {/* Projects Card - For everyone */}
          <Link
            href="/dashboard/projects"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 dark:text-green-400 text-xl">
                📋
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Projects
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {isAdmin
                ? "View and manage all company projects."
                : "Create and manage your inspection projects."}
            </p>
          </Link>
          {/* Reports Card - For everyone */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 dark:text-purple-400 text-xl">
                📊
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Generate PDF and CSV reports for insurance claims.
            </p>
            <Link
              href="/dashboard/reports"
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium text-center block transition-colors"
            >
              Generate Reports
            </Link>
          </div>

          {/* Team Management Card - Only for Admins */}
          {isAdmin && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-orange-600 dark:text-orange-400 text-xl">
                  👥
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Team Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Invite team members and manage their roles and permissions.
              </p>
              <button className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded text-sm font-medium">
                Coming Soon
              </button>
            </div>
          )}

          {/* Quick Inspections Card - Primarily for Inspectors */}
          {isInspector && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-600 dark:text-red-400 text-xl">
                  🔍
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quick Inspection
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Start a new property damage assessment inspection.
              </p>
              <button className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded text-sm font-medium">
                Coming Soon
              </button>
            </div>
          )}
        </div>
        <div className="mt-6">
          {/* <AttentionProjects projects={attentionProjects} /> */}
        </div>
        <EnhancedMetricsPanel chartData={chartData} />
        <KPIPanel metrics={kpiMetrics} />
        {/* Role-based quick stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Company Overview
            </h2>
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              title="System Online"
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Projects Card - Enhanced */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-300 text-lg">
                  📋
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {projectsCount}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Projects
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Across all stages
              </p>
            </div>

            {/* Team Members Card - Enhanced */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-300 text-lg">
                  👥
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {teamMembersCount}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Members
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active users
              </p>
            </div>

            {/* Role Card - Enhanced */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-300 text-lg">
                  🛡️
                </span>
              </div>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400 capitalize">
                {isAdmin
                  ? "Administrator"
                  : isEstimator
                    ? `Estimator`
                    : isInspector
                      ? "Inspector"
                      : "Mitigation Tech"}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Role
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Access level
              </p>
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>🟢 System: Operational</span>
              <span>📅 Last updated: Just now</span>
            </div>
          </div>
        </div>
        {/* Enhanced Metrics Panel */}
      </main>
    </div>
  );
}
