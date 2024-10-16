import type { Metadata, ResolvingMetadata } from 'next';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import GetStarted from "../../components/GetStarted";
import { competitors } from "@/options";
import CallToActionBanner from '@/components/CallToActionBanner/CallToActionBanner';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';

const FeaturesPreview = dynamic(() => import('../../components/FeaturesPreview'), {
  loading: () => <Spin spinning />,
})

type Props = {
  params: { competitor: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const metadata = await parent
  const previousImages = metadata.openGraph?.images || [];
  const competitorName = params.competitor;
  const data = competitors[competitorName];

  return {
    title: data ? `${data.name} alternative` : "Alternative",
    openGraph: {
      images: previousImages
    },
  }
}

export default function Alternative({ params, searchParams }: Props) {
  const competitorName = params.competitor;
  const data = competitors[competitorName];

  if (!data) return null;

  return (
    <div className="text-base font-light">
      <Navbar />
      <section className="flex flex-col items-center py-2 lg:py-5 px-4 lg:w-[55%] mx-auto mt-12 lg:mt-0">
        {/* <section className="flex flex-col gap-6 container mx-auto mt-8 px-12 lg:w-[40%]"> */}
        {/* <SecondaryHeroHeader /> */}

        <div className="flex flex-col gap-16 lg:gap-24 text-base">
          <div className='flex flex-col gap-8 items-center mt-8'>
            {data.logo && <img src={data.logo} className={`w-[180px] max-h-[100px] ${data.whiteLogo && "bg-secondary-500 p-2"}`} />}
            <h1 className="text-4xl lg:text-5xl text-center font-bold">{data.name} alternative</h1>
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl lg:text-3xl font-bold">What is {data.name}?</h2>

            {data.description}
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-center">Why choose Hubrank over {data.name}?</h2>
            <FeaturesPreview />
          </section>
        </div>
      </section>

      <section className="px-4 lg:w-[65%] mx-auto mt-24">
        <CallToActionBanner
          title="Outwork your competitors."
          imageName="blog-post"
          CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
        />
      </section>

      <Footer />
    </div>
  )
}