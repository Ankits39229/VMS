import { type NextRequest, NextResponse } from "next/server"

// Mock stats data - in a real app, this would come from your database
const productStats = {
  "1": { viewCount: 1247, inquiryCount: 89, uniqueVisitors: 1156 },
  "2": { viewCount: 892, inquiryCount: 67, uniqueVisitors: 823 },
  "3": { viewCount: 1156, inquiryCount: 78, uniqueVisitors: 1089 },
  "4": { viewCount: 2341, inquiryCount: 156, uniqueVisitors: 2198 },
  "5": { viewCount: 634, inquiryCount: 45, uniqueVisitors: 598 },
  "6": { viewCount: 789, inquiryCount: 52, uniqueVisitors: 734 },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const stats = productStats[productId as keyof typeof productStats]

    if (!stats) {
      return NextResponse.json({ error: "Product stats not found" }, { status: 404 })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching product stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
