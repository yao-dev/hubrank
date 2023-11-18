import axios from "axios";
import Cors from 'cors';

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}


export async function POST(request: Request) {
  const body = await request.json();
  const { data } = await axios({
    method: "POST",
    url: "https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live",
    data: [{ "search_partners": false, "keywords": [body.keyword], "language_code": body.countryCode || "en", "sort_by": "relevance", "date_interval": "next_month", "include_adult_keywords": false }],
    auth: {
      username: process.env.NEXT_PUBLIC_DATAFORSEO_USERNAME || "",
      password: process.env.NEXT_PUBLIC_DATAFORSEO_PASSWORD || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  return Response.json({
    result: data.tasks[0].result,
    result_count: data.tasks[0].result_count,
  })
}