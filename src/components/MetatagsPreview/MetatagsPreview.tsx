import { useContext } from "react";
import { CodeHighlightTabs } from '@mantine/code-highlight';
import { compact } from "lodash";
import useBlogPosts from "@/hooks/useBlogPosts";
import { useSearchParams } from "next/navigation";
import useHtmlTagsForm from '@/hooks/useHtmlTagsForm';
import SeoTagsContext from '@/context/SeoTagsContext';
import prettify from 'pretty';

const MetatagsPreview = () => {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("article") || 0
  const { data: article } = useBlogPosts().getOne(+articleId);
  const defaultForm = useHtmlTagsForm();
  const seoTagsContext = useContext(SeoTagsContext);
  const form = seoTagsContext.form || defaultForm;

  const robots = form.values.robots?.join?.(',');

  let primary = compact([
    article?.headline && `<title>${article.headline}</title>`,
    article?.headline && `<meta name="title" content="${article.headline}" />`,
    form.values.description && `<meta name="description" content="${form.values.description}" />`,
    form.values.author && `<meta name="author" content="${form.values.author}" />`,
    robots?.length && `<meta name="robots" content="${robots || ''}" />`,
    form.values.keywords && `<meta name="keywords" content="${form.values.keywords}" />`,
    form.values.viewport && `<meta name="viewport" content="${form.values.viewport}" />`
  ]);

  if (primary.length) {
    primary = ["<!-- Primary Meta Tags -->", ...primary, ""]
  }

  let facebookTags = compact([
    form.values.og_type && `<meta property="og:type" content="${form.values.og_type}" />`,
    form.values.og_url && `<meta property="og:url" content="${form.values.og_url}" />`,
    `<meta property="og:locale" content="en_US" />`,
    form.values.og_title && `<meta property="og:title" content="${form.values.og_title}" />`,
    form.values.og_description && `<meta property="og:description" content="${form.values.og_description}" />`,
    form.values.og_image && `<meta property="og:image" content="${form.values.og_image}" />`
  ])

  if (facebookTags.length) {
    facebookTags = ["<!-- Open Graph / Facebook -->", ...facebookTags, ""]
  }

  let twitterTags = compact([
    form.values.twitter_creator && `<meta property="twitter:creator" content="${form.values.twitter_creator}" />`,
    form.values.twitter_card && `<meta property="twitter:card" content="${form.values.twitter_card}" />`,
    form.values.twitter_site && `<meta property="twitter:url" content="${form.values.twitter_site}" />`,
    form.values.twitter_image && `<meta property="twitter:image:alt" content="${form.values.twitter_image}" />`,
    form.values.twitter_title && `<meta property="twitter:title" content="${form.values.twitter_title}" />`,
    form.values.twitter_description && `<meta property="twitter:description" content="${form.values.twitter_description}" />`,
    form.values.twitter_image && `<meta property="twitter:image" content="${form.values.twitter_image}" />`,
    form.values.twitter_site && `<meta property="twitter:site" content="${form.values.twitter_site}" />`,
    form.values.twitter_app_id_iphone && `<meta name="twitter:app:id:iphone" content="${form.values.twitter_app_id_iphone}" />`,
    form.values.twitter_app_name_iphone && `<meta name="twitter:app:name:iphone" content="${form.values.twitter_app_name_iphone}" />`,
    form.values.twitter_app_url_iphone && `<meta name="twitter:app:url:iphone" content="${form.values.twitter_app_url_iphone}" />`,
    form.values.twitter_app_id_googleplay && `<meta name="twitter:app:id:googleplay" content="${form.values.twitter_app_id_googleplay}" />`,
    form.values.twitter_app_name_googleplay && `<meta name="twitter:app:name:googleplay" content="${form.values.twitter_app_name_googleplay}" />`,
    form.values.twitter_app_url_googleplay && `<meta name="twitter:app:url:googleplay" content="${form.values.twitter_app_url_googleplay}" />`
  ]);

  if (twitterTags.length) {
    twitterTags = ["<!-- Twitter -->", ...twitterTags, ""]
  }

  let content = [primary, facebookTags, twitterTags].flat().join("\n");
  content = prettify(`
  <html>
    <head>
      ${content}
    </head>
    <body>
      ${form.values?.html || ""}
    </body>
  </html>`)

  return (
    <>
      <CodeHighlightTabs
        w="37rem"
        h="50%"
        copyLabel="Copy code"
        copiedLabel="Copied!"
        code={[
          {
            fileName: 'index.html',
            code: content,
            language: 'html',
          },
        ]}
      />
    </>
  )
}

export default MetatagsPreview