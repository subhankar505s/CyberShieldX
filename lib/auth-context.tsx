"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simulated user storage (in production, use a real database)
const STORAGE_KEY = "cybershield_users"
const SESSION_KEY = "cybershield_session"

function getStoredUsers(): Record<string, { password: string; name: string; createdAt: string }> {
  if (typeof window === "undefined") return {}
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

function saveUsers(users: Record<string, { password: string; name: string; createdAt: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

// Simple hash function for demo (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "cybershield_salt")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      const userData = JSON.parse(session)
      setUser({
        ...userData,
        createdAt: new Date(userData.createdAt),
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getStoredUsers()
    const hashedPassword = await hashPassword(password)

    if (users[email] && users[email].password === hashedPassword) {
      const userData: User = {
        id: email,
        email,
        name: users[email].name,
        createdAt: new Date(users[email].createdAt),
      }
      setUser(userData)
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
      return true
    }
    return false
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = getStoredUsers()

    if (users[email]) {
      return false // User already exists
    }

    const hashedPassword = await hashPassword(password)
    users[email] = {
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString(),
    }
    saveUsers(users)

    const userData: User = {
      id: email,
      email,
      name,
      createdAt: new Date(),
    }
    setUser(userData)
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
