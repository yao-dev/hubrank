import { NextResponse } from "next/server";
import { saveKnowledgeInDatabase, updateKnowledgeStatus } from "@/app/api/helpers";

export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();

  if (body.mode === "text") {
    const { data } = await saveKnowledgeInDatabase({
      userId: body.user_id,
      projectId: body.project_id,
      content: body.text,
      type: "txt",
    });
    const knowledgeId = data?.id;

    if (!knowledgeId) {
      await updateKnowledgeStatus(knowledgeId, "error");
    }
  }

  if (body.mode === "url") {
    let knowledgeId;
    for (let [, url] of Object.entries(body.urls.slice(0, 100))) {
      const { data } = await saveKnowledgeInDatabase({
        userId: body.user_id,
        projectId: body.project_id,
        content: url as string,
        type: "url",
      });

      knowledgeId = data?.id;
    }

    if (!knowledgeId) {
      await updateKnowledgeStatus(knowledgeId, "error");
    }
  }

  if (body.mode === "file") {
    let knowledgeId;
    for (let [, file] of Object.entries(body.files)) {
      const { data } = await saveKnowledgeInDatabase({
        userId: body.user_id,
        projectId: body.project_id,
        content: file as string, // TODO: some work need to be done here
        type: "file", // TODO: specify the file type here (pdf,doc,etc...)
      });

      knowledgeId = data?.id;
    }

    if (!knowledgeId) {
      await updateKnowledgeStatus(knowledgeId, "error");
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}