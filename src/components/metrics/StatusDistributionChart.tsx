"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// const data = [
//   { name: "Draft", value: 12, color: "#F59E0B" },
//   { name: "Field Review", value: 8, color: "#F97316" },
//   { name: "In Progress", value: 15, color: "#3B82F6" },
//   { name: "Ready", value: 6, color: "#8B5CF6" },
//   { name: "Estimating", value: 4, color: "#6366F1" },
//   { name: "Sent", value: 10, color: "#10B981" },
// ];
interface StatusDistributionChartProps {
  data: { name: string; value: number; color: string }[];
}

export function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
        Project Status Distribution
      </h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "6px",
                color: "#F9FAFB",
              }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
