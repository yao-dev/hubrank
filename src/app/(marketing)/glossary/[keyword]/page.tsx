import type { Metadata, ResolvingMetadata } from 'next';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import GetStarted from '../../components/GetStarted';
import { keywords, keywordsMap } from './constants';
import KeywordLink from './keyword-link';
import { useMemo } from 'react';
import KeywordList from './keyword-list';
import Link from 'next/link';
import { IconChevronLeft } from '@tabler/icons-react';
import CallToActionBanner from '@/components/CallToActionBanner/CallToActionBanner';

type Props = {
  params: { keyword: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const metadata = await parent
  const previousImages = metadata.openGraph?.images || [];
  const keyword = params.keyword ?? "";
  const data = keywordsMap[keyword.toLowerCase()];

  return {
    title: data?.keyword ?? undefined,
    description: data?.definition ?? undefined,
    openGraph: {
      images: previousImages
    },
  }
}

export default function KeywordPage({ params, }: Props) {
  const keyword = params.keyword ?? "";
  const data = keywordsMap[keyword.toLowerCase()];

  const keywordIndex = useMemo(() => {
    const index = keywords.findIndex((k) => k.slug === keyword);
    return index;
  }, [keyword]);

  const previousWord = useMemo(() => {
    return keywords[keywordIndex - 1] ?? {};
  }, [keywordIndex]);

  const nextWord = useMemo(() => {
    return keywords[keywordIndex + 1] ?? {};
  }, [keywordIndex]);

  if (!data) return null;

  return (
    <div className="text-base font-light">
      <Navbar />
      <section className="flex flex-col items-center py-2 lg:py-5 px-4 lg:w-[65%] mx-auto mt-12 lg:mt-0">
        <section className="flex w-full flex-col gap-16 mb-32">
          <div className='flex flex-col items-center gap-2'>
            <Link
              href="/glossary"
              className="flex flex-row gap-2 text-primary-500 font-medium"
            >
              <IconChevronLeft />

              <span>
                Back
              </span>
            </Link>

            <h1 className="text-5xl text-center font-bold">Glossary</h1>
          </div>

          {/* <div className='flex flex-row gap-2 mx-auto'>
            {letters.map((letter) => {
              return (
                <LetterLink key={letter} name={letter} />
              )
            })}
          </div> */}



          <div className='text-left flex flex-col gap-4'>
            <h2 className="text-3xl font-bold">{data.keyword}</h2>
            <p className='text-lg'>
              {data.definition}
            </p>
          </div>

          <div className='flex flex-row justify-between'>
            <div className={`${!previousWord ? "hidden" : ""}`}>
              <KeywordLink name={previousWord.keyword} slug={previousWord.slug} previous />
            </div>
            <div className={`${!nextWord ? "hidden" : ""}`}>
              <KeywordLink name={nextWord.keyword} slug={nextWord.slug} />
            </div>
          </div>

          <KeywordList />
        </section>

        <CallToActionBanner
          title="Keyword research + Hubrank = 🚀"
          imageName="keyword-research"
          CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
        />

      </section>
      <Footer />
    </div>
  )
}