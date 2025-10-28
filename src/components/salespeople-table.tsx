"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SalesPerson } from "@/lib/api"

type SalesPersonWithOrders = SalesPerson & {
  orderCount: number
}

type SortKey = "name" | "city" | "orderCount"
type SortDirection = "asc" | "desc"

type SortState = {
  key: SortKey
  direction: SortDirection
}

type SalesPeopleTableProps = {
  people: SalesPersonWithOrders[]
}

function SortButton({
  label,
  onClick,
  active,
  direction,
  align = "left",
}: {
  label: string
  onClick: () => void
  active: boolean
  direction?: SortDirection
  align?: "left" | "right"
}) {
  const Icon = !active || !direction ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        align === "right" ? "justify-end text-right" : "justify-start text-left",
        active && "text-foreground"
      )}
      aria-pressed={active}
    >
      <span>{label}</span>
      <Icon className="size-4 shrink-0" />
      <span className="sr-only">Change sort for {label}</span>
    </button>
  )
}

export function SalesPeopleTable({ people }: SalesPeopleTableProps) {
  const [sortState, setSortState] = React.useState<SortState>({
    key: "name",
    direction: "asc",
  })

  const collator = React.useMemo(
    () => new Intl.Collator(undefined, { sensitivity: "base" }),
    []
  )

  const sortedPeople = React.useMemo(() => {
    const data = [...people]

    data.sort((a, b) => {
      const { key, direction } = sortState

      let comparison = 0

      if (key === "orderCount") {
        comparison = a.orderCount - b.orderCount
      } else if (key === "city") {
        comparison = collator.compare(a.city ?? "", b.city ?? "")
      } else {
        comparison = collator.compare(a.name ?? "", b.name ?? "")
      }

      return direction === "asc" ? comparison : -comparison
    })

    return data
  }, [people, sortState, collator])

  const toggleSort = React.useCallback((key: SortKey) => {
    setSortState((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }

      return {
        key,
        direction: key === "orderCount" ? "desc" : "asc",
      }
    })
  }, [])

  const getAriaSort = React.useCallback(
    (key: SortKey): React.AriaAttributes["aria-sort"] =>
      sortState.key === key
        ? sortState.direction === "asc"
          ? "ascending"
          : "descending"
        : "none",
    [sortState]
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead aria-sort={getAriaSort("name")}>
            <SortButton
              label="Name"
              onClick={() => toggleSort("name")}
              active={sortState.key === "name"}
              direction={sortState.key === "name" ? sortState.direction : undefined}
            />
          </TableHead>
          <TableHead aria-sort={getAriaSort("city")}>
            <SortButton
              label="Location"
              onClick={() => toggleSort("city")}
              active={sortState.key === "city"}
              direction={sortState.key === "city" ? sortState.direction : undefined}
            />
          </TableHead>
          <TableHead
            className="text-right"
            aria-sort={getAriaSort("orderCount")}
          >
            <SortButton
              label="Orders"
              onClick={() => toggleSort("orderCount")}
              active={sortState.key === "orderCount"}
              direction={
                sortState.key === "orderCount" ? sortState.direction : undefined
              }
              align="right"
            />
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPeople.map((person) => (
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
              {person.orderCount.toLocaleString("da-DK")}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild size="sm" variant="outline">
                <Link href={`/salespeople/${person.id}`}>View details</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
