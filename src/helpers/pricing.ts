const errorCodes = ["insufficient_credits", "inactive_subscription"]

export const getShouldShowPricing = (error: any) => {
  return errorCodes.includes(error?.response?.data?.error) || errorCodes.includes(error?.response?.data?.error?.error)
}