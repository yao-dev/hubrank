import { NextResponse } from "next/server";
import { deleteVectors, getProjectNamespaceId, queryVector, textToVector, updateKnowledgeStatus, urlToVector } from "../helpers";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 30;

// type InsertPayload = {
//   type: 'INSERT'
//   table: string
//   schema: string
//   record: TableRecord<T>
//   old_record: null
// }
// type UpdatePayload = {
//   type: 'UPDATE'
//   table: string
//   schema: string
//   record: TableRecord<T>
//   old_record: TableRecord<T>
// }
// type DeletePayload = {
//   type: 'DELETE'
//   table: string
//   schema: string
//   record: null
//   old_record: TableRecord<T>
// }

export async function POST(request: Request) {
  try {
    const body = await request.json();

    switch (body.type) {
      case 'INSERT': {
        const record = body.record;
        const knowledgeId = record.id;
        const namespaceId = getProjectNamespaceId({ userId: record.user_id, projectId: record.project_id })

        if (record.mode === "text") {
          await textToVector({
            text: record.content,
            userId: record.user_id,
            namespaceId,
            metadata: { knowledgeId }
          });
        }

        if (record.mode === "url") {
          await urlToVector({
            url: record.content,
            userId: record.user_id,
            namespaceId,
            metadata: { knowledgeId }
          });
        }

        // TODO: handle files
        if (record.mode === "file") { }

        await updateKnowledgeStatus(knowledgeId, "ready");
      }
      case 'DELETE': {
        const oldRecord = body.old_record;
        const knowledgeId = oldRecord.id;
        const namespaceId = getProjectNamespaceId({ userId: oldRecord.user_id, projectId: oldRecord.project_id })

        const vectors = await queryVector({
          namespaceId,
          filter: `knowledgeId = ${knowledgeId}`
        });

        if (vectors.length) {
          const vectorIds: any = vectors.map((item) => item.id);
          console.log("vectors", vectors)
          console.log(vectors.length)
          await deleteVectors(vectorIds)
        } else {
          console.log("There is no vectors to delete for this knowledge item")
        }

        await supabase.from("knowledges").delete().eq("id", knowledgeId);
      }
    }

    return NextResponse.json({ message: "Knowledges webhook success", body }, { status: 200 })
  } catch (error) {
    const body = await request.json();
    return NextResponse.json({ message: "Knowledges webhook error", error, body }, { status: 500 })
  }
}

// TODO: to be deleted
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
      await deleteVectors(vectorIds)
    } else {
      console.log("There is no vectors to delete for this knowledge item")
    }

    await supabase.from("knowledges").delete().eq("id", body.knowledge_id);

    return NextResponse.json({ message: "Knowledge deleted with success" }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Delete knowledge error" }, { status: 500 })
  }
}