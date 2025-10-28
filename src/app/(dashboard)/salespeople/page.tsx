import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

  const sortedSalesPeople = [...salesPeople].sort((a, b) => {
    const nameA = a.name ?? ""
    const nameB = b.name ?? ""
    return nameA.localeCompare(nameB)
  })

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSalesPeople.map((person) => {
                const orderCount = orderCounts[person.id] ?? 0
                return (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">
                      {person.name ?? "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span>{person.city ?? "City unavailable"}</span>
                        <span>{person.zipCode ?? "Zip unavailable"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {orderCount.toLocaleString("da-DK")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/salespeople/${person.id}`}>
                          View details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
