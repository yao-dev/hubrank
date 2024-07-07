import { NextResponse } from "next/server";
import { getProjectKnowledges } from "../helpers";

export async function POST(request: Request) {
  try {
    const knowledges = await getProjectKnowledges({
      userId: "01ef70b3-c8c2-4efd-a92a-976efca81562",
      projectId: 68,
      topK: 20,
      query: "bannerbear vs abyssale",
      minScore: 0.8
    });

    return NextResponse.json(knowledges, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "get-documents error" }, { status: 500 })
  }
}