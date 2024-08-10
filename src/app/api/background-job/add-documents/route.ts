import { NextResponse } from "next/server";
import { upstashVectorIndex } from "../../helpers";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const data: any = {
    id: body.document.id,
    metadata: body.document.metadata
  }

  if (body.document.data) data.data = body.document.data
  if (body.document.vector) data.vector = body.document.vector

  try {
    const namespace = upstashVectorIndex.namespace(body.namespaceId);

    await namespace.upsert(data)

    console.log(`Document to vector done (${body.index})`, data.metadata)

    return NextResponse.json({ message: "Add document in background success" }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Add document in background error", data }, { status: 500 })
  }
}