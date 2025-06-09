"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { InquiryModal } from "@/components/inquiry-modal"
import { useVisitor } from "@/contexts/visitor-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Define the Product interface matching MongoDB schema + an 'id' field for frontend use
interface Product {
  _id: string; // From MongoDB
  id: string;  // Mapped from _id for frontend consistency
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string; // Ensure ProductCard uses this or 'image'
  features: string[];
  image?: string; // Keep if ProductCard specifically needs 'image'
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { visitor } = useVisitor()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true); // Ensure loading is true at the start
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const dataFromApi = await response.json();
        // Map _id to id and ensure imageUrl is used for image display
        const formattedProducts = dataFromApi.map((p: any) => ({
          ...p,
          id: p._id, // Map _id to id
          image: p.imageUrl, // Ensure ProductCard receives 'image' if it expects it
        }));
        setProducts(formattedProducts);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
      // Optionally, clear products or set to empty array on error
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  }

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.id}`)
  }

  const handleInquiry = (product: Product) => {
    if (!visitor) {
      toast({
        title: "Error",
        description: "Please register first to make inquiries.",
        variant: "destructive",
      })
      return
    }
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const submitInquiry = async (product: Product) => {
    try {
      const response = await fetch("/api/inquiry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorPhone: visitor?.phone, // Use visitor's phone number
          productId: product.id,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Thanks for your interest! We'll get back to you soon.",
        })
        setIsModalOpen(false)
      } else {
        throw new Error("Failed to submit inquiry")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Registration
        </Link>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Explore our latest innovations and express your interest</p>
          {visitor && <p className="text-sm text-green-600 mt-2">Welcome, {visitor.name}!</p>}
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
            <p className="text-gray-600">Please check back later for new products.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={() => handleProductClick(product)}
              onInquiry={() => handleInquiry(product)}
            />
          ))}
        </div>
      )}

      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSubmit={submitInquiry}
      />
    </div>
  )
}
