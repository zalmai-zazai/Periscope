interface ThroughputCardProps {
  completed: number;
  inProgress: number;
}

export function ThroughputCard({ completed, inProgress }: ThroughputCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
      <p className="text-2xl font-bold">{completed}</p>
      <p className="text-sm opacity-90">Completed This Week</p>
      <div className="flex justify-between text-xs mt-2 opacity-80">
        <span>{inProgress} in progress</span>
        <span>🚀</span>
      </div>
    </div>
  );
}
