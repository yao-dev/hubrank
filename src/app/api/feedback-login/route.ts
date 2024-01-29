import jwt from "jsonwebtoken";
import { uuid } from "uuidv4";
const SSO_KEY = "JWT_SECRET";

export async function POST(request: Request) {
  const body = await request.json();

  return Response.json({
    token: jwt.sign({
      email: body.email,
      name: body.name,
      jti: uuid(),
    }, SSO_KEY, {
      algorithm: "HS256",
    })
  })
}