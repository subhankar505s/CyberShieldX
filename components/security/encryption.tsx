"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Unlock, Upload, Download, FileText, Check, AlertCircle, Eye, EyeOff } from "lucide-react"
import { encryptData, decryptData } from "@/lib/security-tools"

export function EncryptionContent() {
  // Text encryption state
  const [plainText, setPlainText] = useState("")
  const [encryptedText, setEncryptedText] = useState("")
  const [textPassword, setTextPassword] = useState("")
  const [showTextPassword, setShowTextPassword] = useState(false)
  const [textStatus, setTextStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)

  // File encryption state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePassword, setFilePassword] = useState("")
  const [showFilePassword, setShowFilePassword] = useState(false)
  const [fileStatus, setFileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEncryptText = async () => {
    if (!plainText || !textPassword) {
      setTextStatus({ type: "error", message: "Please enter both text and password" })
      return
    }

    setIsEncrypting(true)
    setTextStatus(null)

    try {
      const encrypted = await encryptData(plainText, textPassword)
      setEncryptedText(encrypted)
      setTextStatus({ type: "success", message: "Text encrypted successfully!" })
    } catch (error) {
      console.error(error)
      setTextStatus({ type: "error", message: "Encryption failed" })
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleDecryptText = async () => {
    if (!encryptedText || !textPassword) {
      setTextStatus({ type: "error", message: "Please enter both encrypted text and password" })
      return
    }

    setIsEncrypting(true)
    setTextStatus(null)

    try {
      const decrypted = await decryptData(encryptedText, textPassword)
      setPlainText(decrypted)
      setTextStatus({ type: "success", message: "Text decrypted successfully!" })
    } catch (error) {
      console.error(error)
      setTextStatus({ type: "error", message: "Decryption failed. Check your password." })
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileStatus(null)
    }
  }

  const handleEncryptFile = async () => {
    if (!selectedFile || !filePassword) {
      setFileStatus({ type: "error", message: "Please select a file and enter a password" })
      return
    }

    setIsProcessingFile(true)
    setFileStatus(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        const encrypted = await encryptData(content, filePassword)
        
        // Download encrypted file
        const blob = new Blob([encrypted], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedFile.name}.encrypted`
        a.click()
        URL.revokeObjectURL(url)
        
        setFileStatus({ type: "success", message: "File encrypted and downloaded!" })
        setIsProcessingFile(false)
      }
      reader.readAsText(selectedFile)
    } catch (error) {
      console.error(error)
      setFileStatus({ type: "error", message: "File encryption failed" })
      setIsProcessingFile(false)
    }
  }

  const handleDecryptFile = async () => {
    if (!selectedFile || !filePassword) {
      setFileStatus({ type: "error", message: "Please select a file and enter a password" })
      return
    }

    setIsProcessingFile(true)
    setFileStatus(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const encrypted = e.target?.result as string
          const decrypted = await decryptData(encrypted, filePassword)
          
          // Download decrypted file
          const fileName = selectedFile.name.replace(/\.encrypted$/, "")
          const blob = new Blob([decrypted], { type: "text/plain" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = fileName.includes(".") ? fileName : `${fileName}.decrypted`
          a.click()
          URL.revokeObjectURL(url)
          
          setFileStatus({ type: "success", message: "File decrypted and downloaded!" })
        } catch {
          setFileStatus({ type: "error", message: "Decryption failed. Check your password." })
        }
        setIsProcessingFile(false)
      }
      reader.readAsText(selectedFile)
    } catch (error) {
      console.error(error)
      setFileStatus({ type: "error", message: "File processing failed" })
      setIsProcessingFile(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setTextStatus({ type: "success", message: "Copied to clipboard!" })
    setTimeout(() => setTextStatus(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          File Encryption Tool
        </h1>
        <p className="text-muted-foreground">
          Encrypt and decrypt text and files using AES-256-GCM encryption
        </p>
      </div>

      <Tabs defaultValue="text" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="text">Text Encryption</TabsTrigger>
          <TabsTrigger value="file">File Encryption</TabsTrigger>
        </TabsList>

        {/* Text Encryption */}
        <TabsContent value="text" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Text Encryption / Decryption</CardTitle>
              <CardDescription>
                Securely encrypt or decrypt text messages using AES-256 encryption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Plain Text */}
                <div className="space-y-2">
                  <Label htmlFor="plainText">Plain Text</Label>
                  <Textarea
                    id="plainText"
                    placeholder="Enter text to encrypt..."
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    className="min-h-[150px] bg-input border-border font-mono text-sm"
                  />
                </div>

                {/* Encrypted Text */}
                <div className="space-y-2">
                  <Label htmlFor="encryptedText">Encrypted Text</Label>
                  <Textarea
                    id="encryptedText"
                    placeholder="Encrypted output will appear here..."
                    value={encryptedText}
                    onChange={(e) => setEncryptedText(e.target.value)}
                    className="min-h-[150px] bg-input border-border font-mono text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="textPassword">Encryption Password</Label>
                <div className="relative max-w-md">
                  <Input
                    id="textPassword"
                    type={showTextPassword ? "text" : "password"}
                    value={textPassword}
                    onChange={(e) => setTextPassword(e.target.value)}
                    placeholder="Enter encryption password"
                    className="bg-input border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTextPassword(!showTextPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTextPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Status */}
              {textStatus && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    textStatus.type === "success"
                      ? "bg-cyber-green/10 border border-cyber-green/20 text-cyber-green"
                      : "bg-cyber-red/10 border border-cyber-red/20 text-cyber-red"
                  }`}
                >
                  {textStatus.type === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{textStatus.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleEncryptText} disabled={isEncrypting || !plainText || !textPassword}>
                  <Lock className="h-4 w-4 mr-2" />
                  Encrypt
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecryptText}
                  disabled={isEncrypting || !encryptedText || !textPassword}
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Decrypt
                </Button>
                {encryptedText && (
                  <Button variant="outline" onClick={() => copyToClipboard(encryptedText)}>
                    Copy Encrypted
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Encryption */}
        <TabsContent value="file" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>File Encryption / Decryption</CardTitle>
              <CardDescription>
                Encrypt or decrypt files using AES-256 encryption (text files only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Select File</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".txt,.json,.xml,.html,.css,.js,.ts,.md,.encrypted"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Click to select a file or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports text-based files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="filePassword">Encryption Password</Label>
                <div className="relative max-w-md">
                  <Input
                    id="filePassword"
                    type={showFilePassword ? "text" : "password"}
                    value={filePassword}
                    onChange={(e) => setFilePassword(e.target.value)}
                    placeholder="Enter encryption password"
                    className="bg-input border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilePassword(!showFilePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showFilePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Status */}
              {fileStatus && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    fileStatus.type === "success"
                      ? "bg-cyber-green/10 border border-cyber-green/20 text-cyber-green"
                      : "bg-cyber-red/10 border border-cyber-red/20 text-cyber-red"
                  }`}
                >
                  {fileStatus.type === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{fileStatus.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleEncryptFile}
                  disabled={isProcessingFile || !selectedFile || !filePassword}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Encrypt & Download
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecryptFile}
                  disabled={isProcessingFile || !selectedFile || !filePassword}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Decrypt & Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
