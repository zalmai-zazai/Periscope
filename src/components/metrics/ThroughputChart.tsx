"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// const data = [
//   { day: "Mon", throughput: 4 },
//   { day: "Tue", throughput: 2 },
//   { day: "Wed", throughput: 6 },
//   { day: "Thu", throughput: 3 },
//   { day: "Fri", throughput: 5 },
//   { day: "Sat", throughput: 1 },
//   { day: "Sun", throughput: 2 },
// ];
interface ThroughputChartProps {
  data: { day: string; throughput: number }[];
}
export function ThroughputChart({ data }: ThroughputChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
        Weekly Throughput
      </h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.3}
            />
            <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "6px",
                color: "#F9FAFB",
              }}
            />
            <Line
              type="monotone"
              dataKey="throughput"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
