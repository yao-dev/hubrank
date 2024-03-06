import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const hmac = crypto.createHmac(
      "sha256",
      process.env.NEXT_PUBLIC_STRIPE_SECRET_SSO_KEY || ""
    )
      .update(body.user_email.toLowerCase())
      .digest("hex");

    console.log({ hmac, email: body.user_email.toLowerCase() })

    return Response.json({ hmac })
  } catch (e) {
    Response.json({ error: e })
  }
}