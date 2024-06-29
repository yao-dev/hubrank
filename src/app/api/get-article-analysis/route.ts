import { NextResponse } from "next/server";
import { SeoCheck } from "seord";

export async function POST(request: Request) {
  try {
    const htmlText = `<h3>What is Tabata?</h3>
<p>Tabata is a high-intensity interval training (HIIT) workout. It involves 20 seconds of maximum effort followed by 10 seconds of rest, repeated for 4 minutes. This method was developed by Dr. Izumi Tabata to improve both aerobic and anaerobic systems. this is a test</p>
<h3>How does Tabata help in weight loss?</h3>
<p>Tabata boosts your metabolism and burns calories quickly. The intense bursts of activity followed by short rest periods push your body to use energy efficiently. This leads to increased fat burning, even hours after the workout.</p>
<h3>What are the benefits of Tabata?</h3>
<p>Tabata offers numerous benefits:</p>
<ul>
<li><strong>Efficient Workouts</strong>: Quick, 4-minute sessions fit into any schedule.</li>
<li><strong>Increased Endurance</strong>: Enhances both aerobic and anaerobic capacities.</li>
<li><strong>Improved Cardiovascular Health</strong>: Boosts heart rate and improves circulation.</li>
<li><strong>Fat Loss</strong>: High calorie burn continues post-workout.</li>
</ul>
<h3>How to get started with Tabata?</h3>
<p>Start with basic exercises like squats, push-ups, or jumping jacks. Perform each exercise for 20 seconds at maximum effort, followed by 10 seconds of rest. Repeat for 4 minutes. Gradually increase intensity and variety as you become more comfortable.</p>
<h3>What are the common mistakes to avoid with Tabata?</h3>
<p>Avoid these mistakes to maximize your Tabata workout:</p>
<ul>
<li><strong>Skipping Warm-ups</strong>: Always warm up to prevent injuries.</li>
<li><strong>Poor Form</strong>: Maintain proper form to avoid strain.</li>
<li><strong>Overtraining</strong>: Give your body time to recover.</li>
<li><strong>Ignoring Rest Periods</strong>: Stick to the 10-second rest intervals.</li>
</ul>
<h3>How often should you do Tabata for best results?</h3>
<p>For optimal weight loss, aim to do Tabata 3-4 times a week. This frequency allows your body to recover while still benefiting from the intense workouts.</p>
<h3>Can Tabata be combined with other exercises?</h3>
<p>Yes, Tabata can be combined with other workouts. Pair it with strength training or yoga for a balanced fitness routine. This combination helps build muscle and improve flexibility.</p>
<h3>What diet should you follow while doing Tabata?</h3>
<p>A balanced diet is crucial. Focus on:</p>
<ul>
<li><strong>High Protein</strong>: Supports muscle recovery and growth.</li>
<li><strong>Complex Carbs</strong>: Provides sustained energy.</li>
<li><strong>Healthy Fats</strong>: Essential for overall health.</li>
<li><strong>Hydration</strong>: Drink plenty of water before and after workouts.</li>
</ul>
<p>For more tips on healthy eating, check out our blog on <a href="https://getfiit.app/blog/high-protein-meal-plans-fuel-your-body-right">High Protein Meal Plans</a> and <a href="https://getfiit.app/blog/low-carb-meal-ideas-healthy-eating-made-easy">Low Carb Meal Ideas</a>.</p>`;

    const contentJson = {
      title: 'How to lose weight with tabata',
      htmlText,
      keyword: 'Lose weight with Push ups',
      subKeywords: [
        "Push up weight loss",
        "Push up exercise routine",
        "Burn calories with push ups",
        "Push up fat loss",
        "Push up fitness benefits",
        "Push up workout plan",
        "Push up for beginners",
        "Push up muscle building",
        "Home push up exercises",
        "Effective push up techniques"
      ],
      metaDescription: 'Discover how to lose weight with Tabata, an intense workout method. Learn how much Tabata to lose weight and how often you should do it for effective results.',
      languageCode: 'en',
      countryCode: 'us'
    };

    // Initialize SeoCheck with html content, main keyword and sub keywords
    const seoCheck = new SeoCheck(contentJson);

    // Perform analysis
    const result = await seoCheck.analyzeSeo();

    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "get-article-analysis error" }, { status: 500 })
  }
}