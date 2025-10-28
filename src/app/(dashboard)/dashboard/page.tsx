import type { OrderLine } from "@/lib/api"

import { MonthlyOrdersChart } from "@/components/monthly-orders-chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchOrderLines } from "@/lib/api"
import { parseOrderDate } from "@/lib/order-date"

type MonthlyDataPoint = {
  month: string
  label: string
  count: number
}

function buildMonthlyTimeline(orderLines: OrderLine[]): MonthlyDataPoint[] {
  const monthlyCounts = new Map<string, { count: number; label: string }>()
  let earliestMonth: Date | null = null
  let latestMonth: Date | null = null

  for (const order of orderLines) {
    const parsed = parseOrderDate(order.orderDate)
    if (!parsed) continue

    const monthStart = new Date(parsed.getFullYear(), parsed.getMonth(), 1)
    const monthKey = `${monthStart.getFullYear()}-${String(
      monthStart.getMonth() + 1
    ).padStart(2, "0")}`
    const label = monthStart.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })

    if (!earliestMonth || monthStart < earliestMonth) {
      earliestMonth = monthStart
    }

    if (!latestMonth || monthStart > latestMonth) {
      latestMonth = monthStart
    }

    const existing = monthlyCounts.get(monthKey)
    if (existing) {
      existing.count += 1
    } else {
      monthlyCounts.set(monthKey, { count: 1, label })
    }
  }

  if (!earliestMonth || !latestMonth) {
    const today = new Date()
    latestMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    earliestMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1)
  }

  const result: MonthlyDataPoint[] = []
  const cursor = new Date(earliestMonth)
  const endTime = latestMonth.getTime()

  while (cursor.getTime() <= endTime) {
    const monthKey = `${cursor.getFullYear()}-${String(
      cursor.getMonth() + 1
    ).padStart(2, "0")}`

    const label = cursor.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })

    const record = monthlyCounts.get(monthKey)

    result.push({
      month: monthKey,
      label,
      count: record?.count ?? 0,
    })

    cursor.setMonth(cursor.getMonth() + 1)
  }

  return result
}

export default async function DashboardPage() {
  const orderLines = await fetchOrderLines()
  const monthlyData = buildMonthlyTimeline(orderLines)
  const totalOrders = orderLines.length
  const monthsTracked = monthlyData.length

  const busiestMonth = monthlyData.reduce<MonthlyDataPoint | null>(
    (current, month) => {
      if (!current || month.count > current.count) {
        return month
      }
      return current
    },
    null
  )

  const averageOrders = monthsTracked
    ? Math.round(totalOrders / monthsTracked)
    : 0

  const rangeLabel =
    monthsTracked > 1
      ? `${monthlyData[0]?.label ?? ""} — ${
          monthlyData[monthlyData.length - 1]?.label ?? ""
        }`
      : monthlyData[0]?.label ?? "No data"

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.18em]">
            Sales insights
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Order volume
          </h1>
        </div>
        <p className="text-muted-foreground">
          Monitor how many orders the team closes each month and identify
          standout periods.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Orders recorded</CardDescription>
            <CardTitle className="text-3xl">
              {totalOrders.toLocaleString("da-DK")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across {monthsTracked.toLocaleString("da-DK")} months of data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Busiest month</CardDescription>
            <CardTitle className="text-3xl">
              {busiestMonth
                ? busiestMonth.count.toLocaleString("da-DK")
                : "0"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {busiestMonth ? busiestMonth.label : "No orders yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average per month</CardDescription>
            <CardTitle className="text-3xl">
              {averageOrders.toLocaleString("da-DK")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{rangeLabel}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <MonthlyOrdersChart data={monthlyData} />
      </section>
    </div>
  )
}
