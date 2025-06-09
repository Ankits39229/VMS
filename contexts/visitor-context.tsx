"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Visitor {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

interface VisitorContextType {
  visitor: Visitor | null
  setVisitor: (visitor: Visitor | null) => void
  clearVisitor: () => void
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined)

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitorState] = useState<Visitor | null>(null)

  useEffect(() => {
    // Load visitor from localStorage on mount
    const savedVisitor = localStorage.getItem("visitor")
    if (savedVisitor) {
      try {
        setVisitorState(JSON.parse(savedVisitor))
      } catch (error) {
        console.error("Failed to parse saved visitor:", error)
        localStorage.removeItem("visitor")
      }
    }
  }, [])

  const setVisitor = (newVisitor: Visitor | null) => {
    setVisitorState(newVisitor)
    if (newVisitor) {
      localStorage.setItem("visitor", JSON.stringify(newVisitor))
    } else {
      localStorage.removeItem("visitor")
    }
  }

  const clearVisitor = () => {
    setVisitorState(null)
    localStorage.removeItem("visitor")
  }

  return <VisitorContext.Provider value={{ visitor, setVisitor, clearVisitor }}>{children}</VisitorContext.Provider>
}

export function useVisitor() {
  const context = useContext(VisitorContext)
  if (context === undefined) {
    throw new Error("useVisitor must be used within a VisitorProvider")
  }
  return context
}
