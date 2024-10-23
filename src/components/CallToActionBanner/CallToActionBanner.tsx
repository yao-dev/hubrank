import { ReactNode } from "react";

type Props = {
  title: string;
  text?: string;
  imageName: "keyword-research" | "blog-post" | "headline-mode" | "outline" | "logo";
  CallToAction: ReactNode;
}

const CallToActionBanner = ({
  title,
  text,
  imageName,
  CallToAction
}: Props) => {
  return (
    <div className='relative w-full p-16 bg-secondary-100 rounded-3xl shadow-2xl xl:grid xl:grid-cols-2 overflow-hidden'>
      <div>
        <h3 className='text-white text-3xl lg:text-4xl font-bold text-center xl:text-left'>{title}</h3>
        {text && (
          <p className='text-gray-300 text-lg leading-7 mt-6 text-center xl:text-left'>
            {text}
          </p>
        )}
        {CallToAction && (
          <div className='mt-10 flex mx-auto justify-center'>
            {CallToAction}
          </div>
        )}
      </div>

      <div className='hidden xl:flex absolute -right-[600px] bottom-0 p-2 bg-white/10 rounded-lg w-fit h-fit -rotate-12'>
        <img src={`/marketing/${imageName}.png`} className='rounded-md w-[1000px]' />
      </div>
    </div>
  )
}

export default CallToActionBanner