"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useVisitor } from "@/contexts/visitor-context"
import { Package, User, Mail, Phone, Loader2 } from "lucide-react"

interface Product {
  _id: string; // From MongoDB, always present here
  id: string;  // Mapped from _id or primary identifier
  name: string;
  description: string; // Assuming description is always present from DB
  category: string;    // Assuming category is always present from DB
  price: number;       // Assuming price is always present from DB
  stock: number;       // Assuming stock is always present from DB
  imageUrl: string;    // Assuming imageUrl is always present from DB
  features: string[];  // Assuming features are always present from DB
  image?: string; // This was in app/products/page.tsx, keep if ProductCard uses it
}

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSubmit: (product: Product) => Promise<void>
}

export function InquiryModal({ isOpen, onClose, product, onSubmit }: InquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { visitor } = useVisitor()

  if (!product) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(product)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Inquiry
          </DialogTitle>
          <DialogDescription>Confirm your interest in this product</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{product.name}</h3>
              {product.category && <Badge variant="secondary">{product.category}</Badge>}
            </div>
            {product.description && <p className="text-sm text-gray-600">{product.description}</p>}
          </div>

          {visitor && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Details
              </h4>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {visitor.name}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {visitor.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {visitor.phone}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
