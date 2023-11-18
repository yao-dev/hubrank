import supabase from "./supabase";

export const getUserId = async () => {
  const id = (await supabase.auth.getUser()).data.user?.id;
  return id;
}