"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  getSystemStats,
  getThreatSummary,
  getScanHistory,
  type SystemStats,
  type ThreatSummary,
  type ScanResult,
} from "@/lib/scan-store"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

export function DashboardContent() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [threats, setThreats] = useState<ThreatSummary | null>(null)
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])
  const [networkData, setNetworkData] = useState<Array<{ time: string; download: number; upload: number }>>([])

  useEffect(() => {
    // Initial load
    setStats(getSystemStats())
    setThreats(getThreatSummary())
    setRecentScans(getScanHistory().slice(0, 5))

    // Initialize network data
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}s`,
      download: Math.floor(Math.random() * 100) + 50,
      upload: Math.floor(Math.random() * 50) + 10,
    }))
    setNetworkData(initialData)

    // Update stats periodically
    const interval = setInterval(() => {
      setStats(getSystemStats())

      setNetworkData((prev) => {
        const newData = [...prev.slice(1)]
        newData.push({
          time: `${Date.now() % 1000}ms`,
          download: Math.floor(Math.random() * 100) + 50,
          upload: Math.floor(Math.random() * 50) + 10,
        })
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!stats || !threats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const threatTotal = threats.critical + threats.high + threats.medium + threats.low

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor your system security status in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CPU Usage */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cpu}%</div>
            <Progress value={stats.cpu} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memory}%</div>
            <Progress value={stats.memory} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Disk Usage */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disk}%</div>
            <Progress value={stats.disk} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Network */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <ArrowDown className="h-3 w-3 text-cyber-green" />
                <span>{stats.network.download} MB/s</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUp className="h-3 w-3 text-cyber-cyan" />
                <span>{stats.network.upload} MB/s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Threat Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Threat Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-cyber-red" />
                  <span className="text-sm">Critical</span>
                </div>
                <span className="text-2xl font-bold">{threats.critical}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-cyber-yellow" />
                  <span className="text-sm">High</span>
                </div>
                <span className="text-2xl font-bold">{threats.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-cyber-cyan" />
                  <span className="text-sm">Medium</span>
                </div>
                <span className="text-2xl font-bold">{threats.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-cyber-green" />
                  <span className="text-sm">Low</span>
                </div>
                <span className="text-2xl font-bold">{threats.low}</span>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Threats</span>
                  <span className="text-xl font-bold">{threatTotal}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Traffic */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Network Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkData}>
                  <defs>
                    <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.7 0.2 195)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.7 0.2 195)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.18 280)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.6 0.18 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.015 260)",
                      border: "1px solid oklch(0.22 0.025 260)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0.01 260)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="download"
                    stroke="oklch(0.7 0.2 195)"
                    fill="url(#downloadGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="upload"
                    stroke="oklch(0.6 0.18 280)"
                    fill="url(#uploadGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent scans. Start a security scan to see activity here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        scan.status === "completed"
                          ? "bg-cyber-green"
                          : scan.status === "failed"
                          ? "bg-cyber-red"
                          : "bg-cyber-yellow animate-pulse"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium capitalize">{scan.type} Scan</p>
                      <p className="text-xs text-muted-foreground">{scan.target}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm capitalize">{scan.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
