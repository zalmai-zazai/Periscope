interface RevenueCardProps {
  revenue: number;
  trend: number;
}

export function RevenueCard({ revenue, trend }: RevenueCardProps) {
  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(revenue);

  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold">{formattedRevenue}</p>
          <p className="text-sm opacity-90">Estimated Revenue</p>
        </div>
        <div
          className={`text-xs px-2 py-1 rounded-full ${
            trend >= 0 ? "bg-green-700" : "bg-red-700"
          }`}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );
}
