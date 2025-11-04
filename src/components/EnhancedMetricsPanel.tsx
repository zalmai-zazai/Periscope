import { ThroughputChart } from "./metrics/ThroughputChart";
import { CycleTimeChart } from "./metrics/CycleTimeChart";
import { StatusDistributionChart } from "./metrics/StatusDistributionChart";
import { PerformanceGauge } from "./metrics/PerformanceGauge";

interface EnhancedMetricsPanelProps {
  chartData: {
    throughputData: any[];
    cycleTimeData: any[];
    statusData: any[];
    avgCycleTime: number;
    weeklyScore: number;
    totalProjects: number;
    completedThisWeek: number;
    onTimeRate: number;
    activeProjects: number;
  };
}

export function EnhancedMetricsPanel({ chartData }: EnhancedMetricsPanelProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Performance Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Charts */}
        <div className="space-y-6">
          {/* <ThroughputChart />
          <CycleTimeChart /> */}
          <ThroughputChart data={chartData.throughputData} />
          <CycleTimeChart data={chartData.cycleTimeData} />
        </div>

        {/* Right Column - Status & Gauges */}
        {/* <div className="space-y-6">
          <StatusDistributionChart />
          <div className="grid grid-cols-2 gap-4">
            <PerformanceGauge value={7.2} title="Avg Cycle Time" />
            <PerformanceGauge value={8} max={10} title="Weekly Score" />
          </div>
        </div> */}
        <div className="space-y-6">
          <StatusDistributionChart data={chartData.statusData} />
          <div className="grid grid-cols-2 gap-4">
            <PerformanceGauge
              value={chartData.avgCycleTime}
              title="Avg Cycle Time"
            />
            <PerformanceGauge
              value={chartData.weeklyScore}
              max={10}
              title="Weekly Score"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm opacity-90">Projects This Week</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-2xl font-bold">2.3d</p>
          <p className="text-sm opacity-90">Avg Turnaround</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-2xl font-bold">94%</p>
          <p className="text-sm opacity-90">On Time Rate</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <p className="text-2xl font-bold">8</p>
          <p className="text-sm opacity-90">Active Projects</p>
        </div>
      </div> */}
    </div>
  );
}
