import Link from "next/link"

import { SalesPeopleTable } from "@/components/salespeople-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchOrderLines, fetchSalesPeople } from "@/lib/api"

export default async function SalesPeoplePage() {
  const [salesPeople, orderLines] = await Promise.all([
    fetchSalesPeople(),
    fetchOrderLines(),
  ])

  const orderCounts = orderLines.reduce<Record<number, number>>(
    (acc, order) => {
      acc[order.salesPersonId] = (acc[order.salesPersonId] ?? 0) + 1
      return acc
    },
    {}
  )

  const peopleWithOrderCounts = salesPeople.map((person) => ({
    ...person,
    orderCount: orderCounts[person.id] ?? 0,
  }))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.18em]">
            Team overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Salespeople
          </h1>
        </div>
        <p className="text-muted-foreground">
          Review the sales team and drill into each profile to see their orders
          and performance.
        </p>
      </header>

      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>People</CardTitle>
            <CardDescription>
              Each row shows the salesperson&rsquo;s location and total order
              count.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Monthly order volume</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <SalesPeopleTable people={peopleWithOrderCounts} />
        </CardContent>
      </Card>
    </div>
  )
}
