"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

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
  threat_feed: string
}

interface ChartAreaInteractiveProps {
  cveData: CVE[]
}

export const description = "CVE vulnerability statistics and trends"

const chartConfig = {
  critical: {
    label: "Critical (9.0+)",
    color: "hsl(var(--primary))",
  },
  high: {
    label: "High (7.0-8.9)",
    color: "hsl(var(--primary))",
  },
  medium: {
    label: "Medium (4.0-6.9)",
    color: "hsl(var(--muted-foreground))",
  },
  low: {
    label: "Low (0.1-3.9)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const COLORS = ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']

export function ChartAreaInteractive({ cveData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [chartType, setChartType] = React.useState("trend")
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  // Process CVE data for charts
  const processCVEData = () => {
    // Group CVEs by month for trend analysis
    const monthlyData = cveData.reduce((acc, cve) => {
      const date = new Date(cve.published_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          total: 0
        }
      }
      
      const score = cve.cvss_v3_score
      if (score) {
        if (score >= 9.0) acc[monthKey].critical++
        else if (score >= 7.0) acc[monthKey].high++
        else if (score >= 4.0) acc[monthKey].medium++
        else acc[monthKey].low++
      }
      acc[monthKey].total++
      
      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
  }

  // Severity distribution for pie chart
  const severityDistribution = React.useMemo(() => {
    const critical = cveData.filter(cve => cve.cvss_v3_score && cve.cvss_v3_score >= 9.0).length
    const high = cveData.filter(cve => cve.cvss_v3_score && cve.cvss_v3_score >= 7.0 && cve.cvss_v3_score < 9.0).length
    const medium = cveData.filter(cve => cve.cvss_v3_score && cve.cvss_v3_score >= 4.0 && cve.cvss_v3_score < 7.0).length
    const low = cveData.filter(cve => cve.cvss_v3_score && cve.cvss_v3_score > 0 && cve.cvss_v3_score < 4.0).length

    return [
      { name: 'Critical', value: critical, color: COLORS[0] },
      { name: 'High', value: high, color: COLORS[1] },
      { name: 'Medium', value: medium, color: COLORS[2] },
      { name: 'Low', value: low, color: COLORS[3] },
    ].filter(item => item.value > 0)
  }, [cveData])

  // Top dependencies by CVE count
  const topDependencies = React.useMemo(() => {
    const dependencyCounts = cveData.reduce((acc, cve) => {
      acc[cve.dependency_name] = (acc[cve.dependency_name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(dependencyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
  }, [cveData])

  // Top threat feeds by CVE count
  const topThreatFeeds = React.useMemo(() => {
    const threatFeedCounts = cveData.reduce((acc, cve) => {
      acc[cve.threat_feed] = (acc[cve.threat_feed] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(threatFeedCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
  }, [cveData])

  const chartData = processCVEData()

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.month + "-01")
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const renderTrendChart = () => (
    <AreaChart data={filteredData}>
      <defs>
        <linearGradient id="fillCritical" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6b7280" stopOpacity={0.6} />
          <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="fillHigh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.6} />
          <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="fillMedium" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.6} />
          <stop offset="95%" stopColor="#d1d5db" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="fillLow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#e5e7eb" stopOpacity={0.6} />
          <stop offset="95%" stopColor="#e5e7eb" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" strokeOpacity={0.15} />
      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={32}
        tick={{ fill: '#6b7280', fontSize: 12 }}
        tickFormatter={(value) => {
          const date = new Date(value + "-01")
          return date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          })
        }}
      />
      <ChartTooltip
        cursor={false}
        content={
          <ChartTooltipContent
            labelFormatter={(value) => {
              const date = new Date(value + "-01")
              return date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            }}
            indicator="dot"
          />
        }
      />
      <Area
        dataKey="critical"
        type="natural"
        fill="url(#fillCritical)"
        stroke="#6b7280"
        strokeWidth={2}
        stackId="a"
      />
      <Area
        dataKey="high"
        type="natural"
        fill="url(#fillHigh)"
        stroke="#9ca3af"
        strokeWidth={2}
        stackId="a"
      />
      <Area
        dataKey="medium"
        type="natural"
        fill="url(#fillMedium)"
        stroke="#d1d5db"
        strokeWidth={2}
        stackId="a"
      />
      <Area
        dataKey="low"
        type="natural"
        fill="url(#fillLow)"
        stroke="#e5e7eb"
        strokeWidth={2}
        stackId="a"
      />
    </AreaChart>
  )

  const renderPieChart = () => (
    <PieChart>
      <Pie
        data={severityDistribution}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {severityDistribution.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <ChartTooltip />
    </PieChart>
  )

  const renderBarChart = () => (
    <BarChart data={topDependencies}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="name"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        angle={-45}
        textAnchor="end"
        height={80}
      />
      <ChartTooltip 
        contentStyle={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#f9fafb'
        }}
      />
      <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
    </BarChart>
  )

  const renderThreatFeedsChart = () => (
    <BarChart data={topThreatFeeds}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="name"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        angle={-45}
        textAnchor="end"
        height={80}
      />
      <ChartTooltip 
        contentStyle={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#f9fafb'
        }}
      />
      <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
    </BarChart>
  )

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>CVE Vulnerability Analysis</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Vulnerability trends and severity distribution
          </span>
          <span className="@[540px]/card:hidden">CVE analysis</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={setChartType}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-6 @[767px]/card:flex"
          >
            <ToggleGroupItem value="trend">Trends</ToggleGroupItem>
            <ToggleGroupItem value="severity">Severity</ToggleGroupItem>
            <ToggleGroupItem value="dependencies">Dependencies</ToggleGroupItem>
            <ToggleGroupItem value="threatfeeds">Threat Feeds</ToggleGroupItem>
          </ToggleGroup>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select chart type"
            >
              <SelectValue placeholder="Trends" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="trend" className="rounded-lg">Trends</SelectItem>
              <SelectItem value="severity" className="rounded-lg">Severity</SelectItem>
              <SelectItem value="dependencies" className="rounded-lg">Dependencies</SelectItem>
              <SelectItem value="threatfeeds" className="rounded-lg">Threat Feeds</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full bg-stone-50 dark:bg-stone-900 rounded-lg p-4"
        >
          {chartType === "trend" && renderTrendChart()}
          {chartType === "severity" && renderPieChart()}
          {chartType === "dependencies" && renderBarChart()}
          {chartType === "threatfeeds" && renderThreatFeedsChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
