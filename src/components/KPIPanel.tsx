import { VolumeCard } from "./kpi/VolumeCard";
import { ThroughputCard } from "./kpi/ThroughputCard";
import { HealthCard } from "./kpi/HealthCard";

interface KPIPanelProps {
  metrics: {
    weeklyThroughput: number;
    weeklyGrowth: number;
    bottleneckProjects: number;
    activeClients: number;
    avgCycleTime: number;
    completionRate: number;
    totalProjects: number;
  };
}

export function KPIPanel({ metrics }: KPIPanelProps) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Business Performance
      </h2>

      {/* SIMPLIFIED: Just 3 main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VolumeCard
          totalProjects={metrics.totalProjects}
          trend={metrics.weeklyGrowth}
        />

        <ThroughputCard
          completed={metrics.weeklyThroughput}
          inProgress={metrics.weeklyGrowth}
        />

        <HealthCard
          bottleneckCount={metrics.bottleneckProjects}
          activeClients={metrics.activeClients}
        />
      </div>

      {/* Keep the secondary metrics at bottom */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {metrics.avgCycleTime}d
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Avg Cycle Time
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {metrics.completionRate}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Completion Rate
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {metrics.weeklyGrowth}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            New This Week
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {metrics.bottleneckProjects}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Need Attention
          </p>
        </div>
      </div>
    </div>
  );
}
