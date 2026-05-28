"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PhishingDetectorContent } from "@/components/security/phishing-detector"

function PhishingDetectorPageContent() {
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
      <PhishingDetectorContent />
    </DashboardLayout>
  )
}

export default function PhishingDetectorPage() {
  return (
    <AuthProvider>
      <PhishingDetectorPageContent />
    </AuthProvider>
  )
}
