'use client'

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRefreshCVEs } from "@/hooks/use-cves"

interface RefreshButtonProps {
  limit?: number
  className?: string
}

export function RefreshButton({ limit = 500, className = "" }: RefreshButtonProps) {
  const refreshMutation = useRefreshCVEs()

  const handleRefresh = () => {
    refreshMutation.mutate(limit)
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={refreshMutation.isPending}
      variant="outline"
      size="sm"
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
      {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
    </Button>
  )
}
