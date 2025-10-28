import type { CSSProperties, ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const layoutStyle = {
  "--sidebar-width": "calc(var(--spacing) * 64)",
  "--header-height": "calc(var(--spacing) * 12)",
} satisfies CSSProperties

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SidebarProvider style={layoutStyle}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 px-4 py-6 lg:px-8">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
