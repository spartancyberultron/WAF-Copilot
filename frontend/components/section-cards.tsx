import { IconAlertTriangle, IconShield, IconTrendingUp, IconTrendingDown, IconBug, IconPackage } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// CVE data type
interface CVE {
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
}

interface SectionCardsProps {
  cveData: CVE[]
}

export function SectionCards({ cveData }: SectionCardsProps) {
  // Calculate CVE statistics
  const totalCVEs = cveData.length
  
  // Severity breakdown
  const criticalCVEs = cveData.filter(cve => cve.cvss_v3_score && cve.cvss_v3_score >= 9.0).length
  const highCVEs = cveData.filter(cve => cve.cvss_v3_score && cve.cvss_v3_score >= 7.0 && cve.cvss_v3_score < 9.0).length
  const mediumCVEs = cveData.filter(cve => cve.cvss_v3_score && cve.cvss_v3_score >= 4.0 && cve.cvss_v3_score < 7.0).length
  
  // Average CVSS score
  const validScores = cveData.filter(cve => cve.cvss_v3_score !== null).map(cve => cve.cvss_v3_score!)
  const averageCVSS = validScores.length > 0 ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(1) : "N/A"
  
  // Unique dependencies affected
  const uniqueDependencies = new Set(cveData.map(cve => cve.dependency_name)).size
  
  // Recent CVEs (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentCVEs = cveData.filter(cve => new Date(cve.published_date) > thirtyDaysAgo).length
  
  // Most common dependency types
  const dependencyCounts = cveData.reduce((acc, cve) => {
    acc[cve.dependency_name] = (acc[cve.dependency_name] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topDependency = Object.entries(dependencyCounts)
    .sort(([,a], [,b]) => b - a)[0] || ["None", 0]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Critical Vulnerabilities</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {criticalCVEs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconAlertTriangle className="size-3" />
              CVSS ≥ 9.0
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {criticalCVEs > 0 ? `${criticalCVEs} critical vulnerabilities found` : "No critical vulnerabilities"} 
            <IconAlertTriangle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {criticalCVEs > 0 ? "Immediate attention required" : "Good security posture"}
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>High Severity CVEs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {highCVEs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBug className="size-3" />
              CVSS 7.0-8.9
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {highCVEs} high-risk vulnerabilities <IconBug className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {highCVEs > 0 ? "Priority patching needed" : "No high severity issues"}
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average CVSS Score</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {averageCVSS}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconShield className="size-3" />
              Risk Level
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {averageCVSS !== "N/A" && parseFloat(averageCVSS) >= 7.0 ? "High risk environment" : "Moderate risk level"} 
            <IconShield className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Based on {validScores.length} scored vulnerabilities
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Dependencies Affected</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {uniqueDependencies}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage className="size-3" />
              Unique
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Top: {topDependency[0]} ({topDependency[1]} CVEs) <IconPackage className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Across {totalCVEs} total vulnerabilities
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
