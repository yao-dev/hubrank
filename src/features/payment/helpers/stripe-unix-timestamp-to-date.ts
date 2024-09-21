export const stripeUnixTimestampToDate = (unixTimestamp: number) => {
  const milliseconds = unixTimestamp * 1000
  return new Date(milliseconds)
}