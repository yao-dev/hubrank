import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.user_email.toLowerCase()

    const hmac = crypto.createHmac(
      "sha256",
      process.env.NEXT_PUBLIC_STRIPE_SECRET_SSO_KEY || ""
    )
      .update(email)
      .digest("hex");

    return Response.json({ hmac, email })
  } catch (e) {
    Response.json({ error: e })
  }
}