'use client'

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useCVEs } from "@/hooks/use-cves"

interface RefreshButtonProps {
  limit?: number
  className?: string
}

export function RefreshButton({ limit = 500, className = "" }: RefreshButtonProps) {
  const { refreshCVEs, loading } = useCVEs()

  const handleRefresh = () => {
    refreshCVEs()
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={loading}
      variant="outline"
      size="sm"
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Refreshing...' : 'Refresh Data'}
    </Button>
  )
}
