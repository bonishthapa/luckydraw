"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Settings, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  const { userEmail, signOut } = useAuth()
  const router = useRouter()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {userEmail}</p>
            </div>
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Lucky Draw Card */}
            <Card
              className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push("/lucky-draw")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Lucky Draw</CardTitle>
                    <CardDescription>Manage draws and participants</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload participant data, configure draw settings, and conduct lucky draws with full-screen
                  presentation mode.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>• File Upload</span>
                  <span>• Draw Configuration</span>
                  <span>• Winner Tracking</span>
                </div>
                <Button className="w-full group-hover:bg-primary/90 transition-colors">Open Lucky Draw</Button>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card
              className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push("/settings")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <Settings className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Settings</CardTitle>
                    <CardDescription>Configure system preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage user accounts, system configurations, and customize the lucky draw experience.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>• User Management</span>
                  <span>• System Config</span>
                  <span>• Preferences</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-secondary/10 transition-colors bg-transparent"
                >
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-muted-foreground">Total Draws</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-xs text-muted-foreground">Participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-muted-foreground">Winners</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
