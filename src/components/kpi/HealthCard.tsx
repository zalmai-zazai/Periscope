interface HealthCardProps {
  bottleneckCount: number;
  activeClients: number;
}

export function HealthCard({
  bottleneckCount,
  activeClients,
}: HealthCardProps) {
  const healthStatus = bottleneckCount === 0 ? "Healthy" : "Needs Review";
  const statusColor =
    bottleneckCount === 0 ? "text-green-300" : "text-yellow-300";

  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold">{activeClients}</p>
          <p className="text-sm opacity-90">Active Clients</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${statusColor}`}>{healthStatus}</p>
          <p className="text-xs opacity-80">{bottleneckCount} bottlenecks</p>
        </div>
      </div>
    </div>
  );
}
