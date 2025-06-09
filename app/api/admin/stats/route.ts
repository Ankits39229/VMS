import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Define interfaces for clarity, though they might exist elsewhere
interface Product {
  _id: ObjectId;
  name: string;
  // other product fields...
}

interface Visitor {
  _id: ObjectId; // Assuming visitors have an _id
  name: string;
  phone: string;
  // other visitor fields...
}

interface Inquiry {
  _id: ObjectId;
  productId: ObjectId;
  visitorPhone: string;
  createdAt: Date;
  // other inquiry fields...
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const inquiriesCollection = db.collection<Inquiry>("inquiries");
    const visitorsCollection = db.collection<Visitor>("visitors");
    const productsCollection = db.collection<Product>("products");

    // 1. Total Inquiries
    const totalInquiries = await inquiriesCollection.countDocuments();

    // 2. Total Visitors (unique visitors who made inquiries)
    const distinctVisitorPhones = await inquiriesCollection.distinct("visitorPhone");
    const totalVisitors = distinctVisitorPhones.length;

    // 3. Product Inquiries (name and count)
    const productInquiriesAgg = await inquiriesCollection.aggregate([
      { $group: { _id: "$productId", count: { $sum: 1 } } },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }, // Assuming one product per productId
      { $project: { _id: 0, productName: "$productDetails.name", count: 1 } },
      { $sort: { count: -1 } }
    ]).toArray();

    // 4. Recent Inquiries (visitorName, productName, timestamp)
    // Limiting to 5 recent inquiries for this example
    const recentInquiriesAgg = await inquiriesCollection.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      { $lookup: {
          from: "visitors", // Assuming 'visitors' collection
          localField: "visitorPhone",
          foreignField: "phone", // Assuming visitor's phone is unique and used for lookup
          as: "visitorInfo"
        }
      },
      { $unwind: "$visitorInfo" },
      {
        $project: {
          _id: 0,
          visitorName: "$visitorInfo.name",
          productName: "$productInfo.name",
          timestamp: "$createdAt"
        }
      }
    ]).toArray();

    const stats = {
      totalInquiries,
      totalVisitors,
      productInquiries: productInquiriesAgg,
      recentInquiries: recentInquiriesAgg.map(inq => ({...inq, timestamp: new Date(inq.timestamp).toISOString()})),
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

