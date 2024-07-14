import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";
import { checkCredits, deductCredits, getSchemaMarkup, saveSchemaMarkups } from "../helpers";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // CHECK IF USER HAS ENOUGH CREDITS
    const creditCheck = {
      userId: body.user_id,
      costInCredits: 0.5,
      featureName: "schema-markup"
    }
    await checkCredits(creditCheck);

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

    const createdSchema = await getSchemaMarkup({
      project,
      article,
      lang: language.label,
      schemaName: body.schema,
    })
    const schemas = article.schema_markups ?? []
    schemas.push(createdSchema)
    console.log("schemas", schemas)
    await saveSchemaMarkups(article.id, schemas);

    await deductCredits(creditCheck);

    return NextResponse.json({
      schema_markup: createdSchema
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}