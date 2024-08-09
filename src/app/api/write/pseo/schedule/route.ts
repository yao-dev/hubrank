import { NextResponse } from "next/server";
import { createSchedule } from "@/helpers/qstash";
import { AI } from "@/app/api/AI";
import { getManualWritingStyle, getProjectContext, getSavedWritingStyle, getUpstashDestination, insertBlogPost } from "@/app/api/helpers";
import { supabaseAdmin } from "@/helpers/supabase";
import { omit } from "lodash";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  const body = await request.json();
  const ai = new AI();

  try {
    const [
      { data: project },
      { data: language },
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", body.project_id).maybeSingle(),
      supabase.from("languages").select("*").eq("id", body.language_id).maybeSingle()
    ]);

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    // FETCH WRITING STYLE IF IT EXISTS
    let writingStyle: any = getManualWritingStyle(body);
    if (body.writing_style_id) {
      writingStyle = await getSavedWritingStyle(body.writing_style_id)
    }

    const outline = await ai.getPSeoOutline({
      ...omit(body, ['variableSet']),
      variables: body.variableSet,
      language: language.label,
    });

    // const variableSet = {
    //   goal: "goal_1\ngoal_2",
    //   workout: "workout_1\nworkout_2",
    // }

    for (let [index, title] of Object.entries(body.headlines)) {
      // CREATE NEW ARTICLE WITH QUEUE STATUS
      let articleId = await insertBlogPost({
        ...body,
        title
      });

      const keys = Object.keys(body.variableSet);
      const variables = {}
      keys.forEach((key) => {
        variables[key] = body.variableSet[key].split("\n")[index];
      })

      await createSchedule({
        destination: getUpstashDestination("api/write/pseo"),
        body: {
          ...omit(body, ['variableSet']),
          outline,
          title_structure: body.title_structure,
          title,
          articleId,
          context,
          writingStyle,
          language,
          project,
          variables,
          seed_keyword: variables[body.seed_keyword] ?? ""
        },
        headers: {
          "Upstash-Delay": `${(index || 0) as number * 10}s`,
        }
      });
    }

    return NextResponse.json({ scheduled: true }, { status: 200 });
  } catch (e) {
    console.log(e?.message)
    return NextResponse.json({ scheduled: false }, { status: 500 });
  }
}