import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "../../../../lib/mongodb"; // Adjusted path

// Interface for the product structure in MongoDB
interface ProductFromDB {
  _id: ObjectId;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  features: string[];
}

// Interface for the product detail structure expected by the frontend
interface ProductDetail {
  _id: string; // Original MongoDB ID as string
  id: string; // Usually same as _id for frontend use
  name: string;
  description: string;
  longDescription: string;
  category: string;
  images: string[];
  imageUrl: string; // Original image URL
  specifications: { [key: string]: string };
  features: string[];
  price: string; // Formatted price string for display
  originalPrice: number; // Price as a number for modal
  stock: number;
  rating?: number;
  reviewCount?: number;
}

const productDetails = {
  "1": {
    id: "1",
    name: "Smart Home Hub",
    description: "Control all your smart devices from one central hub with voice commands and mobile app integration.",
    longDescription:
      "Transform your home into a smart ecosystem with our advanced Smart Home Hub. This cutting-edge device serves as the central command center for all your connected devices, offering seamless integration with over 1000+ smart home products. With built-in AI assistant, voice control capabilities, and advanced security features, you can manage lighting, temperature, security systems, and entertainment devices from anywhere in the world. The hub features a sleek design that complements any home decor while providing enterprise-grade security to protect your privacy.",
    category: "Electronics",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    specifications: {
      Connectivity: "Wi-Fi 6, Bluetooth 5.2, Zigbee 3.0",
      Processor: "ARM Cortex-A78 Quad-core",
      Memory: "4GB RAM, 32GB Storage",
      Dimensions: "120 x 120 x 45mm",
      Power: "12V DC Adapter",
      "Operating Temperature": "-10°C to 50°C",
      Warranty: "2 Years",
    },
    features: [
      "Voice control with built-in AI assistant",
      "Compatible with 1000+ smart devices",
      "Advanced security encryption",
      "Mobile app for remote control",
      "Automatic device discovery",
      "Energy usage monitoring",
      "Custom automation scenarios",
      "Regular firmware updates",
    ],
    price: "$299.99",
    rating: 4.8,
    reviewCount: 1247,
  },
  "2": {
    id: "2",
    name: "Wireless Earbuds Pro",
    description: "Premium sound quality with active noise cancellation and 24-hour battery life.",
    longDescription:
      "Experience audio like never before with our Wireless Earbuds Pro. Engineered with premium drivers and advanced noise cancellation technology, these earbuds deliver crystal-clear sound quality whether you're listening to music, taking calls, or enjoying podcasts. The ergonomic design ensures comfortable wear for extended periods, while the IPX7 water resistance makes them perfect for workouts and outdoor activities. With 24-hour total battery life and fast charging capabilities, you'll never be without your music.",
    category: "Audio",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    specifications: {
      "Driver Size": "12mm Dynamic Drivers",
      "Frequency Response": "20Hz - 20kHz",
      "Battery Life": "8h + 16h (case)",
      Charging: "USB-C, Wireless Charging",
      "Water Resistance": "IPX7",
      Bluetooth: "5.3 with aptX HD",
      Weight: "5.2g per earbud",
    },
    features: [
      "Active noise cancellation (ANC)",
      "Transparency mode",
      "Touch controls",
      "Voice assistant integration",
      "Fast charging (15min = 3h playback)",
      "Comfortable ergonomic fit",
      "Premium sound quality",
      "Multipoint connection",
    ],
    price: "$199.99",
    rating: 4.6,
    reviewCount: 892,
  },
  "3": {
    id: "3",
    name: "Fitness Tracker Elite",
    description: "Advanced health monitoring with heart rate, sleep tracking, and GPS functionality.",
    longDescription:
      "Take control of your health and fitness journey with the Fitness Tracker Elite. This comprehensive health monitoring device tracks over 100 different activities and provides detailed insights into your daily wellness metrics. From advanced sleep analysis to stress monitoring, this tracker helps you understand your body better and make informed decisions about your health. The built-in GPS ensures accurate tracking for outdoor activities, while the 7-day battery life means you can focus on your goals without worrying about charging.",
    category: "Wearables",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    specifications: {
      Display: '1.4" AMOLED Color Display',
      "Battery Life": "Up to 7 days",
      "Water Resistance": "5ATM + IP68",
      Sensors: "Heart Rate, SpO2, GPS, Accelerometer",
      Connectivity: "Bluetooth 5.0, Wi-Fi",
      Compatibility: "iOS 12+, Android 7+",
      Weight: "32g",
    },
    features: [
      "24/7 heart rate monitoring",
      "Blood oxygen (SpO2) tracking",
      "Advanced sleep analysis",
      "Built-in GPS",
      "100+ workout modes",
      "Stress monitoring",
      "Menstrual cycle tracking",
      "Smart notifications",
    ],
    price: "$249.99",
    rating: 4.7,
    reviewCount: 1156,
  },
  "4": {
    id: "4",
    name: "Smart Watch Series X",
    description: "Next-generation smartwatch with health features, payments, and cellular connectivity.",
    longDescription:
      "The Smart Watch Series X represents the pinnacle of wearable technology, combining advanced health monitoring, seamless connectivity, and elegant design. With its always-on display, comprehensive health suite, and independent cellular connectivity, this smartwatch keeps you connected and informed throughout your day. Whether you're tracking workouts, managing notifications, or making contactless payments, the Series X delivers a premium experience that adapts to your lifestyle.",
    category: "Wearables",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    specifications: {
      Display: '1.9" Always-On Retina Display',
      Processor: "S8 SiP Dual-core",
      Storage: "32GB",
      Connectivity: "4G LTE, Wi-Fi, Bluetooth 5.3",
      Battery: "Up to 18 hours",
      "Water Resistance": "50m Water Resistant",
      Materials: "Aluminum, Stainless Steel, Titanium",
    },
    features: [
      "ECG and blood oxygen monitoring",
      "Cellular connectivity",
      "Contactless payments",
      "Always-on display",
      "Fall detection",
      "Emergency SOS",
      "Siri integration",
      "Third-party app support",
    ],
    price: "$399.99",
    rating: 4.9,
    reviewCount: 2341,
  },
  "5": {
    id: "5",
    name: "Portable Charger Max",
    description: "High-capacity 20,000mAh power bank with fast charging for all your devices.",
    longDescription:
      "Never run out of power again with the Portable Charger Max. This high-capacity power bank features 20,000mAh of power storage, capable of charging most smartphones up to 5 times on a single charge. With multiple charging ports and fast charging technology, you can power multiple devices simultaneously. The intelligent power management system ensures safe and efficient charging, while the compact design makes it perfect for travel, work, or emergency situations.",
    category: "Accessories",
    images: ["/placeholder.svg?height=500&width=500", "/placeholder.svg?height=500&width=500"],
    specifications: {
      Capacity: "20,000mAh / 74Wh",
      Input: "USB-C PD 18W",
      Output: "USB-A QC 3.0, USB-C PD 20W",
      "Charging Time": "6-7 hours (full charge)",
      Dimensions: "158 x 74 x 19mm",
      Weight: "420g",
      Safety: "Overcharge, Overcurrent Protection",
    },
    features: [
      "20,000mAh high capacity",
      "Fast charging technology",
      "Multiple device charging",
      "LED power indicator",
      "Compact and portable design",
      "Universal compatibility",
      "Safety protection systems",
      "Premium build quality",
    ],
    price: "$79.99",
    rating: 4.5,
    reviewCount: 634,
  },
  "6": {
    id: "6",
    name: "Bluetooth Speaker Pro",
    description: "Premium portable speaker with 360° sound, waterproof design, and 12-hour battery.",
    longDescription:
      "Immerse yourself in rich, room-filling sound with the Bluetooth Speaker Pro. Featuring 360-degree audio technology and premium drivers, this speaker delivers exceptional sound quality that fills any space. The rugged, waterproof design makes it perfect for outdoor adventures, pool parties, or beach trips. With 12-hour battery life and wireless connectivity, you can enjoy your favorite music anywhere without compromise.",
    category: "Audio",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    specifications: {
      Drivers: "Dual 45mm Full-range + Passive Radiator",
      "Power Output": "20W RMS",
      "Frequency Response": "65Hz - 20kHz",
      Battery: "12 hours playback",
      Connectivity: "Bluetooth 5.0, AUX, USB-C",
      "Water Rating": "IPX7 Waterproof",
      Dimensions: "210 x 75 x 75mm",
    },
    features: [
      "360-degree surround sound",
      "IPX7 waterproof rating",
      "12-hour battery life",
      "Wireless stereo pairing",
      "Built-in microphone",
      "Voice assistant support",
      "Rugged outdoor design",
      "Fast Bluetooth pairing",
    ],
    price: "$149.99",
    rating: 4.4,
    reviewCount: 789,
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: productId } = params;

  if (!productId || !ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection<ProductFromDB>("products");

    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Transform the product from DB to the ProductDetail structure
    const productDetail: ProductDetail = {
      _id: product._id.toHexString(),
      id: product._id.toHexString(),
      name: product.name,
      description: product.description,
      longDescription: product.description, // Use short description or provide a default
      category: product.category,
      images: [product.imageUrl || "/placeholder.svg?height=500&width=500"],
      imageUrl: product.imageUrl || "/placeholder.svg?height=500&width=500",
      specifications: { // Provide some default specifications or leave empty
        Material: "High-quality materials",
        Origin: "Designed with care",
      },
      features: product.features || [],
      price: `$${product.price.toFixed(2)}`,
      originalPrice: product.price, // Keep original numeric price
      stock: product.stock || 0, // Ensure stock is present, default to 0 if not
      rating: 4.5, // Placeholder rating
      reviewCount: 0, // Placeholder review count
    };

    return NextResponse.json(productDetail);

  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}
