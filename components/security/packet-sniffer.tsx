"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Network, Play, Square, Download, Activity } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface Packet {
  id: number
  timestamp: Date
  protocol: string
  sourceIP: string
  sourcePort: number
  destIP: string
  destPort: number
  length: number
  info: string
}

const PROTOCOLS = ["ALL", "TCP", "UDP", "HTTP", "HTTPS", "DNS", "ICMP"]

const SAMPLE_IPS = [
  "192.168.1.1",
  "192.168.1.100",
  "10.0.0.1",
  "172.16.0.1",
  "8.8.8.8",
  "1.1.1.1",
  "13.107.42.14",
  "151.101.1.69",
]

const SAMPLE_PROTOCOLS = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "ICMP"]

function generatePacket(id: number): Packet {
  const protocol = SAMPLE_PROTOCOLS[Math.floor(Math.random() * SAMPLE_PROTOCOLS.length)]
  const sourceIP = SAMPLE_IPS[Math.floor(Math.random() * SAMPLE_IPS.length)]
  const destIP = SAMPLE_IPS[Math.floor(Math.random() * SAMPLE_IPS.length)]
  
  const sourcePort = Math.floor(Math.random() * 60000) + 1024
  const destPort = protocol === "HTTP" ? 80 : protocol === "HTTPS" ? 443 : protocol === "DNS" ? 53 : Math.floor(Math.random() * 60000) + 1024
  
  const infos: Record<string, string[]> = {
    TCP: ["SYN", "SYN-ACK", "ACK", "FIN", "RST", "PSH-ACK"],
    UDP: ["Request", "Response"],
    HTTP: ["GET /index.html", "POST /api/data", "GET /images/logo.png", "PUT /api/update"],
    HTTPS: ["TLS Handshake", "Application Data", "Change Cipher Spec"],
    DNS: ["Standard query A example.com", "Standard query response", "AAAA query"],
    ICMP: ["Echo request", "Echo reply", "Destination unreachable"],
  }
  
  return {
    id,
    timestamp: new Date(),
    protocol,
    sourceIP,
    sourcePort,
    destIP,
    destPort,
    length: Math.floor(Math.random() * 1500) + 40,
    info: infos[protocol][Math.floor(Math.random() * infos[protocol].length)],
  }
}

export function PacketSnifferContent() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [packets, setPackets] = useState<Packet[]>([])
  const [filter, setFilter] = useState("ALL")
  const [stats, setStats] = useState<Array<{ time: string; packets: number }>>([])
  const packetIdRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isCapturing) {
      intervalRef.current = setInterval(() => {
        const newPackets: Packet[] = []
        const count = Math.floor(Math.random() * 5) + 1
        
        for (let i = 0; i < count; i++) {
          packetIdRef.current++
          newPackets.push(generatePacket(packetIdRef.current))
        }

        setPackets((prev) => [...newPackets, ...prev].slice(0, 500))
        
        setStats((prev) => {
          const newStats = [...prev, { time: `${Date.now() % 10000}`, packets: count }]
          return newStats.slice(-30)
        })
      }, 500)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isCapturing])

  const handleStart = () => {
    setIsCapturing(true)
  }

  const handleStop = () => {
    setIsCapturing(false)
  }

  const handleClear = () => {
    setPackets([])
    setStats([])
    packetIdRef.current = 0
  }

  const exportPackets = () => {
    const csv = [
      "ID,Timestamp,Protocol,Source IP,Source Port,Dest IP,Dest Port,Length,Info",
      ...packets.map(
        (p) =>
          `${p.id},${p.timestamp.toISOString()},${p.protocol},${p.sourceIP},${p.sourcePort},${p.destIP},${p.destPort},${p.length},"${p.info}"`
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `packet-capture-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredPackets = filter === "ALL" ? packets : packets.filter((p) => p.protocol === filter)

  const protocolColors: Record<string, string> = {
    TCP: "bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30",
    UDP: "bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30",
    HTTP: "bg-cyber-green/20 text-cyber-green border-cyber-green/30",
    HTTPS: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    DNS: "bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30",
    ICMP: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" />
          Packet Sniffer
        </h1>
        <p className="text-muted-foreground">
          Monitor network traffic in real-time (Educational simulation)
        </p>
      </div>

      {/* Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Capture Controls</CardTitle>
          <CardDescription>Start or stop packet capture and configure filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {isCapturing ? (
              <Button variant="destructive" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" />
                Stop Capture
              </Button>
            ) : (
              <Button onClick={handleStart}>
                <Play className="h-4 w-4 mr-2" />
                Start Capture
              </Button>
            )}

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROTOCOLS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>

            {packets.length > 0 && (
              <Button variant="outline" onClick={exportPackets}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              {isCapturing && (
                <div className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
              )}
              <span className="text-sm text-muted-foreground">
                {packets.length} packets captured
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Graph */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Traffic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats}>
                <defs>
                  <linearGradient id="packetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.2 195)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.7 0.2 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={false} axisLine={false} />
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
                  dataKey="packets"
                  stroke="oklch(0.7 0.2 195)"
                  fill="url(#packetGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Packet Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Captured Packets</CardTitle>
          <CardDescription>
            Showing {filteredPackets.length} of {packets.length} packets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-auto max-h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="bg-secondary/50">
                  <TableHead className="w-[60px]">No.</TableHead>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead className="w-[80px]">Protocol</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="w-[80px]">Length</TableHead>
                  <TableHead>Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackets.slice(0, 100).map((packet) => (
                  <TableRow key={packet.id} className="font-mono text-xs">
                    <TableCell>{packet.id}</TableCell>
                    <TableCell>
                      {packet.timestamp.toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        fractionalSecondDigits: 3,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={protocolColors[packet.protocol] || "bg-secondary"}>
                        {packet.protocol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {packet.sourceIP}:{packet.sourcePort}
                    </TableCell>
                    <TableCell>
                      {packet.destIP}:{packet.destPort}
                    </TableCell>
                    <TableCell>{packet.length}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{packet.info}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
