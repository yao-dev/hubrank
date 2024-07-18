import { NextResponse } from "next/server";
import { getProjectNamespaceId, queryVector } from "../helpers";

export const maxDuration = 30;

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    console.log("body", body)
    const namespaceId = getProjectNamespaceId({ userId: body.user_id, projectId: body.project_id })
    console.log("namespaceId", namespaceId)
    const vectors = await queryVector({
      namespaceId,
      filter: `knowledgeId = ${body.knowledge_id}`
    });

    if (vectors.length) {
      const vectorIds: any = vectors.map((item) => item.id);
      console.log("vectors", vectors)
      console.log(vectors.length)
      // await deleteVectors(vectorIds)
    }

    // await supabase.from("knowledges").delete().eq("id", body.knowledge_id);

    return NextResponse.json({ message: "Delete knowledge success" }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Delete knowledge error" }, { status: 500 })
  }
}