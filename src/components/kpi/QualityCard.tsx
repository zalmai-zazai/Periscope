interface QualityCardProps {
  onTimeRate: number;
  trend: number;
}

export function QualityCard({ onTimeRate, trend }: QualityCardProps) {
  const status =
    onTimeRate >= 90
      ? "Excellent"
      : onTimeRate >= 80
      ? "Good"
      : "Needs Attention";
  const emoji = onTimeRate >= 90 ? "🎯" : onTimeRate >= 80 ? "👍" : "⚠️";

  return (
    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold">{onTimeRate}%</p>
          <p className="text-sm opacity-90">On Time Rate</p>
        </div>
        <span className="text-lg">{emoji}</span>
      </div>
      <p className="text-xs mt-1 opacity-80">{status}</p>
    </div>
  );
}
