"use client";;
import { ReactNode } from "react";
import { ReCaptchaProvider } from "next-recaptcha-v3";

const Recaptcha = ({ children }: { children: ReactNode }) => {
	return (
		<ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY ?? ""}>
			{children}
		</ReCaptchaProvider>
	)
};

export default Recaptcha;
