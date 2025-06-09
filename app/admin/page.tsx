"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Download, Users, Package, TrendingUp, Loader2 } from "lucide-react"

interface AdminStats {
  totalInquiries: number
  totalVisitors: number
  productInquiries: { productName: string; count: number }[]
  recentInquiries: { visitorName: string; productName: string; timestamp: string }[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Simulate API call to /api/admin/stats
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error("Failed to fetch stats")
      }
    } catch (error) {
      // Mock data for demo
      setStats({
        totalInquiries: 47,
        totalVisitors: 32,
        productInquiries: [
          { productName: "Smart Home Hub", count: 12 },
          { productName: "Wireless Earbuds Pro", count: 8 },
          { productName: "Fitness Tracker Elite", count: 7 },
          { productName: "Smart Watch Series X", count: 6 },
          { productName: "Portable Charger Max", count: 5 },
          { productName: "Bluetooth Speaker Pro", count: 9 },
        ],
        recentInquiries: [
          { visitorName: "John Doe", productName: "Smart Home Hub", timestamp: "2024-01-15T10:30:00Z" },
          { visitorName: "Jane Smith", productName: "Wireless Earbuds Pro", timestamp: "2024-01-15T09:45:00Z" },
          { visitorName: "Mike Johnson", productName: "Fitness Tracker Elite", timestamp: "2024-01-15T09:15:00Z" },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    setExporting(true)
    try {
      const response = await fetch("/api/admin/export", {
        method: "GET",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success!",
          description: "Data exported successfully.",
        })
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor visitor inquiries and product interest</p>
          </div>
          <Button onClick={exportData} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                <p className="text-xs text-muted-foreground">Product interest expressions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVisitors}</div>
                <p className="text-xs text-muted-foreground">Registered visitors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Inquiries/Visitor</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.totalInquiries / stats.totalVisitors).toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Interest per visitor</p>
              </CardContent>
            </Card>
          </div>

          {/* Product Inquiries Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Interest Breakdown
                </CardTitle>
                <CardDescription>Number of inquiries per product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.productInquiries.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(item.count / Math.max(...stats.productInquiries.map((p) => p.count))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>Latest visitor product interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentInquiries.map((inquiry, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div>
                        <p className="font-medium">{inquiry.visitorName}</p>
                        <p className="text-sm text-gray-600">{inquiry.productName}</p>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(inquiry.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
