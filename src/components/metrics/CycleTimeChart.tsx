"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CycleTimeChartProps {
  data: { project: string; cycleTime: number }[];
}
// const data = [
//   { project: "Project A", cycleTime: 3 },
//   { project: "Project B", cycleTime: 7 },
//   { project: "Project C", cycleTime: 2 },
//   { project: "Project D", cycleTime: 5 },
//   { project: "Project E", cycleTime: 4 },
// ];

export function CycleTimeChart({ data }: CycleTimeChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
        Project Cycle Times (Days)
      </h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.3}
            />
            <XAxis
              dataKey="project"
              stroke="#6B7280"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={40}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "6px",
                color: "#F9FAFB",
              }}
            />
            <Bar dataKey="cycleTime" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.cycleTime > 5
                      ? "#EF4444"
                      : entry.cycleTime > 3
                      ? "#F59E0B"
                      : "#10B981"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
