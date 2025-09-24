import connectMongoDB from "@/lib/mongodb";
import LiquorPurchase from "@/models/LiquorPurchase";
import { NextResponse } from "next/server";

// POST method (புதிய purchase-ஐ சேமிக்க)
export async function POST(request: Request) {
    try {
        const { invoiceDetails, items } = await request.json();
        await connectMongoDB();
        await LiquorPurchase.create({ ...invoiceDetails, items });
        return NextResponse.json({ message: "Liquor Purchase Created" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "An error occurred", error }, { status: 500 });
    }
}

// GET method (எல்லா purchase-களையும் எடுக்க)
export async function GET() {
    try {
        await connectMongoDB();
        const purchases = await LiquorPurchase.find().sort({ date: -1 }); // சமீபத்தியது முதலில்
        return NextResponse.json(purchases);
    } catch (error) {
        return NextResponse.json({ message: "An error occurred", error }, { status: 500 });
    }
}