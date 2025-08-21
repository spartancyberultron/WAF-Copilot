import { useState, useEffect } from 'react'
import { cveSchema, type CVE } from '@/components/cve-data-table'
import { useAuth } from './use-auth'

export function useCVEs() {
  const [cves, setCves] = useState<CVE[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { makeAuthenticatedRequest, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // Add a small delay to ensure auth headers are ready
      setTimeout(() => {
        fetchCVEs()
      }, 50)
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchCVEs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch CVE data from the backend
      const response = await makeAuthenticatedRequest('http://localhost:8000/api/user/cves/', {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.')
        }
        throw new Error(`Failed to fetch CVEs: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Parse and validate the CVE data
        const validatedCves = data.cves.map((cve: any) => {
          try {
            return cveSchema.parse(cve)
          } catch (err) {
            console.warn('Invalid CVE data:', cve, err)
            return null
          }
        }).filter(Boolean) as CVE[]
        
        setCves(validatedCves)
      } else {
        throw new Error(data.error || 'Failed to fetch CVEs')
      }
    } catch (err) {
      console.error('Error fetching CVEs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch CVEs')
      
      // Fallback to mock data if backend is not available
      const mockCves: CVE[] = [
        {
          id: "CVE-2023-1234",
          description: "A critical vulnerability in the authentication system",
          dependency_name: "auth-library",
          cvss_v3_score: 9.8,
          cvss_v3_vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
          cvss_v2_score: 10.0,
          cvss_v2_vector: "AV:N/AC:L/Au:N/C:C/I:C/A:C",
          published_date: "2023-01-15",
          last_modified_date: "2023-01-20",
          references: ["https://example.com/cve-2023-1234"],
          threat_feed: "NVD",
          resolved: false,
        },
        {
          id: "CVE-2023-5678",
          description: "SQL injection vulnerability in user input handling",
          dependency_name: "database-connector",
          cvss_v3_score: 7.5,
          cvss_v3_vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
          cvss_v2_score: 7.5,
          cvss_v2_vector: "AV:N/AC:L/Au:N/C:P/I:N/A:N",
          published_date: "2023-02-10",
          last_modified_date: "2023-02-15",
          references: ["https://example.com/cve-2023-5678"],
          threat_feed: "GitHub",
          resolved: true,
        },
      ]
      setCves(mockCves)
    } finally {
      setLoading(false)
    }
  }

  const refreshCVEs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await makeAuthenticatedRequest('http://localhost:8000/api/user/cves/refresh/', {
        method: 'POST',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.')
        }
        throw new Error(`Failed to refresh CVEs: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Fetch the updated CVE data
        await fetchCVEs()
      } else {
        throw new Error(data.error || 'Failed to refresh CVEs')
      }
    } catch (err) {
      console.error('Error refreshing CVEs:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh CVEs')
    } finally {
      setLoading(false)
    }
  }

  return {
    cves,
    loading,
    error,
    refreshCVEs,
  }
}
