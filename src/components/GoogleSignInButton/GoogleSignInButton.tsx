"use client";
import supabase from "@/helpers/supabase";

;
const GoogleSignInButton = () => {
  const onSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing",
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  }

  return (
    <div
      className="flex flex-row items-center justify-between py-[8px] text-[#3c4043] border rounded-[4px] px-3 cursor-pointer hover:bg-sky-50 hover:border-sky-200"
      onClick={onSignIn}
    >
      <img
        src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
        alt="G"
        width={18}
        className="top-0 bottom-0 left-4"
      />
      <p className="mx-auto">
        Continue with Google
      </p>
    </div>
  )
}

export default GoogleSignInButton;