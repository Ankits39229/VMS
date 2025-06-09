import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb"; // Adjusted path

interface Visitor {
  name: string;
  email: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: any; // MongoDB ObjectId
}

export async function POST(request: NextRequest) {
  try {
    const body: Visitor = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const visitorsCollection = db.collection<Visitor>("visitors");

    // Check if visitor exists by email or phone
    let visitor = await visitorsCollection.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (visitor) {
      // Visitor exists, return their data
      return NextResponse.json(visitor);
    } else {
      // Visitor does not exist, create a new one
      const newVisitor: Visitor = {
        name,
        email,
        phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await visitorsCollection.insertOne(newVisitor);
      
      // Fetch the inserted document to return it with its _id
      visitor = await visitorsCollection.findOne({ _id: result.insertedId });
      return NextResponse.json(visitor, { status: 201 }); // 201 Created
    }
  } catch (error) {
    console.error("Error in /api/visitor/check-or-create:", error);
    // Check if error is a known type, otherwise provide a generic message
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

