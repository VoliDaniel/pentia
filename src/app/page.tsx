import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-10 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Hello, world!</h1>
        <p className="text-muted-foreground">
          You&apos;re up and running with Next.js 15 and shadcn/ui.
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/salespeople">View Salespeople</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
