"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InquiryModal } from "@/components/inquiry-modal"
import { useVisitor } from "@/contexts/visitor-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Package, Eye, MessageCircle, Loader2, ChevronLeft, ChevronRight, Star } from "lucide-react"
import Image from "next/image"

interface ProductDetail {
  _id: string; // From API response
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  images: string[];
  imageUrl: string; // From API response
  specifications: { [key: string]: string };
  features: string[];
  price?: string; // Formatted string price for display
  originalPrice: number; // Numeric price from API for modal
  stock: number; // From API response
  rating?: number;
  reviewCount?: number;
}

interface ProductStats {
  viewCount: number
  inquiryCount: number
  uniqueVisitors: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { visitor } = useVisitor()
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchProductDetails(params.id as string)
      trackProductView(params.id as string)
    }
  }, [params.id])

  const fetchProductDetails = async (productId: string) => {
    try {
      // Fetch Product Data (Critical)
      const productResponse = await fetch(`/api/products/${productId}`);
      if (!productResponse.ok) {
        let errorData = { message: "Failed to fetch product data" };
        try {
          errorData = await productResponse.json();
        } catch (e) {
          // Ignore if response is not JSON
        }
        console.error(`Error fetching product data for ID ${productId}:`, productResponse.status, productResponse.statusText, errorData);
        throw new Error(errorData.message || "Failed to fetch product data");
      }
      const productData = await productResponse.json();
      setProduct(productData);

      // Fetch Product Stats (Non-Critical)
      try {
        const statsResponse = await fetch(`/api/products/${productId}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } else {
          let statsErrorData = { message: "Failed to fetch product stats" };
          try {
            statsErrorData = await statsResponse.json();
          } catch (e) {
            // Ignore if response is not JSON
          }
          console.warn(
            `Warning: Failed to fetch product stats for ID ${productId}:`,
            statsResponse.status,
            statsResponse.statusText,
            statsErrorData
          );
          setStats(null); // Proceed without stats or with default stats
        }
      } catch (statsError) {
        console.warn(`Warning: Error during stats fetch for ID ${productId}:`, statsError);
        setStats(null); // Proceed without stats
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Overall error in fetchProductDetails:", error);
      toast({
        title: "Error",
        description: errorMessage === "Failed to fetch product data" 
                       ? "Failed to load essential product information. Please try again."
                       : "Failed to load product details. Please try again.",
        variant: "destructive",
      });
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const trackProductView = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId: visitor?.id,
        }),
      })
    } catch (error) {
      console.error("Failed to track product view:", error)
    }
  }

  const handleInquiry = () => {
    if (!visitor) {
      toast({
        title: "Error",
        description: "Please register first to make inquiries.",
        variant: "destructive",
      })
      return
    }
    setIsModalOpen(true)
  }

  const submitInquiry = async () => { // No product argument
    if (!product) { // Add a guard if product is null
      toast({
        title: "Error",
        description: "Product details not available for inquiry.",
        variant: "destructive",
      });
      return;
    }
    console.log("[Submit Inquiry] Attempting to submit with:", { visitorPhone: visitor?.phone, productId: product.id });
    try {
      const response = await fetch("/api/inquiry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorPhone: visitor?.phone, // Send phone number
          productId: product.id,      // Use product from state
        }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Thanks for your interest! We'll get back to you soon.",
        })
        setIsModalOpen(false)
        // Refresh stats to show updated inquiry count
        if (params.id) {
          const statsResponse = await fetch(`/api/products/${params.id}/stats`)
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
          }
        }
      } else {
        let errorData = { message: "Failed to submit inquiry" };
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore if response is not JSON
        }
        console.error("[Submit Inquiry] API Error:", response.status, response.statusText, errorData);
        throw new Error(errorData.message || "Failed to submit inquiry");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/products")}>Back to Products</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/products")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.images[currentImageIndex] || "/placeholder.svg?height=500&width=500"}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
              />

              {product.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg?height=80&width=80"}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  {product.reviewCount && (
                    <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
                  )}
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            {product.price && <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>}
          </div>

          {/* Stats */}
          {stats && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Product Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.viewCount}</p>
                    <p className="text-xs text-gray-500">Total Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.inquiryCount}</p>
                    <p className="text-xs text-gray-500">Inquiries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.uniqueVisitors}</p>
                    <p className="text-xs text-gray-500">Unique Visitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Long Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">About This Product</h3>
              <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>
            </CardContent>
          </Card>

          {/* Features */}
          {product.features.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Specifications */}
          {Object.keys(product.specifications).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inquiry Button */}
          <div className="sticky bottom-4">
            <Button onClick={handleInquiry} className="w-full" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Express Interest
            </Button>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product ? {
          _id: product._id,
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.originalPrice, // Use numeric originalPrice for the modal
          stock: product.stock,
          imageUrl: product.imageUrl,
          features: product.features,
          image: product.imageUrl, // Optional 'image' field for Product type
        } : null}
        onSubmit={() => submitInquiry()}
      />
    </div>
  )
}
