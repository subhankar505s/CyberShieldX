"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LogAnalyzerContent } from "@/components/security/log-analyzer"

function LogAnalyzerPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <LogAnalyzerContent />
    </DashboardLayout>
  )
}

export default function LogAnalyzerPage() {
  return (
    <AuthProvider>
      <LogAnalyzerPageContent />
    </AuthProvider>
  )
}
