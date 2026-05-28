"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Bell,
  Shield,
  Database,
  Palette,
  Key,
  Save,
  Check,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface AppSettings {
  notifications: {
    threatAlerts: boolean
    scanComplete: boolean
    weeklyReport: boolean
    emailAlerts: boolean
  }
  scanning: {
    autoScan: boolean
    scanInterval: string
    maxConcurrentScans: string
    saveHistory: boolean
  }
  appearance: {
    compactMode: boolean
    showAnimations: boolean
    highContrast: boolean
  }
  api: {
    virusTotalKey: string
    shodanKey: string
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    threatAlerts: true,
    scanComplete: true,
    weeklyReport: false,
    emailAlerts: false,
  },
  scanning: {
    autoScan: false,
    scanInterval: "daily",
    maxConcurrentScans: "3",
    saveHistory: true,
  },
  appearance: {
    compactMode: false,
    showAnimations: true,
    highContrast: false,
  },
  api: {
    virusTotalKey: "",
    shodanKey: "",
  },
}

const SETTINGS_KEY = "cybershield_settings"

export function SettingsContent() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  const updateSettings = <K extends keyof AppSettings>(
    category: K,
    key: keyof AppSettings[K],
    value: AppSettings[K][keyof AppSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    setHasChanges(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm("Reset all settings to defaults?")) {
      setSettings(DEFAULT_SETTINGS)
      localStorage.removeItem(SETTINGS_KEY)
      setHasChanges(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure application preferences and integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges && !saved}>
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name || ""} disabled className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure alert and notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Threat Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when threats are detected
              </p>
            </div>
            <Switch
              checked={settings.notifications.threatAlerts}
              onCheckedChange={(v) => updateSettings("notifications", "threatAlerts", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scan Complete</Label>
              <p className="text-sm text-muted-foreground">
                Notify when scans finish
              </p>
            </div>
            <Switch
              checked={settings.notifications.scanComplete}
              onCheckedChange={(v) => updateSettings("notifications", "scanComplete", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly security summaries
              </p>
            </div>
            <Switch
              checked={settings.notifications.weeklyReport}
              onCheckedChange={(v) => updateSettings("notifications", "weeklyReport", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scanning */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Scanning Preferences
          </CardTitle>
          <CardDescription>Configure scan behavior and storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Scan</Label>
              <p className="text-sm text-muted-foreground">
                Automatically run scheduled scans
              </p>
            </div>
            <Switch
              checked={settings.scanning.autoScan}
              onCheckedChange={(v) => updateSettings("scanning", "autoScan", v)}
            />
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Scan Interval</Label>
              <Select
                value={settings.scanning.scanInterval}
                onValueChange={(v) => updateSettings("scanning", "scanInterval", v)}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Concurrent Scans</Label>
              <Select
                value={settings.scanning.maxConcurrentScans}
                onValueChange={(v) => updateSettings("scanning", "maxConcurrentScans", v)}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Save History</Label>
              <p className="text-sm text-muted-foreground">
                Keep scan results in local storage
              </p>
            </div>
            <Switch
              checked={settings.scanning.saveHistory}
              onCheckedChange={(v) => updateSettings("scanning", "saveHistory", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the application look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for more content
              </p>
            </div>
            <Switch
              checked={settings.appearance.compactMode}
              onCheckedChange={(v) => updateSettings("appearance", "compactMode", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable UI animations and transitions
              </p>
            </div>
            <Switch
              checked={settings.appearance.showAnimations}
              onCheckedChange={(v) => updateSettings("appearance", "showAnimations", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for accessibility
              </p>
            </div>
            <Switch
              checked={settings.appearance.highContrast}
              onCheckedChange={(v) => updateSettings("appearance", "highContrast", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Integrations
          </CardTitle>
          <CardDescription>Configure third-party API keys for enhanced scanning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-cyber-yellow/10 border border-cyber-yellow/20 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-cyber-yellow mt-0.5" />
            <p className="text-sm text-cyber-yellow">
              API keys are stored locally. For production use, store keys securely on the server.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="virusTotalKey">VirusTotal API Key</Label>
            <Input
              id="virusTotalKey"
              type="password"
              placeholder="Enter your VirusTotal API key"
              value={settings.api.virusTotalKey}
              onChange={(e) => updateSettings("api", "virusTotalKey", e.target.value)}
              className="bg-input border-border font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Get a free API key at{" "}
              <a href="https://www.virustotal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                virustotal.com
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shodanKey">Shodan API Key</Label>
            <Input
              id="shodanKey"
              type="password"
              placeholder="Enter your Shodan API key"
              value={settings.api.shodanKey}
              onChange={(e) => updateSettings("api", "shodanKey", e.target.value)}
              className="bg-input border-border font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Get a free API key at{" "}
              <a href="https://www.shodan.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                shodan.io
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
