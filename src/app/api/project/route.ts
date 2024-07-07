import { fetchWebsiteMetadata } from "@/helpers/metadata";
import { supabaseAdmin } from "@/helpers/supabase";
import { getUpstashDestination } from "../helpers";
import { createBackgroundJob } from "@/helpers/qstash";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");
export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const metatags = (await fetchWebsiteMetadata(data.website)) ?? {};

    const result = await supabase
      .from('projects')
      .insert({ ...data, metatags })
      .select()
      .limit(1)
      .single()
      .throwOnError();

    return NextResponse.json({ projectId: result.data.id }, { status: 201 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "Project create error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { project_id, user_id, ...data } = await request.json();
    const metatags = (await fetchWebsiteMetadata(data.website)) ?? {};

    await supabase
      .from('projects')
      .update({
        ...data,
        metatags
      })
      .eq('id', project_id)
      .throwOnError();

    await createBackgroundJob({
      destination: getUpstashDestination("api/url-to-vector/schedule"),
      body: {
        website: data.website,
        sitemap: data.sitemap,
        projectId: project_id,
        userId: user_id,
      }
    })

    return NextResponse.json({ messgae: "Project updated" }, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ messgae: "Project update error" }, { status: 500 })
  }
}