"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, MessageCircle } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description?: string
  image?: string
  category?: string
}

interface ProductCardProps {
  product: Product
  onProductClick: () => void
  onInquiry: () => void
}

export function ProductCard({ product, onProductClick, onInquiry }: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={onProductClick}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            {product.category && <Badge variant="secondary">{product.category}</Badge>}
          </div>
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {product.description && <CardDescription className="text-sm">{product.description}</CardDescription>}
        </CardHeader>

        {product.image && (
          <div className="px-6 pb-4">
            <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
          </div>
        )}
      </div>

      <CardContent className="flex-1 flex flex-col justify-end pt-0">
        <div className="flex gap-2">
          <Button onClick={onProductClick} variant="outline" className="flex-1" size="sm">
            View Details
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onInquiry()
            }}
            className="flex-1"
            size="sm"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Inquire
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
