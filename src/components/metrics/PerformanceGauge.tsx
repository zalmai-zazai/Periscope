"use client";

export function PerformanceGauge({
  value,
  max = 10,
  title,
}: {
  value: number;
  max?: number;
  title: string;
}) {
  const percentage = (value / max) * 100;
  const color =
    percentage >= 80
      ? "text-green-500"
      : percentage >= 60
      ? "text-yellow-500"
      : "text-red-500";
  const bgColor =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-600 relative">
          <div
            className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent"
            style={{
              background: `conic-gradient(${bgColor.replace(
                "bg-",
                ""
              )} ${percentage}%, #374151 ${percentage}% 100%)`,
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${color}`}>{value}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        out of {max}
      </p>
    </div>
  );
}
