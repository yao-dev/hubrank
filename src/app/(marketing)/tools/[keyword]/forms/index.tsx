import CallToActionBanner from '@/components/CallToActionBanner/CallToActionBanner';
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandYoutube,
  IconH1,
  IconHeading,
  IconLink,
  IconSignature,
} from "@tabler/icons-react";
import { IconHash } from "@tabler/icons-react";
import { slugify } from '@/helpers/text';
import GetStarted from '@/app/(marketing)/components/GetStarted';
import ToolForm, { InputHeadings, InputHeadlineType, InputTopic, InputWebsiteUrl } from './tool-form';

// TODO:
// dynamic metadata
// show the right form and title based on the search query / keyword
// create a list of search queries related to the existing tools
// create a constant that maps the search queries to the right tool
// index in the sitemap all the keywords in the above list

// check email with zerobounce
// also use recaptcha for login form and tools

const forms = [
  {
    id: "headline_generator",
    icon: (props: any) => <IconH1 {...props} />,
    title: "Headline generator",
    subtitle: "Create compelling and attention-grabbing headlines. Generate SEO-optimized titles that drive clicks, increase engagement, and boost your website's organic traffic.",
    form: (
      <ToolForm name="headlines" submitText='Get headlines ✨'>
        <InputTopic />
        <InputHeadlineType />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Write blog posts with engaging headlines ✍️"
        imageName="headline-mode"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "headline generator",
      "title generator",
      "title generator for youtube",
      "title generator for story",
      "blog title generator",
      "essay title generator",
      "title generator for essay",
      "essay titles generator",
      "catchy headline generator",
      "book title generator using keywords",
      "seo title generator",
      "title name generator",
      "free title generator",
      "ai book title generator",
      "title generator ai",
      "youtube title generator ai",
      "free headline generator",
      "blog title ideas",
      "youtube shorts title generator",
      "seo title examples",
      "headline generator ai",
      "article headline generator",
      "title generator from keywords",
      "youtube title generator"
    ],
  },
  {
    id: "hashtag_generator",
    icon: (props: any) => <IconHash {...props} />,
    title: "Hashtag generator",
    subtitle: "Create the perfect hashtags for any platform. Increase engagement, visibility, and reach with optimized tags targeted to your niche.",
    form: (
      <ToolForm name="hashtags" submitText='Get hashtags ✨'>
        <InputTopic />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Generate SEO-optimized blogs, social media captions & replies"
        imageName="blog-post"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "hashtag generator",
      "rapidtags",
      "hashtag generator wedding",
      "wedding hashtag generator",
      "hashtag generator for wedding",
      "wedding hashtags",
      "hashtag wedding",
      "trending hashtags today",
      "free hashtag generator",
      "ai hashtag generator",
      "wedding hashtag ideas"
    ],
  },
  {
    id: "tiktok_hashtag_generator",
    icon: (props: any) => <IconBrandTiktok {...props} />,
    title: "Tiktok hashtag generator",
    subtitle: "TikTok hashtags that amplify your videos. Get more views, likes, and followers by using the most relevant tags.",
    form: (
      <ToolForm name="hashtags" submitText='Get hashtags ✨'>
        <InputTopic />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Generate SEO-optimized blogs, social media captions & replies"
        imageName="blog-post"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "tiktok hashtag generator",
      "tiktok hashtags generator",
      "tiktok hashtags trending",
      "hashtag generator tiktok",
      "trending tiktok hashtags today",
      "tiktok hashtags for views",
      "trending tiktok hashtags this week",
      "trending hashtags on tiktok this week",
      "tiktok hashtags to go viral"
    ],
  },
  {
    id: "instagram_hashtag_generator",
    icon: (props: any) => <IconBrandInstagram {...props} />,
    title: "Instagram hashtag generator",
    subtitle: "Maximize your Instagram reach with targeted hashtags. Enhance discoverability, grow your audience, and increase engagement with custom tag suggestions.",
    form: (
      <ToolForm name="hashtags" submitText='Get hashtags ✨'>
        <InputTopic />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Generate SEO-optimized blogs, social media captions & replies"
        imageName="blog-post"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "instagram hashtag generator",
      "inflact",
      "hashtag for instagram",
      "hashtag generator for instagram",
      "instagram hashtags generator",
      "best hashtags for instagram",
      "instagram hashtags trending",
      "hashtag instagram",
      "popular hashtags for instagram",
      "hashtag generator instagram",
      "inflact instagram",
      "hashtags for instagram reels",
      "hashtag for instagram reels",
      "hashtag for instagram post",
      "hashtags for instagram post",
      "trending instagram hashtags today",
      "instagram hashtags for likes",
      "best hashtags for instagram reels",
      "wedding hashtags instagram"
    ],
  },
  {
    id: "youtube_hashtag_generator",
    icon: (props: any) => <IconBrandYoutube {...props} />,
    title: "Youtube hashtag generator",
    subtitle: "Boost your YouTube video's visibility with targeted hashtags. Improve searchability, drive more views, and attract subscribers with the right tags.",
    form: (
      <ToolForm name="hashtags" submitText='Get hashtags ✨'>
        <InputTopic />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Supercharge your content marketing with AI-driven tools"
        imageName="blog-post"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "youtube hashtag generator",
      "youtube tag generator",
      "hashtag generator youtube",
      "youtube hashtags generator",
      "rapidtags youtube"
    ],
  },
  {
    id: "outline_generator",
    icon: (props: any) => <IconHeading {...props} />,
    title: "Outline generator",
    subtitle: "Get well-structured outlines for articles, essays, or content planning. Streamline your writing process with organized and detailed outlines.",
    form: (
      <ToolForm name="outline" submitText='Get outline ✨'>
        <InputTopic />
        <InputHeadings />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Write blog posts with engaging outline ✍️"
        imageName="outline"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "outline generator"
    ],
  },
  {
    id: "linkedin_headline_generator",
    icon: (props: any) => <IconBrandLinkedin {...props} />,
    title: "Linkedin headline generator",
    subtitle: "Stand out on LinkedIn with compelling headlines. Create professional, attention-grabbing headlines that enhance your profile and attract connections.",
    form: (
      <ToolForm name="headlines" submitText='Get headlines ✨'>
        <InputTopic />
        <InputHeadlineType />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Generate SEO-optimized blogs, social media captions & replies"
        imageName="blog-post"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "linkedin headline generator",
      "linkedin headline examples",
      "linkedin headline for students",
      "linkedin headline ideas",
      "linkedin headline examples for job seekers",
      "linkedin profile headline examples",
      "linkedin headline analyzer"
    ],
  },
  {
    id: "meta_description_generator",
    icon: (props: any) => <IconSignature {...props} />,
    title: "Meta description generator",
    subtitle: "Generate SEO-optimized meta descriptions that drive clicks. Improve your website's search engine visibility with concise, engaging descriptions.",
    form: (
      <ToolForm name="meta_description" submitText='Get meta description ✨'>
        <InputTopic />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Boost your website's ranking today with Hubrank"
        imageName="blog-post"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "meta description generator",
      "youtube description generator",
    ],
  },
  {
    id: "backlinks_checker",
    icon: (props: any) => <IconLink {...props} />,
    title: "Backlinks checker",
    subtitle: "Analyze your website’s backlink profile with precision, find opportunities, and improve your SEO strategy with our backlinks checker.",
    form: (
      <ToolForm name="backlink_checker" submitText='Get backlinks ✨'>
        <InputWebsiteUrl />
        {/* <InputEmail /> */}
      </ToolForm>
    ),
    cta: (
      <CallToActionBanner
        title="Boost your website's ranking today with Hubrank"
        imageName="blog-post"
        CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
      />
    ),
    keywords: [
      "website backlinks",
      "backlinks checker",
      "website analyzer",
      "keyword research tool",
      "keyword generator",
      "keyword research",
      "google keyword research tool",
      "backlink checker free",
      "free backlink checker",
      "ahrefs backlink checker",
      "website backlink",
      "backlinks websites",
      "backlinks in seo",
      "google backlink checker",
      "free backlinks",
      "moz backlink checker",
      "backlink checker moz",
      "backlink generator",
      "backlink generation",
      "best backlink checker"
    ],
  },
];

export const formSlugs = forms.map((item) => item.keywords).flat(2).map((keyword) => slugify(keyword))

export default forms