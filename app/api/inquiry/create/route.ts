import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "../../../../lib/mongodb"; // Adjusted path

interface Inquiry {
  visitorPhone: string;
  productId: ObjectId;
  // message?: string; // Optional: if you plan to add a message field later
  status: 'pending' | 'contacted' | 'resolved'; // Example statuses
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorPhone, productId, message } = body; // message is optional

    // Validate required fields
    if (!visitorPhone || !productId) {
      return NextResponse.json(
        { error: "Visitor phone number and Product ID are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid Product ID format" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const inquiriesCollection = db.collection<Inquiry>("inquiries");

    const now = new Date();
    const newInquiry: Omit<Inquiry, '_id'> = {
      visitorPhone,
      productId: new ObjectId(productId),
      // ...(message && { message }), // Include message if provided
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const result = await inquiriesCollection.insertOne(newInquiry as Inquiry);

    const createdInquiry = {
      inquiryId: result.insertedId.toHexString(),
      status: "created", // Or use newInquiry.status
      timestamp: now.toISOString(),
    };

    console.log("New inquiry created in MongoDB:", createdInquiry);

    return NextResponse.json(createdInquiry, { status: 201 });

  } catch (error) {
    console.error("Error creating inquiry in MongoDB:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

