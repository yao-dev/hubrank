export const LOGIN_URL = `${process.env.NODE_ENV === "development" ? "http:" : "https:"}//app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? ""}/login`