import { NextResponse } from "next/server";
import { upstashVectorIndex } from "../../helpers";

export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json();
  const data = {
    id: body.document.id,
    data: body.document.data,
    metadata: body.document.metadata
  }

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