"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type MonthlyOrdersChartProps = {
  data: {
    month: string
    label: string
    count: number
  }[]
}

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function MonthlyOrdersChart({ data }: MonthlyOrdersChartProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Monthly order volume</CardTitle>
        <CardDescription>
          Total number of orders placed each month.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-2 sm:px-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-[16/9] h-[360px] w-full"
        >
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={48}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label ?? ""
                  }
                  formatter={(value, _name, item) => {
                    const numericValue =
                      typeof value === "number" ? value : Number(value)
                    const formattedValue = Number.isFinite(numericValue)
                      ? numericValue.toLocaleString("da-DK")
                      : String(value)
                    const rawItem = item as { payload?: unknown } | undefined
                    const payloadData =
                      rawItem?.payload && typeof rawItem.payload === "object"
                        ? (rawItem.payload as {
                            label?: string
                            month?: string
                          })
                        : undefined
                    const monthLabel =
                      typeof payloadData?.label === "string"
                        ? payloadData.label
                        : typeof payloadData?.month === "string"
                          ? payloadData.month
                          : ""
                    const ordersText = `${formattedValue} Orders`

                    return monthLabel
                      ? `${ordersText} (${monthLabel})`
                      : ordersText
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-orders)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
