import { NextResponse } from "next/server";
import { deductCredits, getSchemaMarkup, getUserPremiumData, saveSchemaMarkups } from "../helpers";
import supabase from "@/helpers/supabase/server";
import { getSummary } from 'readability-cyr';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const [
      { data: project },
      { data: article },
      { data: language },
    ] = await Promise.all([
      supabase().from("projects").select("*").eq("id", body.project_id).maybeSingle(),
      supabase().from("blog_posts").select("*").eq("id", body.article_id).maybeSingle(),
      supabase().from("languages").select("*").eq("id", body.language_id).maybeSingle()
    ]);

    const { data: user } = await supabase().from("users").select("*, users_premium:users_premium!user_id(*)").eq("id", body.user_id).maybeSingle();
    user.premium = getUserPremiumData(user);

    if (!user.premium.words || user.premium.words < 100) {
      return NextResponse.json({ message: "Insufficient words" }, { status: 401 })
    }

    console.log("article.schema_markups", article.schema_markups);
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

    await deductCredits({
      userId: body.user_id,
      costInCredits: getSummary(JSON.stringify(createdSchema, null, 2)).words,
      featureName: "schema-markup",
      premiumName: "words"
    });

    return NextResponse.json({
      schema_markup: createdSchema
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}