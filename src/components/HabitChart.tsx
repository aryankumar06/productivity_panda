"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/line-chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HabitChartProps {
  data?: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
  title?: string;
  description?: string;
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  total: {
    label: "Total Habits",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function HabitChart({ data, title, description }: HabitChartProps) {
  // Default data if none provided
  const defaultData = [
    { date: "Mon", completed: 3, total: 5 },
    { date: "Tue", completed: 4, total: 5 },
    { date: "Wed", completed: 2, total: 5 },
    { date: "Thu", completed: 5, total: 5 },
    { date: "Fri", completed: 3, total: 5 },
    { date: "Sat", completed: 4, total: 5 },
    { date: "Sun", completed: 4, total: 5 },
  ];

  const chartData = data || defaultData;

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { value: 0, isPositive: true };
    
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.completed, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.completed, 0) / secondHalf.length;
    
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100;
    return {
      value: Math.abs(Math.round(trend * 10) / 10),
      isPositive: trend >= 0
    };
  };

  const trend = calculateTrend();

  return (
    <Card className="border-gray-200 dark:border-neutral-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {title || "Habit Completion Trend"}
          <Badge
            variant="outline"
            className={`${
              trend.isPositive 
                ? 'text-green-500 bg-green-500/10 border-none' 
                : 'text-red-500 bg-red-500/10 border-none'
            } ml-2`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{trend.value}%</span>
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          {description || "Your weekly habit completion progress"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} className="stroke-gray-200 dark:stroke-neutral-700" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-gray-600 dark:text-gray-400"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="completed"
              type="bump"
              stroke="var(--chart-1)"
              dot={false}
              strokeWidth={2}
              filter="url(#habit-line-glow)"
            />
            <Line
              dataKey="total"
              type="bump"
              stroke="var(--chart-2)"
              dot={false}
              strokeWidth={2}
              filter="url(#habit-line-glow)"
              strokeDasharray="5 5"
            />
            <defs>
              <filter
                id="habit-line-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
