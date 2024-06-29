import { NextResponse } from "next/server";
import { urlToVector } from "../../helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await urlToVector({
      url: body.url,
      index: body.index,
      userId: body.userId,
      namespaceId: body.namespaceId,
    });

    console.log(`url to vector done (${body.index}): ${body.url}`)

    return NextResponse.json({ message: "Url to vector executed" }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Url to vector error" }, { status: 500 })
  }
}