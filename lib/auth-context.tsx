"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const email = localStorage.getItem("userEmail")

      if (authStatus === "true" && email) {
        setIsAuthenticated(true)
        setUserEmail(email)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation - in real app, this would be an API call
    if (email && password) {
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", email)
      setIsAuthenticated(true)
      setUserEmail(email)
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  const signOut = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setUserEmail(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
