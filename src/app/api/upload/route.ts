import { supabaseAdmin } from "@/helpers/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

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

    const fileType = file.type.split("/").slice(-1);
    console.log("fileType", fileType)
    const fileName = `${userId}-${projectId}-${file.name}.${fileType}`;
    console.log("fileName", fileName)

    const { data } = await supabase.storage.from("files").upload(fileName, file);
    console.log("save storage", data)

    await supabase.from("knowledges").insert({
      user_id: userId,
      project_id: projectId,
      content: file.name,
      type: fileType,
      mode: "file",
      file: {
        ...data,
        name: fileName
      }
    }).throwOnError();
    console.log("knowledge inserted trigger webhook");

    console.log(`removing file: ${fileName}`)
    await supabase.storage.from("files").remove([fileName]);
    console.log("file removed!");

    return NextResponse.json({ message: "Upload file with success" });
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ message: "Upload file with error" })
}