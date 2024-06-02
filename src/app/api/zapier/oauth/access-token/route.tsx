import { supabaseAdmin } from "@/helpers/supabase";
import { NextResponse } from "next/server";

const supabase = supabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY || "");

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const body = {
      client_id: form.get("client_id") as string,
      client_secret: form.get("client_secret") as string,
      code: form.get("code") as string,
      redirect_uri: form.get("redirect_uri") as string,
      state: form.get("state") as string,
    }
    console.log("body", body)

    return NextResponse.json({ access_token: 'vkjsdbdjkajksndckjwbrskudbfasb' })


    // const client = new AuthorizationCode({
    //   client: {
    //     id: body.client_id,
    //     secret: body.client_secret
    //   },
    //   auth: {
    //     tokenHost: 'https://433e-2a00-23c7-5c28-e301-1cfe-16e-9a16-27d8.ngrok-free.app',
    //     tokenPath: '/api/zapier/oauth/access-token',
    //     authorizePath: '/api/zapier/oauth/authorize',
    //   },
    // });

    // // const authorizationUri = client.authorizeURL({
    // //   redirect_uri: body.redirect_uri,
    // //   state: body.state
    // // });

    // // console.log({ authorizationUri })

    // // NextResponse.redirect(authorizationUri)

    // const tokenResponse = client.createToken({
    //   code: body.code,
    //   redirect_uri: body.redirect_uri,
    // });

    // console.log("tokenResponse", tokenResponse)

    // return NextResponse.json({ access_token: tokenResponse.token.code })
  } catch (error) {
    // console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

// export async function POST(request: Request) {
//   try {
//     const form = await request.formData()
//     const body = {
//       client_id: form.get("client_id") as string,
//       client_secret: form.get("client_secret") as string,
//       code: form.get("code") as string,
//       redirect_uri: form.get("redirect_uri") as string,
//       state: form.get("state") as string,
//     }
//     // const body = await request.json();
//     console.log("body", body)

//     const client = new AuthorizationCode({
//       client: {
//         id: body.client_id,
//         secret: body.client_secret
//       },
//       auth: {
//         tokenHost: 'https://433e-2a00-23c7-5c28-e301-1cfe-16e-9a16-27d8.ngrok-free.app',
//         tokenPath: '/api/zapier/oauth/access-token',
//         authorizePath: '/api/zapier/oauth/authorize',
//       },
//     });

//     const authorizationUri = client.authorizeURL({
//       redirect_uri: body.redirect_uri,
//       state: body.state
//     });

//     console.log({ authorizationUri })

//     NextResponse.redirect(authorizationUri)

//     // request.headers.append('origin', 'https://zapier.com/dashboard/auth/oauth/return/App199242CLIAPI/')

//     const tokenResponse = await client.getToken({
//       code: body.code,
//       redirect_uri: body.redirect_uri,
//     });

//     console.log("tokenResponse", tokenResponse)

//     return NextResponse.json({ access_token: tokenResponse.token.access_token })
//   } catch (error) {
//     // console.error(error)
//     return NextResponse.json({ error }, { status: 500 })
//   }
// }