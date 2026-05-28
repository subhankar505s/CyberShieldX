"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileOutput,
  Download,
  Trash2,
  Calendar,
  Shield,
  Search,
  Network,
  Bug,
  Link2,
} from "lucide-react"
import { getScanHistory, clearScanHistory, type ScanResult } from "@/lib/scan-store"

const typeIcons = {
  port: Search,
  vulnerability: Shield,
  malware: Bug,
  phishing: Link2,
}

const typeLabels = {
  port: "Port Scan",
  vulnerability: "Vulnerability Scan",
  malware: "Malware Scan",
  phishing: "Phishing Analysis",
}

const severityColors = {
  critical: "bg-cyber-red/20 text-cyber-red border-cyber-red/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30",
  low: "bg-cyber-green/20 text-cyber-green border-cyber-green/30",
}

const statusColors = {
  completed: "bg-cyber-green/20 text-cyber-green border-cyber-green/30",
  failed: "bg-cyber-red/20 text-cyber-red border-cyber-red/30",
  "in-progress": "bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30",
}

export function ReportsContent() {
  const [history, setHistory] = useState<ScanResult[]>([])

  useEffect(() => {
    setHistory(getScanHistory())
  }, [])

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all scan history? This cannot be undone.")) {
      clearScanHistory()
      setHistory([])
    }
  }

  const generateReport = (scan: ScanResult) => {
    const report = [
      "=" .repeat(60),
      "CYBERSHIELD X - SECURITY SCAN REPORT",
      "=" .repeat(60),
      "",
      `Report Generated: ${new Date().toLocaleString()}`,
      `Scan ID: ${scan.id}`,
      "",
      "-" .repeat(60),
      "SCAN DETAILS",
      "-" .repeat(60),
      "",
      `Type: ${typeLabels[scan.type]}`,
      `Target: ${scan.target}`,
      `Date: ${scan.timestamp.toLocaleString()}`,
      `Status: ${scan.status.toUpperCase()}`,
      scan.severity ? `Severity: ${scan.severity.toUpperCase()}` : "",
      "",
      "-" .repeat(60),
      "RESULTS",
      "-" .repeat(60),
      "",
      JSON.stringify(scan.results, null, 2),
      "",
      "=" .repeat(60),
      "END OF REPORT",
      "=" .repeat(60),
    ].filter(Boolean).join("\n")

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cybershield-report-${scan.type}-${scan.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateFullReport = () => {
    const report = [
      "=" .repeat(60),
      "CYBERSHIELD X - COMPREHENSIVE SECURITY REPORT",
      "=" .repeat(60),
      "",
      `Report Generated: ${new Date().toLocaleString()}`,
      `Total Scans: ${history.length}`,
      "",
      "-" .repeat(60),
      "SUMMARY",
      "-" .repeat(60),
      "",
      `Port Scans: ${history.filter((s) => s.type === "port").length}`,
      `Vulnerability Scans: ${history.filter((s) => s.type === "vulnerability").length}`,
      `Malware Scans: ${history.filter((s) => s.type === "malware").length}`,
      `Phishing Analyses: ${history.filter((s) => s.type === "phishing").length}`,
      "",
      `Critical Severity: ${history.filter((s) => s.severity === "critical").length}`,
      `High Severity: ${history.filter((s) => s.severity === "high").length}`,
      `Medium Severity: ${history.filter((s) => s.severity === "medium").length}`,
      `Low Severity: ${history.filter((s) => s.severity === "low").length}`,
      "",
      "-" .repeat(60),
      "DETAILED SCAN HISTORY",
      "-" .repeat(60),
      "",
      ...history.flatMap((scan, index) => [
        `[${index + 1}] ${typeLabels[scan.type]}`,
        `    Target: ${scan.target}`,
        `    Date: ${scan.timestamp.toLocaleString()}`,
        `    Status: ${scan.status}`,
        scan.severity ? `    Severity: ${scan.severity}` : "",
        "",
      ]),
      "=" .repeat(60),
      "END OF REPORT",
      "=" .repeat(60),
    ].filter(Boolean).join("\n")

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cybershield-full-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const csv = [
      "ID,Type,Target,Timestamp,Status,Severity",
      ...history.map(
        (s) =>
          `"${s.id}","${s.type}","${s.target}","${s.timestamp.toISOString()}","${s.status}","${s.severity || "N/A"}"`
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cybershield-history-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: history.length,
    completed: history.filter((s) => s.status === "completed").length,
    critical: history.filter((s) => s.severity === "critical").length,
    high: history.filter((s) => s.severity === "high").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileOutput className="h-6 w-6 text-primary" />
          Reports & History
        </h1>
        <p className="text-muted-foreground">
          View scan history and generate security reports
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Scans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyber-green/10">
                <Shield className="h-6 w-6 text-cyber-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyber-red/10">
                <Bug className="h-6 w-6 text-cyber-red" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyber-yellow/10">
                <Network className="h-6 w-6 text-cyber-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.high}</p>
                <p className="text-sm text-muted-foreground">High Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
          <CardDescription>Generate and export security reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generateFullReport} disabled={history.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Generate Full Report
            </Button>
            <Button variant="outline" onClick={exportCSV} disabled={history.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="destructive" onClick={handleClearHistory} disabled={history.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>
            {history.length > 0
              ? `Showing ${history.length} scan${history.length !== 1 ? "s" : ""}`
              : "No scans recorded yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileOutput className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No scan history</p>
              <p className="text-sm">Run some security scans to see them here</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((scan) => {
                    const Icon = typeIcons[scan.type]
                    return (
                      <TableRow key={scan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{typeLabels[scan.type]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-[200px] truncate">
                          {scan.target}
                        </TableCell>
                        <TableCell className="text-sm">
                          {scan.timestamp.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[scan.status]}>
                            {scan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {scan.severity ? (
                            <Badge className={severityColors[scan.severity]}>
                              {scan.severity}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateReport(scan)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
