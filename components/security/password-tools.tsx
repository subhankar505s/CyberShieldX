"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Copy, RefreshCw, Shield, Check, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { generatePassword, checkPasswordStrength } from "@/lib/security-tools"

export function PasswordToolsContent() {
  // Generator state
  const [length, setLength] = useState(16)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(true)

  // Checker state
  const [passwordToCheck, setPasswordToCheck] = useState("")
  const [showCheckPassword, setShowCheckPassword] = useState(false)

  const handleGenerate = () => {
    const password = generatePassword(length, {
      uppercase: useUppercase,
      lowercase: useLowercase,
      numbers: useNumbers,
      symbols: useSymbols,
    })
    setGeneratedPassword(password)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const strength = passwordToCheck ? checkPasswordStrength(passwordToCheck) : null

  const strengthColors = [
    "bg-cyber-red",
    "bg-orange-500",
    "bg-cyber-yellow",
    "bg-cyber-cyan",
    "bg-cyber-green",
    "bg-emerald-400",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          Password Security Center
        </h1>
        <p className="text-muted-foreground">
          Generate strong passwords and check password strength
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="generator">Password Generator</TabsTrigger>
          <TabsTrigger value="checker">Strength Checker</TabsTrigger>
        </TabsList>

        {/* Password Generator */}
        <TabsContent value="generator" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Generate Secure Password</CardTitle>
              <CardDescription>
                Create cryptographically secure passwords with customizable options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generated Password Display */}
              <div className="space-y-2">
                <Label>Generated Password</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={generatedPassword}
                      readOnly
                      placeholder="Click generate to create a password"
                      className="bg-input border-border font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopy} disabled={!generatedPassword}>
                    {copied ? <Check className="h-4 w-4 text-cyber-green" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleGenerate}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {/* Length Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Password Length</Label>
                  <span className="text-sm font-mono text-muted-foreground">{length} characters</span>
                </div>
                <Slider
                  value={[length]}
                  onValueChange={(v) => setLength(v[0])}
                  min={8}
                  max={64}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Character Options */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">A-Z</span>
                    <span className="text-sm text-muted-foreground">Uppercase</span>
                  </div>
                  <Switch checked={useUppercase} onCheckedChange={setUseUppercase} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">a-z</span>
                    <span className="text-sm text-muted-foreground">Lowercase</span>
                  </div>
                  <Switch checked={useLowercase} onCheckedChange={setUseLowercase} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">0-9</span>
                    <span className="text-sm text-muted-foreground">Numbers</span>
                  </div>
                  <Switch checked={useNumbers} onCheckedChange={setUseNumbers} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">!@#</span>
                    <span className="text-sm text-muted-foreground">Symbols</span>
                  </div>
                  <Switch checked={useSymbols} onCheckedChange={setUseSymbols} />
                </div>
              </div>

              {/* Password Strength Preview */}
              {generatedPassword && (
                <div className="space-y-2">
                  <Label>Generated Password Strength</Label>
                  {(() => {
                    const genStrength = checkPasswordStrength(generatedPassword)
                    return (
                      <div className="space-y-2">
                        <Progress
                          value={(genStrength.score / 5) * 100}
                          className="h-2"
                        />
                        <p className={`text-sm font-medium ${
                          genStrength.score >= 4 ? "text-cyber-green" :
                          genStrength.score >= 3 ? "text-cyber-cyan" :
                          genStrength.score >= 2 ? "text-cyber-yellow" :
                          "text-cyber-red"
                        }`}>
                          {genStrength.label}
                        </p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strength Checker */}
        <TabsContent value="checker" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Password Strength Checker</CardTitle>
              <CardDescription>
                Analyze the strength and security of your passwords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="checkPassword">Enter Password to Check</Label>
                <div className="relative">
                  <Input
                    id="checkPassword"
                    type={showCheckPassword ? "text" : "password"}
                    value={passwordToCheck}
                    onChange={(e) => setPasswordToCheck(e.target.value)}
                    placeholder="Enter a password to analyze"
                    className="bg-input border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCheckPassword(!showCheckPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCheckPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {strength && (
                <div className="space-y-6">
                  {/* Strength Meter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Strength Score</Label>
                      <span className={`font-medium ${
                        strength.score >= 4 ? "text-cyber-green" :
                        strength.score >= 3 ? "text-cyber-cyan" :
                        strength.score >= 2 ? "text-cyber-yellow" :
                        "text-cyber-red"
                      }`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strengthColors[strength.score] : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Length</p>
                      <p className="text-xl font-bold">{passwordToCheck.length} characters</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-xl font-bold">{strength.score}/5</p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {strength.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-cyber-yellow" />
                        Improvement Suggestions
                      </Label>
                      <ul className="space-y-1">
                        {strength.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyber-yellow" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {strength.score >= 4 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/20">
                      <Shield className="h-5 w-5 text-cyber-green" />
                      <span className="text-sm text-cyber-green">
                        This password meets strong security standards
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
