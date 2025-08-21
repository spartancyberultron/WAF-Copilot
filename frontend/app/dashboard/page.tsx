"use client"
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

import { useState, useEffect } from "react"
import { useCVEs } from "@/hooks/use-cves"
import { useAuth } from "@/hooks/use-auth"
import { Loading } from "@/components/ui/loading"
import { RefreshButton } from "@/components/refresh-button"
import { useRouter } from "next/navigation"

export default function Page() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  
  // Use the new hook to fetch CVE data
  const { cves, loading, error, refreshCVEs } = useCVEs()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])


  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading message="Loading..." size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-600">Error: {error}</p>
          <button 
            onClick={() => refreshCVEs()} 
            className="text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!cves || cves.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">No CVE data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <TopHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex justify-between items-center px-4 lg:px-6">
              <h1 className="text-2xl font-bold">CVE Dashboard</h1>
              <RefreshButton limit={500} />
            </div>
            <SectionCards cveData={cves} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive cveData={cves} />
            </div>
            <div className="w-[98%] px-5">
              <CVEDataTable data={cves} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
