import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { fetchOrderLines, fetchSalesPeople } from "@/lib/api";

type SalesPersonDetailPageProps = {
  params: {
    id: string;
  };
};

const currencyFormatter = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "DKK",
  maximumFractionDigits: 0,
});

function parseOrderDate(raw: string | null) {
  if (!raw) {
    return null;
  }

  const [datePart, timePart] = raw.split(" ");
  const parts = datePart?.split("-") ?? [];

  if (parts.length === 3) {
    const [first, second, third] = parts;

    if (first.length === 4) {
      // Already in YYYY-MM-DD.
      const isoDateTime = timePart ? `${first}-${second}-${third}T${timePart}` : `${first}-${second}-${third}`;
      const parsed = new Date(isoDateTime);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    } else if (third.length === 4) {
      // Convert from DD-MM-YYYY.
      const isoDateTime = timePart ? `${third}-${second}-${first}T${timePart}` : `${third}-${second}-${first}`;
      const parsed = new Date(isoDateTime);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

function formatOrderDate(raw: string | null) {
  if (!raw) {
    return "Unknown date";
  }

  const parsed = parseOrderDate(raw);

  if (!parsed) {
    return raw;
  }

  return parsed.toLocaleString("da-DK", {
    dateStyle: "medium",
    timeStyle: raw.includes(" ") ? "short" : undefined,
  });
}

function formatCurrency(amount: number | null | undefined) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "N/A";
  }

  return currencyFormatter.format(amount);
}

export default async function SalesPersonDetailPage({
  params,
}: SalesPersonDetailPageProps) {
  const salesPersonId = Number(params.id);

  if (Number.isNaN(salesPersonId)) {
    notFound();
  }

  const [salesPeople, orderLines] = await Promise.all([
    fetchSalesPeople(),
    fetchOrderLines(),
  ]);

  const person = salesPeople.find((salesPerson) => salesPerson.id === salesPersonId);

  if (!person) {
    notFound();
  }

  const personOrders = orderLines
    .filter((order) => order.salesPersonId === salesPersonId)
    .sort((a, b) => {
      const dateA = parseOrderDate(a.orderDate);
      const dateB = parseOrderDate(b.orderDate);
      const timeA = dateA ? dateA.getTime() : -Infinity;
      const timeB = dateB ? dateB.getTime() : -Infinity;
      return timeB - timeA;
    });

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 py-16 font-sans">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight">
              {person.name ?? "Salesperson"}
            </h1>
            <p className="text-muted-foreground">
              Hired {person.hireDate ?? "Unknown date"}
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
    </main>
  );
}
