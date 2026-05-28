"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Play, Square, Download, Server } from "lucide-react"
import { scanPorts, type PortScanResult } from "@/lib/security-tools"
import { saveScanResult, generateId } from "@/lib/scan-store"

export function PortScannerContent() {
  const [target, setTarget] = useState("")
  const [startPort, setStartPort] = useState("1")
  const [endPort, setEndPort] = useState("1024")
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPort, setCurrentPort] = useState(0)
  const [results, setResults] = useState<PortScanResult[]>([])
  const [scanComplete, setScanComplete] = useState(false)

  const handleScan = async () => {
    if (!target.trim()) return

    setIsScanning(true)
    setProgress(0)
    setResults([])
    setScanComplete(false)
    setCurrentPort(0)

    try {
      const scanResults = await scanPorts(
        target,
        [parseInt(startPort), parseInt(endPort)],
        (prog, port) => {
          setProgress(prog)
          setCurrentPort(port)
        }
      )

      setResults(scanResults)
      setScanComplete(true)

      // Save scan result
      saveScanResult({
        id: generateId(),
        type: "port",
        target,
        timestamp: new Date(),
        status: "completed",
        results: { openPorts: scanResults },
        severity: scanResults.length > 10 ? "high" : scanResults.length > 5 ? "medium" : "low",
      })
    } catch (error) {
      console.error("Scan error:", error)
      saveScanResult({
        id: generateId(),
        type: "port",
        target,
        timestamp: new Date(),
        status: "failed",
        results: { error: "Scan failed" },
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleStop = () => {
    setIsScanning(false)
    setScanComplete(true)
  }

  const exportResults = () => {
    const csv = [
      "Port,Status,Service",
      ...results.map((r) => `${r.port},${r.status},${r.service}`),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `port-scan-${target}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Port Scanner
        </h1>
        <p className="text-muted-foreground">
          Scan network ports to identify open services and potential vulnerabilities
        </p>
      </div>

      {/* Scan Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Scan Configuration</CardTitle>
          <CardDescription>Configure the target and port range for the scan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="target">Target IP/Hostname</Label>
              <Input
                id="target"
                placeholder="192.168.1.1 or example.com"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isScanning}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startPort">Start Port</Label>
              <Input
                id="startPort"
                type="number"
                min="1"
                max="65535"
                value={startPort}
                onChange={(e) => setStartPort(e.target.value)}
                disabled={isScanning}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endPort">End Port</Label>
              <Input
                id="endPort"
                type="number"
                min="1"
                max="65535"
                value={endPort}
                onChange={(e) => setEndPort(e.target.value)}
                disabled={isScanning}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isScanning ? (
              <Button variant="destructive" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" />
                Stop Scan
              </Button>
            ) : (
              <Button onClick={handleScan} disabled={!target.trim()}>
                <Play className="h-4 w-4 mr-2" />
                Start Scan
              </Button>
            )}
            {scanComplete && results.length > 0 && (
              <Button variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isScanning && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyber-cyan animate-pulse" />
              Scanning in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Scanning port {currentPort}...</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {scanComplete && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Scan Results
            </CardTitle>
            <CardDescription>
              Found {results.length} open/filtered port{results.length !== 1 ? "s" : ""} on {target}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No open ports found in the specified range</p>
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>Port</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Service</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.port}>
                        <TableCell className="font-mono">{result.port}</TableCell>
                        <TableCell>
                          <Badge
                            variant={result.status === "open" ? "default" : "secondary"}
                            className={
                              result.status === "open"
                                ? "bg-cyber-green/20 text-cyber-green border-cyber-green/30"
                                : "bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30"
                            }
                          >
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{result.service}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
