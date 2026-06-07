// Scan history and results store
export interface ScanResult {
  id: string
  type: "port" | "vulnerability" | "malware" | "phishing"
  target: string
  timestamp: Date
  status: "completed" | "failed" | "in-progress"
  results: Record<string, unknown>
  severity?: "low" | "medium" | "high" | "critical"
}

export interface SystemStats {
  cpu: number
  memory: number
  disk: number
  network: {
    download: number
    upload: number
  }
}

export interface ThreatSummary {
  critical: number
  high: number
  medium: number
  low: number
}

const SCAN_HISTORY_KEY = "cybershield_scan_history"

export function getScanHistory(): ScanResult[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(SCAN_HISTORY_KEY)
  if (!stored) return []
  const history = JSON.parse(stored)
  return history.map((item: ScanResult) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  }))
}

export function saveScanResult(result: ScanResult) {
  const history = getScanHistory()
  history.unshift(result)
  // Keep only last 100 scans
  const trimmed = history.slice(0, 100)
  localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(trimmed))
}

export function clearScanHistory() {
  localStorage.removeItem(SCAN_HISTORY_KEY)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Simulated system stats
export function getSystemStats(): SystemStats {
  return {
    cpu: Math.floor(Math.random() * 40) + 20,
    memory: Math.floor(Math.random() * 30) + 40,
    disk: Math.floor(Math.random() * 20) + 50,
    network: {
      download: Math.floor(Math.random() * 100) + 50,
      upload: Math.floor(Math.random() * 50) + 10,
    },
  }
}

// Simulated threat summary
export function getThreatSummary(): ThreatSummary {
  return {
    critical: Math.floor(Math.random() * 3),
    high: Math.floor(Math.random() * 5) + 1,
    medium: Math.floor(Math.random() * 10) + 5,
    low: Math.floor(Math.random() * 20) + 10,
  }
}
