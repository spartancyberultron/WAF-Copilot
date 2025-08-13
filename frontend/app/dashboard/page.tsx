import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { CVEDataTable } from "@/components/cve-data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { TopHeader } from "@/components/top-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import cveData from "./dependency_cves.json"

export default function Page() {
  return (
    <div className="flex h-screen flex-col">
      <TopHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards cveData={cveData} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive cveData={cveData} />
            </div>
            <div className="w-[98% px-5">
              <CVEDataTable data={cveData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
