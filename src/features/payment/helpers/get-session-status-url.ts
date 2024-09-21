import { stripeUrls } from "../constants"
import { GetSessionStatusUrl } from "../types"

export const getSessionStatusUrl = ({ sessionId, userId }: GetSessionStatusUrl) => {
  return stripeUrls.SESSION_STATUS
    .replace("SESSION_ID", sessionId)
    .replace("USER_ID", userId)
}