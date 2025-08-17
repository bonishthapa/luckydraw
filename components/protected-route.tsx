"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="p-8 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-4 pt-0">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-medium">Loading...</h3>
              <p className="text-sm text-muted-foreground">Checking authentication</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
