import { NextResponse } from "next/server";
import {
  deleteVectors,
  docsToVector,
  getIsYoutubeUrl,
  getProjectNamespaceId,
  loaders,
  queryVector,
  textToVector,
  updateKnowledgeStatus,
  urlToVector,
} from "../helpers";
import { supabaseAdmin } from "@/helpers/supabase";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    switch (body.type) {
      case 'INSERT': {
        const record: any = body.record;
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
          if (getIsYoutubeUrl(record.content)) {
            const transcript = await loaders.youtube(record.content);
            await textToVector({
              text: transcript,
              userId: record.user_id,
              namespaceId,
              metadata: { knowledgeId }
            });
          } else {
            await urlToVector({
              url: record.content,
              userId: record.user_id,
              namespaceId,
              metadata: { knowledgeId }
            });
          }
        }

        if (record.mode === "file") {
          console.log("received file record", record);
          const { data: blob } = await supabase.storage.from("files").download(record.file.path)
          if (!blob) {
            return NextResponse.json({ message: "Blob cannot be empty", record }, { status: 400 })
          }
          const docs = await loaders[record.file.type](blob, record.file.path);
          console.log("docs 1", docs[0]);
          await docsToVector({
            docs,
            userId: record.user_id,
            namespaceId,
            metadata: { knowledgeId }
          })
          await supabase.storage.from("files").remove([record.file.path])
        }

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
    console.log(error)
    switch (body.type) {
      case "INSERT":
        supabase.storage.from("files").remove([body.record.file.path]);
        supabase.from("knowledges").update({ status: "error" }).eq("id", body.record.id)
        break;
    }

    return NextResponse.json({ message: "Knowledges webhook error", error, body }, { status: 500 })
  }
}