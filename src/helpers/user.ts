import supabase from "./supabase";

export const getUserId = async () => {
  const id = (await supabase.auth.getUser()).data.user?.id;
  return id;
}

export const getUser = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  return user;
}

export const getUserEmail = async () => {
  const email = (await supabase.auth.getUser()).data.user?.email;
  return email;
}