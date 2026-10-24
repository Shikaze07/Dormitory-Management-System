"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format, parseISO } from "date-fns"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  checkIns: { label: "Check-ins", color: "#10b981" },
  checkOuts: { label: "Check-outs", color: "#3b82f6" },
  visitors: { label: "Visitor entries", color: "#a855f7" },
}

export function ActivityChart({ data }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <BarChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => format(parseISO(value), "EEE")}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => format(parseISO(value), "MMM d, yyyy")}
              indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="checkIns" fill="var(--color-checkIns)" radius={4} />
        <Bar dataKey="checkOuts" fill="var(--color-checkOuts)" radius={4} />
        <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
