export const LOGIN_URL = `${process.env.NODE_ENV === "development" ? "http:" : "https:"}//app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? ""}/login`;
export const APP_URL = `${process.env.NODE_ENV === "development" ? "http:" : "https:"}//app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? ""}`;

export const transformUrl = (url: any) => {
  if (!url?.startsWith('https://')) {
    url = `https://${url}`
  }
  return new URL(url).origin
}