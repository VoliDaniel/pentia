import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default async function SalesPeoplePage() {
  const [salesPeople, orderLines] = await Promise.all([
    fetchSalesPeople(),
    fetchOrderLines(),
  ]);

  const orderCounts = orderLines.reduce<Record<number, number>>((acc, order) => {
    acc[order.salesPersonId] = (acc[order.salesPersonId] ?? 0) + 1;
    return acc;
  }, {});

  const sortedSalesPeople = [...salesPeople].sort((a, b) => {
    const nameA = a.name ?? "";
    const nameB = b.name ?? "";
    return nameA.localeCompare(nameB);
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 py-16 font-sans">
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-4xl font-semibold tracking-tight">
            Salespeople
          </h1>
          <p className="text-muted-foreground">
            Review the sales team and drill into each profile to see their
            orders.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Team overview</CardTitle>
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
                  const orderCount = orderCounts[person.id] ?? 0;
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
                        {orderCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/salespeople/${person.id}`}>
                            View details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
