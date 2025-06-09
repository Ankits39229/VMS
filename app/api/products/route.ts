import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb"; // Adjusted path based on typical Next.js structure

interface Product {
  _id?: any; // MongoDB ObjectId
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  features: string[];
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection<Product>("products");

    const products = await productsCollection.find({}).toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

