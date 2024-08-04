import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      // User doesn't exist, so they're new
      await db.collection("users").doc(uid).set({
        createdAt: new Date(),
        // Add any other initial user data here
      });
      return NextResponse.json({ isNewUser: true });
    } else {
      // User already exists
      return NextResponse.json({ isNewUser: false });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
