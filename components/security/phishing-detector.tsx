"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Link2,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Globe,
  Flag,
} from "lucide-react"
import { analyzeUrl, type PhishingAnalysis } from "@/lib/security-tools"
import { saveScanResult, generateId } from "@/lib/scan-store"

export function PhishingDetectorContent() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<PhishingAnalysis | null>(null)
  const [history, setHistory] = useState<PhishingAnalysis[]>([])

  const handleAnalyze = async () => {
    if (!url.trim()) return

    setIsAnalyzing(true)

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const analysis = analyzeUrl(url)
    setResult(analysis)
    setHistory((prev) => [analysis, ...prev].slice(0, 10))

    // Save scan result
    saveScanResult({
      id: generateId(),
      type: "phishing",
      target: url,
      timestamp: new Date(),
      status: "completed",
      results: analysis,
      severity: analysis.riskScore >= 60 ? "high" : analysis.riskScore >= 30 ? "medium" : "low",
    })

    setIsAnalyzing(false)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 60) return { label: "High Risk", color: "text-cyber-red", bg: "bg-cyber-red" }
    if (score >= 30) return { label: "Medium Risk", color: "text-cyber-yellow", bg: "bg-cyber-yellow" }
    return { label: "Low Risk", color: "text-cyber-green", bg: "bg-cyber-green" }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="h-6 w-6 text-primary" />
          Phishing URL Detector
        </h1>
        <p className="text-muted-foreground">
          Analyze URLs for potential phishing attempts and security risks
        </p>
      </div>

      {/* URL Input */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>URL Analysis</CardTitle>
          <CardDescription>
            Enter a URL to check for phishing indicators and security issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="url">URL to Analyze</Label>
              <Input
                id="url"
                placeholder="https://example.com or example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnalyzing}
                className="bg-input border-border"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !url.trim()}>
                {isAnalyzing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze URL
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.riskScore >= 60 ? (
                <ShieldAlert className="h-5 w-5 text-cyber-red" />
              ) : result.riskScore >= 30 ? (
                <AlertTriangle className="h-5 w-5 text-cyber-yellow" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-cyber-green" />
              )}
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score</span>
                <Badge className={`${getRiskLevel(result.riskScore).bg}/20 ${getRiskLevel(result.riskScore).color} border-current/30`}>
                  {getRiskLevel(result.riskScore).label}
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress
                  value={result.riskScore}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Safe</span>
                  <span className="font-bold text-foreground">{result.riskScore}/100</span>
                  <span>Dangerous</span>
                </div>
              </div>
            </div>

            {/* URL Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Analyzed URL
                </div>
                <p className="font-mono text-sm break-all">{result.url}</p>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {result.isSecure ? <Lock className="h-4 w-4 text-cyber-green" /> : <Unlock className="h-4 w-4 text-cyber-yellow" />}
                  Connection Security
                </div>
                <p className={`font-medium ${result.isSecure ? "text-cyber-green" : "text-cyber-yellow"}`}>
                  {result.isSecure ? "HTTPS (Encrypted)" : "HTTP (Not Encrypted)"}
                </p>
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Flag className="h-4 w-4" />
                  Security Flags ({result.flags.length})
                </div>
                <div className="space-y-2">
                  {result.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-cyber-red/10 border border-cyber-red/20">
                      <AlertTriangle className="h-4 w-4 text-cyber-red shrink-0 mt-0.5" />
                      <span className="text-sm">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/20">
                <Shield className="h-5 w-5 text-cyber-green" />
                <span className="text-sm text-cyber-green">No security flags detected</span>
              </div>
            )}

            {/* Recommendations */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
              <p className="font-medium">Recommendations</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {result.riskScore >= 60 ? (
                  <>
                    <li>- Do NOT enter any personal information on this site</li>
                    <li>- Do NOT download any files from this URL</li>
                    <li>- Consider reporting this URL to your IT department</li>
                  </>
                ) : result.riskScore >= 30 ? (
                  <>
                    <li>- Proceed with caution if visiting this site</li>
                    <li>- Verify the URL matches the expected domain</li>
                    <li>- Look for additional signs of legitimacy</li>
                  </>
                ) : (
                  <>
                    <li>- URL appears safe but always verify before entering credentials</li>
                    <li>- Check for the padlock icon in your browser</li>
                    <li>- Be cautious of unexpected emails linking to this URL</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item, i) => {
                const risk = getRiskLevel(item.riskScore)
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-2 w-2 rounded-full ${risk.bg}`} />
                      <span className="text-sm font-mono truncate">{item.url}</span>
                    </div>
                    <Badge variant="outline" className={`${risk.color} shrink-0`}>
                      {item.riskScore}%
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
