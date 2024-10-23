import { NextResponse } from "next/server";
// import OpenAI from "openai";

export async function GET() {
  try {
    // const openai = new OpenAI({
    //   apiKey: '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',
    //   baseURL: 'https://integrate.api.nvidia.com/v1',
    // })

    // const completion = await openai.chat.completions.create({
    //   model: "nvidia/nemotron-4-340b-instruct",
    //   messages: [
    //     {
    //       "role": "system",
    //       "content": "You are a Storyteller & SEO writer expert who writes engaging content that speak to the right target audience.\nProduct info:\nProject name: TEST2\nWebsite: https://netflix.com\nDescription: Watch Netflix movies & TV shows online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more.\nLanguage: English\n===\nWriting style example to imitate:\nundefined"
    //     },
    //     {
    //       "role": "user",
    //       "content": "[write]\n\n    For the article \"Top 10 Shocking Revelations from Love Is Blind Season 7\" write the section \"The Surprise Proposal Rejection\" with a maximum of 80 words in markdown wrapped in ```markdown```.\n    Section heading prefix: ##\n    Do not add a CTA at the end\n    Do not add heading for the hook if there is any\n    Do not make up fact, statistic or fake story\n    \nTones: Humorous, Sarcastic, Playful\nPurposes: Critical, Entertaining, Analytical\nEmotions: Surprise, Joke\nVocabularies: Informal, Colloquial\nSentence structures: Interrogative sentences, Simple sentences\nPerspectives: First-person singular (I)\n- Include @@image@@ as a placeholder for the image: \"pink Love neon signage\" (DO NOT EMBED THE IMAGE)\n    Primary instructions:\n    - Leverage markdown syntaxes (strikethrough, table, italic, bold, quote, etc.) to make the content appealing and easier to read.\n    - Add h3 sub-sections with ### if the content as more than 2 paragraphs.\n    - Don't use h1 at all.\n    - Add anchor to the section here is an example for a h2: ## <a name=\"heading-example\"></a>Heading example\n    - Prefer Active Voice\n    - Avoid the use of adverbs as much as possible\n    - Avoid Passive Voice\n    - Consider Sentence Variety\n    - IMPORTANT: Do not use adverbs at all\n    - IMPORTANT: Diversify vocabulary\n    - IMPORTANT: vary the sentence structure and tone to make it sound more conversational.\n    - IMPORTANT: avoid words like the following or write their alternative: as you,remember,embrace,by,by incorporating,ready to,are you,ever wondered,discover,let's,dive,unlock,transform,the secrets,breeze,effortlessly,wondering,welcome,journey,in conclusion,consequently,furthermore,in addition to,extremely,significantly,in today's world,explore,Unraveling,remember,check out,debunked,myths,good luck,efficiently,Demystified,embark,However,Unleash,enjoyable,This comprehensive guide,help you understand,the science behind,You've got this,don't worry,This guide,You might be thinking,Harnessing,For more\n    - do not use emojis\n    - do not introduce any next section\n(don't add any text before and after the markdown except the text I request you to write)"
    //     }
    //   ],
    //   temperature: 0.2,
    //   top_p: 0.7,
    //   max_tokens: 1024,
    //   stream: false,
    // })

    // return NextResponse.json(completion);

    return NextResponse.json({
      attempt: '0192046a-b855-37c7-d512-d5a1a9c6f6e7',
      id: '0192046a-b855-37c7-d512-d5a1a9c6f6e7',
      request_id: '0192046a-b855-37c7-d512-d5a1a9c6f6e7',
      status: 'success'
    })
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ ping: true })
}