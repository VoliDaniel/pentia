import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchOrderLines, fetchSalesPeople } from "@/lib/api"
import { formatOrderDate, parseOrderDate } from "@/lib/order-date"

type SalesPersonDetailPageProps = {
  params: {
    id: string
  }
}

const currencyFormatter = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "DKK",
  maximumFractionDigits: 0,
})

function formatCurrency(amount: number | null | undefined) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "N/A"
  }

  return currencyFormatter.format(amount)
}

export default async function SalesPersonDetailPage({
  params,
}: SalesPersonDetailPageProps) {
  const salesPersonId = Number(params.id)

  if (Number.isNaN(salesPersonId)) {
    notFound()
  }

  const [salesPeople, orderLines] = await Promise.all([
    fetchSalesPeople(),
    fetchOrderLines(),
  ])

  const person = salesPeople.find(
    (salesPerson) => salesPerson.id === salesPersonId
  )

  if (!person) {
    notFound()
  }

  const personOrders = orderLines
    .filter((order) => order.salesPersonId === salesPersonId)
    .sort((a, b) => {
      const dateA = parseOrderDate(a.orderDate)
      const dateB = parseOrderDate(b.orderDate)
      const timeA = dateA ? dateA.getTime() : -Infinity
      const timeB = dateB ? dateB.getTime() : -Infinity
      return timeB - timeA
    })

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/salespeople">Salespeople</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{person.name ?? `Salesperson #${person.id}`}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {person.name ?? "Salesperson"}
          </h1>
          <p className="text-muted-foreground">
            Hired {person.hireDate ?? "Unknown date"} •{" "}
            {personOrders.length.toLocaleString("da-DK")} orders
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/salespeople">Back to list</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>
            Location and address information pulled from the sales system.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="text-base font-medium">{person.address ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">City</p>
            <p className="text-base font-medium">{person.city ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Zip code</p>
            <p className="text-base font-medium">{person.zipCode ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total orders</p>
            <p className="text-base font-medium">
              {personOrders.length.toLocaleString("da-DK")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            All orders placed by {person.name ?? "this salesperson"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders found for this salesperson.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderName ?? `Order #${order.id}`}
                    </TableCell>
                    <TableCell>{formatOrderDate(order.orderDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.orderPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
