// Security tools and utilities

// Port Scanner simulation
export interface PortScanResult {
  port: number
  status: "open" | "closed" | "filtered"
  service: string
}

const COMMON_PORTS: Record<number, string> = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  80: "HTTP",
  110: "POP3",
  143: "IMAP",
  443: "HTTPS",
  445: "SMB",
  993: "IMAPS",
  995: "POP3S",
  3306: "MySQL",
  3389: "RDP",
  5432: "PostgreSQL",
  5900: "VNC",
  6379: "Redis",
  8080: "HTTP-Proxy",
  8443: "HTTPS-Alt",
  27017: "MongoDB",
}

export async function scanPorts(
  target: string,
  portRange: [number, number],
  onProgress?: (progress: number, port: number) => void
): Promise<PortScanResult[]> {
  const results: PortScanResult[] = []
  const [startPort, endPort] = portRange
  const totalPorts = endPort - startPort + 1

  for (let port = startPort; port <= endPort; port++) {
    // Simulate scanning delay
    await new Promise((resolve) => setTimeout(resolve, 20))

    const progress = ((port - startPort + 1) / totalPorts) * 100
    onProgress?.(progress, port)

    // Simulate port status
    const isOpen = Math.random() < 0.1 // 10% chance of open port
    const isFiltered = !isOpen && Math.random() < 0.05 // 5% chance of filtered

    if (isOpen || isFiltered) {
      results.push({
        port,
        status: isOpen ? "open" : "filtered",
        service: COMMON_PORTS[port] || "Unknown",
      })
    }
  }

  return results
}

// Vulnerability Scanner
export interface Vulnerability {
  id: string
  name: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  cve?: string
  recommendation: string
}

const SAMPLE_VULNERABILITIES: Vulnerability[] = [
  {
    id: "vuln-1",
    name: "Outdated SSL/TLS Version",
    severity: "high",
    description: "The server supports deprecated SSL/TLS versions that are vulnerable to attacks.",
    cve: "CVE-2014-3566",
    recommendation: "Disable SSL 3.0 and TLS 1.0/1.1. Use TLS 1.2 or higher.",
  },
  {
    id: "vuln-2",
    name: "Missing Security Headers",
    severity: "medium",
    description: "Important HTTP security headers are not configured.",
    recommendation: "Add X-Content-Type-Options, X-Frame-Options, and Content-Security-Policy headers.",
  },
  {
    id: "vuln-3",
    name: "Weak Password Policy",
    severity: "medium",
    description: "The application does not enforce strong password requirements.",
    recommendation: "Implement password complexity requirements and minimum length of 12 characters.",
  },
  {
    id: "vuln-4",
    name: "Open Directory Listing",
    severity: "low",
    description: "Directory listing is enabled, exposing file structure.",
    recommendation: "Disable directory listing in web server configuration.",
  },
  {
    id: "vuln-5",
    name: "SQL Injection Potential",
    severity: "critical",
    description: "Input fields may be vulnerable to SQL injection attacks.",
    cve: "CWE-89",
    recommendation: "Use parameterized queries and input validation.",
  },
]

export async function scanVulnerabilities(
  target: string,
  onProgress?: (progress: number) => void
): Promise<Vulnerability[]> {
  const results: Vulnerability[] = []

  for (let i = 0; i < 100; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    onProgress?.(i)
  }

  // Randomly select some vulnerabilities
  const selectedVulns = SAMPLE_VULNERABILITIES.filter(() => Math.random() > 0.4)
  results.push(...selectedVulns)

  onProgress?.(100)
  return results
}

// Password Tools
export function generatePassword(length: number, options: {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}): string {
  let chars = ""
  if (options.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (options.lowercase) chars += "abcdefghijklmnopqrstuvwxyz"
  if (options.numbers) chars += "0123456789"
  if (options.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"

  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz"

  let password = ""
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }

  return password
}

export function checkPasswordStrength(password: string): {
  score: number
  label: string
  suggestions: string[]
} {
  let score = 0
  const suggestions: string[] = []

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (password.length < 8) suggestions.push("Use at least 8 characters")

  if (/[a-z]/.test(password)) score += 1
  else suggestions.push("Add lowercase letters")

  if (/[A-Z]/.test(password)) score += 1
  else suggestions.push("Add uppercase letters")

  if (/[0-9]/.test(password)) score += 1
  else suggestions.push("Add numbers")

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else suggestions.push("Add special characters")

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1
    suggestions.push("Avoid repeated characters")
  }

  if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    score -= 1
    suggestions.push("Mix different character types")
  }

  const normalizedScore = Math.max(0, Math.min(5, score))
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"]

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    suggestions,
  }
}

// Phishing URL Detection
export interface PhishingAnalysis {
  url: string
  riskScore: number
  isSecure: boolean
  flags: string[]
  domainAge?: string
}

const SUSPICIOUS_KEYWORDS = [
  "login",
  "signin",
  "account",
  "verify",
  "secure",
  "update",
  "confirm",
  "banking",
  "paypal",
  "microsoft",
  "apple",
  "google",
  "amazon",
]

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work", ".click"]

export function analyzeUrl(url: string): PhishingAnalysis {
  let riskScore = 0
  const flags: string[] = []

  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
    const hostname = urlObj.hostname.toLowerCase()
    const isSecure = urlObj.protocol === "https:"

    if (!isSecure) {
      riskScore += 20
      flags.push("No HTTPS encryption")
    }

    // Check for IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      riskScore += 30
      flags.push("IP address used instead of domain")
    }

    // Check for suspicious TLDs
    for (const tld of SUSPICIOUS_TLDS) {
      if (hostname.endsWith(tld)) {
        riskScore += 15
        flags.push(`Suspicious TLD: ${tld}`)
        break
      }
    }

    // Check for suspicious keywords in subdomain/path
    const fullUrl = urlObj.toString().toLowerCase()
    for (const keyword of SUSPICIOUS_KEYWORDS) {
      if (fullUrl.includes(keyword) && !hostname.includes(keyword.slice(0, 4))) {
        riskScore += 10
        flags.push(`Suspicious keyword: ${keyword}`)
        break
      }
    }

    // Check for excessive subdomains
    const subdomainCount = hostname.split(".").length - 2
    if (subdomainCount > 2) {
      riskScore += 15
      flags.push("Excessive subdomains")
    }

    // Check for URL encoding
    if (url.includes("%") && (url.includes("%2F") || url.includes("%3A"))) {
      riskScore += 10
      flags.push("Suspicious URL encoding")
    }

    // Check for long URLs
    if (url.length > 100) {
      riskScore += 10
      flags.push("Unusually long URL")
    }

    // Check for @ symbol (often used in phishing)
    if (url.includes("@")) {
      riskScore += 25
      flags.push("Contains @ symbol (credential theft indicator)")
    }

    return {
      url,
      riskScore: Math.min(100, riskScore),
      isSecure,
      flags,
      domainAge: "Unable to verify",
    }
  } catch {
    return {
      url,
      riskScore: 50,
      isSecure: false,
      flags: ["Invalid URL format"],
    }
  }
}

// File Hash Analysis
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export interface MalwareAnalysis {
  hash: string
  fileName: string
  fileSize: number
  status: "clean" | "suspicious" | "malicious" | "unknown"
  detectionRate?: string
  threats: string[]
}

// Simulated malware database (in production, use VirusTotal API)
const KNOWN_MALWARE_HASHES = new Set([
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
])

export async function analyzeMalware(file: File): Promise<MalwareAnalysis> {
  const hash = await calculateFileHash(file)
  const threats: string[] = []

  // Check against known malware
  if (KNOWN_MALWARE_HASHES.has(hash)) {
    return {
      hash,
      fileName: file.name,
      fileSize: file.size,
      status: "malicious",
      detectionRate: "45/70",
      threats: ["Known malware signature detected"],
    }
  }

  // Check file extension
  const suspiciousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".vbs", ".js"]
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."))

  if (suspiciousExtensions.includes(ext)) {
    threats.push(`Potentially dangerous file type: ${ext}`)
  }

  // Check file size anomalies
  if (file.size === 0) {
    threats.push("Empty file detected")
  } else if (file.size > 100 * 1024 * 1024) {
    threats.push("Large file size (>100MB)")
  }

  return {
    hash,
    fileName: file.name,
    fileSize: file.size,
    status: threats.length > 0 ? "suspicious" : "clean",
    detectionRate: threats.length > 0 ? "0/70" : "0/70",
    threats,
  }
}

// Encryption utilities
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  )

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  return btoa(String.fromCharCode(...combined))
}

export async function decryptData(encryptedData: string, password: string): Promise<string> {
  const decoder = new TextDecoder()
  const combined = new Uint8Array(
    atob(encryptedData)
      .split("")
      .map((c) => c.charCodeAt(0))
  )

  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const data = combined.slice(28)

  const key = await deriveKey(password, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  )

  return decoder.decode(decrypted)
}

// Log Analysis
export interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "warning" | "error" | "critical"
  source: string
  message: string
  isThreat: boolean
}

const THREAT_PATTERNS = [
  /failed\s+(login|auth)/i,
  /unauthorized\s+access/i,
  /injection\s+attempt/i,
  /brute\s*force/i,
  /malware\s+detected/i,
  /suspicious\s+activity/i,
  /privilege\s+escalation/i,
  /denial\s+of\s+service/i,
]

export function analyzeLogEntry(line: string, index: number): LogEntry {
  const isThreat = THREAT_PATTERNS.some((pattern) => pattern.test(line))

  // Try to extract timestamp
  const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/)
  const timestamp = timestampMatch ? new Date(timestampMatch[0]) : new Date()

  // Determine log level
  let level: LogEntry["level"] = "info"
  if (/error|fail|exception/i.test(line)) level = "error"
  else if (/warn|caution/i.test(line)) level = "warning"
  else if (/critical|emergency|alert/i.test(line)) level = "critical"

  // Override level if threat detected
  if (isThreat && level === "info") level = "warning"

  return {
    id: `log-${index}-${Date.now()}`,
    timestamp,
    level,
    source: "System",
    message: line.trim(),
    isThreat,
  }
}
