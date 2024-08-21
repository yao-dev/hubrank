"use client";;
import supabase from "@/helpers/supabase";
import axios from "axios";
import { useRouter } from "next/navigation";

const GoogleSearchConsoleSignInButton = () => {
  const router = useRouter();

  const onConnect = async () => {
    // await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    //   options: {
    //     scopes: "https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing",
    //     redirectTo: `${location.origin}/auth/callback`,
    //     queryParams: {
    //       access_type: "online",
    //       // access_type: 'offline',
    //       prompt: 'consent',
    //     },
    //   },
    // });
    const { data } = await axios.get("/api/search-console-auth-url")
    router.push(data.url)
    // await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    //   options: {
    //     // scopes: "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    //     scopes: "https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing",
    //     redirectTo: `${location.origin}/auth/callback`,
    //     queryParams: {
    //       access_type: 'online',
    //       prompt: 'consent',
    //     },
    //   },
    // });
  }

  return (
    <div
      className="flex flex-row items-center justify-between py-[8px] text-[#3c4043] border rounded-[4px] px-3 cursor-pointer hover:bg-sky-50 hover:border-sky-200"
      onClick={onConnect}
    >
      <img
        src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
        alt="G"
        width={18}
        className="top-0 bottom-0 left-4"
      />
      <p className="mx-auto">
        Connect Search Console
      </p>
    </div>
  )
}

export default GoogleSearchConsoleSignInButton;