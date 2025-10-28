"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type RevenueLeader = {
  id: number
  name: string | null
  revenue: number
}

type RevenueLeaderboardProps = {
  leaders: RevenueLeader[]
}

const currencyFormatter = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "DKK",
  maximumFractionDigits: 0,
})

function formatRevenue(amount: number) {
  return currencyFormatter.format(Math.max(0, Math.round(amount)))
}

export function RevenueLeaderboard({ leaders }: RevenueLeaderboardProps) {
  const topThree = leaders.slice(0, 3)
  const remaining = leaders.slice(3)

  const podiumOrder: Array<{
    entry: RevenueLeader | undefined
    place: 1 | 2 | 3
    emoji: string
    accentClass: string
    heightClass: string
  }> = [
    {
      entry: topThree[1],
      place: 2,
      emoji: "🥈",
      accentClass: "border-border bg-muted/60",
      heightClass: "sm:h-36 h-32",
    },
    {
      entry: topThree[0],
      place: 1,
      emoji: "🥇",
      accentClass: "border-amber-400/60 bg-amber-200/20",
      heightClass: "sm:h-44 h-36",
    },
    {
      entry: topThree[2],
      place: 3,
      emoji: "🥉",
      accentClass: "border-border bg-muted/40",
      heightClass: "sm:h-32 h-28",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardDescription>Top performers</CardDescription>
        <CardTitle>Revenue leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 items-end gap-3 sm:gap-4">
          {podiumOrder.map(({ entry, place, emoji, accentClass, heightClass }) =>
            entry ? (
              <div
                key={entry.id}
                className={cn(
                  "relative flex flex-col items-center justify-end rounded-xl border p-4 text-center shadow-sm",
                  accentClass,
                  heightClass
                )}
              >
                <span className="text-2xl sm:text-3xl">{emoji}</span>
                <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {place === 1
                    ? "1st place"
                    : place === 2
                      ? "2nd place"
                      : "3rd place"}
                </div>
                <div className="mt-1 text-sm font-semibold leading-tight">
                  {entry.name ?? "Unnamed rep"}
                </div>
                <div className="mt-2 text-sm font-medium text-muted-foreground">
                  {formatRevenue(entry.revenue)}
                </div>
              </div>
            ) : (
              <div
                key={`placeholder-${place}`}
                className={cn(
                  "flex h-24 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground",
                  heightClass
                )}
              >
                Awaiting data
              </div>
            )
          )}
        </div>

        {remaining.length > 0 ? (
          <ol className="space-y-2 text-sm">
            {remaining.map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {index + 4}.
                  </span>
                  <span className="font-medium">
                    {entry.name ?? "Unnamed rep"}
                  </span>
                </span>
                <span className="font-semibold">
                  {formatRevenue(entry.revenue)}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  )
}
