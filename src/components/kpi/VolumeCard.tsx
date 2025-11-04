interface VolumeCardProps {
  totalProjects: number;
  trend: number;
}

export function VolumeCard({ totalProjects, trend }: VolumeCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold">{totalProjects}</p>
          <p className="text-sm opacity-90">Total Projects</p>
        </div>
        <div
          className={`text-xs px-2 py-1 rounded-full ${
            trend >= 0 ? "bg-green-700" : "bg-red-700"
          }`}
        >
          {trend >= 0 ? "📈" : "📉"} {Math.abs(trend)}
        </div>
      </div>
      <p className="text-xs mt-2 opacity-80">
        {trend > 0 ? "Growing" : trend < 0 ? "Declining" : "Stable"} workload
      </p>
    </div>
  );
}
