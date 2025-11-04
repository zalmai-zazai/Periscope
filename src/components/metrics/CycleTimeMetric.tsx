interface CycleTimeMetricProps {
  averageCycleTime: number;
  trend: number;
}

export function CycleTimeMetric({
  averageCycleTime,
  trend,
}: CycleTimeMetricProps) {
  const trendText = trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1);
  const trendColor =
    trend < 0 ? "text-green-600" : trend > 0 ? "text-red-600" : "text-gray-600";

  return (
    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
        {averageCycleTime.toFixed(1)}d
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        Avg Cycle Time
      </p>
      <p className={`text-xs ${trendColor}`}>
        {trend !== 0 ? `${trendText}d from avg` : "On track"}
      </p>
    </div>
  );
}
