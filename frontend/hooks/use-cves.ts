import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface CVE {
  id: string
  description: string
  dependency_name: string
  cvss_v3_score: number | null
  cvss_v3_vector: string | null
  cvss_v2_score: number | null
  cvss_v2_vector: string | null
  published_date: string
  last_modified_date: string
  references: string[]
  threat_feed: string
}

interface CVEResponse {
  success: boolean
  total_cves: number
  statistics: {
    by_threat_feed: Record<string, number>
    by_severity: {
      critical: number
      high: number
      medium: number
      low: number
      unknown: number
    }
  }
  cves: CVE[]
}

const fetchCVEs = async (limit: number = 100): Promise<CVEResponse> => {
  const response = await fetch(`http://localhost:8000/api/cves/aggregated/?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch CVE data')
  }
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch CVE data')
  }
  return data
}

export const useCVEs = (limit: number = 100) => {
  return useQuery({
    queryKey: ['cves', limit],
    queryFn: () => fetchCVEs(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

export const useCVEStatistics = (limit: number = 100) => {
  return useQuery({
    queryKey: ['cve-statistics', limit],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8000/api/cves/statistics/?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch CVE statistics')
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch CVE statistics')
      }
      return data.statistics
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCVEsByThreatFeed = (threatFeed: string, limit: number = 100) => {
  return useQuery({
    queryKey: ['cves-by-threat-feed', threatFeed, limit],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8000/api/cves/threat-feed/?threat_feed=${encodeURIComponent(threatFeed)}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch CVE data by threat feed')
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch CVE data by threat feed')
      }
      return data.cves as CVE[]
    },
    enabled: !!threatFeed,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation hook for refreshing CVE data
export const useRefreshCVEs = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (limit: number = 100) => {
      const response = await fetch(`http://localhost:8000/api/cves/aggregated/?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to refresh CVE data')
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh CVE data')
      }
      return data
    },
    onSuccess: (data, limit) => {
      // Invalidate and refetch all CVE queries
      queryClient.invalidateQueries({ queryKey: ['cves'] })
      queryClient.invalidateQueries({ queryKey: ['cve-statistics'] })
      queryClient.invalidateQueries({ queryKey: ['cves-by-threat-feed'] })
    },
  })
}
