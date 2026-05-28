"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Upload,
  Search,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Download,
  Filter,
} from "lucide-react"
import { analyzeLogEntry, type LogEntry } from "@/lib/security-tools"

const SAMPLE_LOGS = `2024-01-15 10:23:45 INFO Application started successfully
2024-01-15 10:24:12 INFO User admin logged in from 192.168.1.100
2024-01-15 10:25:33 WARNING Failed login attempt for user john from 10.0.0.55
2024-01-15 10:26:01 WARNING Failed login attempt for user john from 10.0.0.55
2024-01-15 10:26:45 WARNING Failed login attempt for user john from 10.0.0.55
2024-01-15 10:27:00 ERROR Brute force attack detected from 10.0.0.55
2024-01-15 10:28:15 INFO Database backup completed
2024-01-15 10:30:00 CRITICAL Unauthorized access attempt detected
2024-01-15 10:31:22 INFO File upload successful: report.pdf
2024-01-15 10:32:45 WARNING SQL injection attempt blocked from 203.45.67.89
2024-01-15 10:33:10 INFO User session expired for user guest
2024-01-15 10:35:00 ERROR Connection timeout to external API
2024-01-15 10:36:20 INFO Scheduled task executed: cleanup
2024-01-15 10:38:00 WARNING Suspicious activity detected on port 22
2024-01-15 10:40:15 INFO System health check passed`

export function LogAnalyzerContent() {
  const [logText, setLogText] = useState("")
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [threatFilter, setThreatFilter] = useState<string>("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = () => {
    if (!logText.trim()) return

    const lines = logText.split("\n").filter((line) => line.trim())
    const analyzed = lines.map((line, index) => analyzeLogEntry(line, index))
    setEntries(analyzed)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setLogText(content)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = () => {
    setLogText(SAMPLE_LOGS)
  }

  const handleExport = () => {
    const csv = [
      "Timestamp,Level,Source,Message,Is Threat",
      ...entries.map(
        (e) =>
          `"${e.timestamp.toISOString()}","${e.level}","${e.source}","${e.message.replace(/"/g, '""')}","${e.isThreat}"`
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `log-analysis-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === "all" || entry.level === levelFilter
    const matchesThreat =
      threatFilter === "all" ||
      (threatFilter === "threats" && entry.isThreat) ||
      (threatFilter === "safe" && !entry.isThreat)

    return matchesSearch && matchesLevel && matchesThreat
  })

  const threatCount = entries.filter((e) => e.isThreat).length
  const levelCounts = {
    critical: entries.filter((e) => e.level === "critical").length,
    error: entries.filter((e) => e.level === "error").length,
    warning: entries.filter((e) => e.level === "warning").length,
    info: entries.filter((e) => e.level === "info").length,
  }

  const levelIcons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    critical: XCircle,
  }

  const levelColors = {
    info: "text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30",
    warning: "text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/30",
    error: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    critical: "text-cyber-red bg-cyber-red/10 border-cyber-red/30",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Log Analyzer
        </h1>
        <p className="text-muted-foreground">
          Analyze log files to detect suspicious entries and security threats
        </p>
      </div>

      {/* Input Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Log Input</CardTitle>
          <CardDescription>
            Paste log content or upload a log file to analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your log content here..."
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            className="min-h-[200px] bg-input border-border font-mono text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAnalyze} disabled={!logText.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Analyze Logs
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".log,.txt"
              className="hidden"
            />
            <Button variant="outline" onClick={handleLoadSample}>
              Load Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {entries.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{entries.length}</p>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyber-red">{threatCount}</p>
                  <p className="text-sm text-muted-foreground">Threats Detected</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyber-red">{levelCounts.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{levelCounts.error}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyber-yellow">{levelCounts.warning}</p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Log Viewer */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Log Entries ({filteredEntries.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-32 bg-input border-border">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={threatFilter} onValueChange={setThreatFilter}>
                  <SelectTrigger className="w-32 bg-input border-border">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entries</SelectItem>
                    <SelectItem value="threats">Threats Only</SelectItem>
                    <SelectItem value="safe">Safe Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Log Entries */}
              <ScrollArea className="h-[400px] rounded-md border border-border">
                <div className="p-2 space-y-1">
                  {filteredEntries.map((entry) => {
                    const Icon = levelIcons[entry.level]
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-start gap-2 p-2 rounded text-sm font-mono ${
                          entry.isThreat ? "bg-cyber-red/5 border-l-2 border-cyber-red" : "hover:bg-secondary/50"
                        }`}
                      >
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${levelColors[entry.level].split(" ")[0]}`} />
                        <span className="text-muted-foreground shrink-0">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                        <Badge className={`shrink-0 ${levelColors[entry.level]}`}>
                          {entry.level.toUpperCase()}
                        </Badge>
                        <span className={`break-all ${entry.isThreat ? "text-cyber-red" : ""}`}>
                          {entry.message}
                        </span>
                        {entry.isThreat && (
                          <Badge className="shrink-0 bg-cyber-red/20 text-cyber-red border-cyber-red/30">
                            THREAT
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
