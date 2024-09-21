import supabase from "@/helpers/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const headersList = headers()
    const userId = headersList.get('user_id');
    const projectId = headersList.get('project_id');

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User id is mssing in headers" }, { status: 400 });
    }
    if (!projectId) {
      return NextResponse.json({ error: "Project id is missing in headers" }, { status: 400 });
    }

    console.log(file)
    const fileType = file.name.split(".").slice(-1)[0];
    console.log("fileType", fileType)
    const fileName = `${userId}-${projectId}-${file.name}`;
    console.log("fileName", fileName)

    const { data, error } = await supabase().storage.from("files").upload(fileName, file);

    if (error?.error === "Duplicate") {
      return NextResponse.json({ error: "The file already exists" }, { status: 409 });
    }

    if (!data?.id) {
      console.log(error)
      return NextResponse.json({ error: "We couldn't process your file" }, { status: 400 });
    }

    console.log("save storage", data);
    // const type = getIsTxt(fileType) ? "txt" : getIsDocx(fileType) ? "docx" : fileType;

    await supabase().from("knowledges").insert({
      user_id: userId,
      project_id: projectId,
      content: file.name,
      type: fileType,
      mode: "file",
      file: {
        ...data,
        type: fileType
      }
    }).throwOnError();
    console.log("knowledge inserted trigger webhook");
    return NextResponse.json({ message: "Upload file with success" });
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Upload file with error" })
  }
}