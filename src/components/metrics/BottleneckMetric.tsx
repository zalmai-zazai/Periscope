interface BottleneckMetricProps {
  oldestProjectAge: number;
  projectName?: string;
}

export function BottleneckMetric({
  oldestProjectAge,
  projectName,
}: BottleneckMetricProps) {
  const severity =
    oldestProjectAge > 7 ? "high" : oldestProjectAge > 3 ? "medium" : "low";
  const color =
    severity === "high" ? "red" : severity === "medium" ? "yellow" : "green";

  return (
    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
        {oldestProjectAge}d
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        Oldest Pending
      </p>
      <p className={`text-xs text-${color}-600 dark:text-${color}-400`}>
        {severity === "high" ? "Needs attention" : "On track"}
      </p>
    </div>
  );
}
