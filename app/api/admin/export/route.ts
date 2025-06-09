import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Define expected structures for clarity
interface ExportInquiryData {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  productName: string;
  productCategory: string; // Assuming products have a 'category' field
  inquiryDate: string;
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const inquiriesCollection = db.collection("inquiries");

    const aggregationPipeline = [
      {
        $lookup: {
          from: "visitors",
          localField: "visitorPhone",
          foreignField: "phone",
          as: "visitorDetails"
        }
      },
      { $unwind: { path: "$visitorDetails", preserveNullAndEmptyArrays: true } }, // Keep inquiry even if visitor not found
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }, // Keep inquiry even if product not found
      {
        $project: {
          _id: 1, // Inquiry ID
          visitorName: "$visitorDetails.name",
          visitorEmail: "$visitorDetails.email",
          visitorPhone: "$visitorPhone", // from the inquiry itself
          productName: "$productDetails.name",
          productCategory: "$productDetails.category", // Assuming 'category' field exists
          inquiryDate: "$createdAt"
        }
      },
      { $sort: { inquiryDate: -1 } } // Optional: sort by date
    ];

    const fetchedInquiries = await inquiriesCollection.aggregate(aggregationPipeline).toArray();

    const formattedInquiries: ExportInquiryData[] = fetchedInquiries.map((doc: any) => ({
      id: doc._id.toHexString(),
      visitorName: doc.visitorName || 'N/A',
      visitorEmail: doc.visitorEmail || 'N/A',
      visitorPhone: doc.visitorPhone || 'N/A',
      productName: doc.productName || 'N/A',
      productCategory: doc.productCategory || 'N/A', // Handle if category is missing
      inquiryDate: doc.inquiryDate ? new Date(doc.inquiryDate).toISOString() : 'N/A',
    }));

    // Convert to CSV format
    const headers = ["ID", "Visitor Name", "Email", "Phone", "Product", "Category", "Date"];
    const csvRows = formattedInquiries.map((inquiry) =>
      [
        `"${inquiry.id}"`, // Enclose in quotes to handle potential commas in data
        `"${inquiry.visitorName}"`, 
        `"${inquiry.visitorEmail}"`,
        `"${inquiry.visitorPhone}"`,
        `"${inquiry.productName}"`,
        `"${inquiry.productCategory}"`,
        `"${new Date(inquiry.inquiryDate).toLocaleDateString()}"` // Format date as needed
      ].join(",")
    );

    const csvContent = [
      headers.join(","),
      ...csvRows
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error("Error exporting data:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

