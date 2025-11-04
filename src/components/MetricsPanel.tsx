import { ThroughputMetric } from "./metrics/ThroughputMetric";
import { CycleTimeMetric } from "./metrics/CycleTimeMetric";
import { WIPMetric } from "./metrics/WIPMetric";
import { BottleneckMetric } from "./metrics/BottleneckMetric";

interface MetricsPanelProps {
  metrics: {
    weeklyThroughput: number;
    previousWeekThroughput: number;
    averageCycleTime: number;
    cycleTimeTrend: number;
    readyCount: number;
    estimatingCount: number;
    oldestProjectAge: number;
    oldestProjectName?: string;
  };
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Performance Metrics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ThroughputMetric
          weeklyThroughput={metrics.weeklyThroughput}
          previousWeekThroughput={metrics.previousWeekThroughput}
        />
        <CycleTimeMetric
          averageCycleTime={metrics.averageCycleTime}
          trend={metrics.cycleTimeTrend}
        />

        <WIPMetric
          readyCount={metrics.readyCount}
          estimatingCount={metrics.estimatingCount}
        />
        <BottleneckMetric
          oldestProjectAge={metrics.oldestProjectAge}
          projectName={metrics.oldestProjectName}
        />
      </div>
    </div>
  );
}
