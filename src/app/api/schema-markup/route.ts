import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";
import { AI } from "../AI";
import { getProjectContext, saveSchemaMarkups } from "../helpers";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [
      { data: project },
      { data: article },
      { data: language },
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", body.project_id).maybeSingle(),
      supabase.from("blog_posts").select("*").eq("id", body.article_id).maybeSingle(),
      supabase.from("languages").select("*").eq("id", body.language_id).maybeSingle()
    ]);

    console.log("article.schema_markups", article.schema_markups)

    const context = getProjectContext({
      name: project.name,
      website: project.website,
      description: project.metatags?.description || project?.description,
      lang: language.label,
    })

    const ai = new AI({ context });
    const schemas = article.schema_markups ?? []
    const createdSchema = await ai.schemaMarkup({
      project,
      article: article.markdown,
      schemaName: body.schema,
      metaDescription: article.meta_description
    });

    console.log("createdSchema", createdSchema)
    schemas.push(createdSchema)
    console.log("schemas", schemas)
    await saveSchemaMarkups(article.id, schemas)

    return NextResponse.json({
      schema_markup: createdSchema
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}