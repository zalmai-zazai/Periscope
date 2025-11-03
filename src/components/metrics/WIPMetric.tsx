interface WIPMetricProps {
  readyCount: number;
  estimatingCount: number;
}

export function WIPMetric({ readyCount, estimatingCount }: WIPMetricProps) {
  const totalWIP = readyCount + estimatingCount;

  return (
    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
        {totalWIP}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        Work In Progress
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {readyCount} ready • {estimatingCount} estimating
      </p>
    </div>
  );
}
