interface ThroughputMetricProps {
  weeklyThroughput: number;
  previousWeekThroughput: number;
}

export function ThroughputMetric({
  weeklyThroughput,
  previousWeekThroughput,
}: ThroughputMetricProps) {
  const trend = weeklyThroughput - previousWeekThroughput;
  const trendText = trend > 0 ? `+${trend}` : trend;
  const trendColor =
    trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600";

  return (
    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        {weeklyThroughput}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        Weekly Throughput
      </p>
      <p className={`text-xs ${trendColor}`}>
        {trend !== 0 ? `${trendText} from last week` : "Same as last week"}
      </p>
    </div>
  );
}
