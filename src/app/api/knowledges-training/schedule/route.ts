import { NextResponse } from "next/server";
import {
  getProjectNamespaceId,
  saveKnowledgeInDatabase,
  textToVector,
  updateKnowledgeStatus,
  urlToVector,
} from "@/app/api/helpers";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const namespaceId = getProjectNamespaceId({ userId: body.user_id, projectId: body.project_id })

  if (body.mode === "text") {
    const { data } = await saveKnowledgeInDatabase({
      userId: body.user_id,
      projectId: body.project_id,
      content: body.text,
      type: "txt",
    });
    const knowledgeId = data?.id;

    if (knowledgeId) {
      await textToVector({
        text: body.text,
        userId: body.user_id,
        namespaceId,
        metadata: {
          knowledgeId
        }
      });

      await updateKnowledgeStatus(knowledgeId, "ready");
    }
  }

  if (body.mode === "url") {
    let knowledgeId;
    for (let [index, url] of Object.entries(body.urls)) {
      const { data } = await saveKnowledgeInDatabase({
        userId: body.user_id,
        projectId: body.project_id,
        content: url as string,
        type: "url",
      });

      knowledgeId = data?.id;

      await urlToVector({
        url: url as string,
        index: +index,
        userId: body.user_id,
        namespaceId,
        metadata: {
          knowledgeId
        }
      });
    }

    if (knowledgeId) {
      await updateKnowledgeStatus(knowledgeId, "ready");
    }
  }

  if (body.mode === "file") {
    let knowledgeId;
    for (let [index, file] of Object.entries(body.files)) {
      const { data } = await saveKnowledgeInDatabase({
        userId: body.user_id,
        projectId: body.project_id,
        content: file as string, // TODO: some work need to be done here
        type: "file", // TODO: specify the file type here (pdf,doc,etc...)
      });

      knowledgeId = data?.id;
    }

    if (knowledgeId) {
      await updateKnowledgeStatus(knowledgeId, "ready");
    }
  }

  return NextResponse.json({
    success: true
  }, { status: 200 });
}