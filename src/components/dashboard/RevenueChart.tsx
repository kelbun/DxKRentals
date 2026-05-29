"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; total: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#71717A", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#71717A", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "#161616",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 12,
            color: "#fff",
          }}
          formatter={(value: number) => [`£${value.toLocaleString()}`, "Revenue"]}
        />
        <Bar dataKey="total" fill="#D4AF37" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
