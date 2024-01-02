import { useEffect } from "react";
import { useForm } from "@mantine/form";
import useActiveProject from "./useActiveProject";
import useProjects from "./useProjects";
import { parseString } from "@/helpers/string";

// https://developers.google.com/search/docs/crawling-indexing/special-tags
// https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives
// https://gist.github.com/whitingx/3840905
const useHtmlTagsForm = () => {
  const activeProjectId = useActiveProject().id;
  const { data: project } = useProjects().getOne(activeProjectId)

  const form = useForm({
    initialValues: {
      html: '',
      title: '',
      description: '',
      keywords: '',
      author: '',
      google_site_verification: '',
      viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      http_equiv_value: '',
      http_equiv_content: '',
      robots: [
        'follow',
        'max-snippet:-1',
        'max-image-preview:large',
        'max-video-preview:-1',
        'NOODP',
      ],
      // robots_all: false,
      // robots_noindex: false,
      // robots_nofollow: false,
      // robots_none: false,
      // robots_noarchive: false,
      // robots_nositelinkssearchbox: false,
      // robots_nosnippet: false,
      // robots_indexifembedded: false,
      // robots_max_snippet: 0,
      // robots_max_image_preview: 'none',
      // robots_max_video_preview: 0,
      // robots_notranslate: false,
      // robots_noimageindex: false,
      link_canonical: '',
      itemprop_name: '',
      itemprop_description: '',
      itemprop_image: '',
      og_url: '',
      og_type: '',
      og_title: '',
      og_description: '',
      og_image: '',
      twitter_card: 'summary_large_image',
      twitter_title: '',
      twitter_image: '',
      twitter_description: '',
      twitter_creator: '',
      twitter_site: '',
      twitter_app_id_iphone: '',
      twitter_app_name_iphone: '',
      twitter_app_url_iphone: '',
      twitter_app_id_googleplay: '',
      twitter_app_name_googleplay: '',
      twitter_app_url_googleplay: '',
    },
    validate: {
      title: (value) => !value || value.trim().length > 50 ? 'Please enter a title with 50 characters or less' : null,
      description: (value) => !value || value.trim().length > 500 ? 'Please enter a meta description with 500 characters or less' : null,
      keywords: (value) => !value || value.length === 0 ? 'Please enter at least one meta keyword' : null,
      author: (value) => !value || value.trim().length > 50 ? 'Please enter a meta author with 50 characters or less' : null,
      google_site_verification: (value) => !value ? 'Please enter a Google site verification value' : null,
      http_equiv_value: (value) => !value ? 'Please enter an HTTP-Equiv value' : null,
      robots: (value) => !value || value.length === 0 ? 'Please enter at least one value' : null,
      link_canonical: (value) => !value ? 'Please enter a canonical link' : null,
      itemprop_name: (value) => !value ? 'Please enter an item property name' : null,
      itemprop_description: (value) => !value ? 'Please enter an item property description' : null,
      itemprop_image: (value) => !value ? 'Please enter an item property image' : null,
      og_url: (value) => !value ? 'Please enter a Facebook URL' : null,
      og_type: (value) => !value ? 'Please enter a Facebook type' : null,
      og_title: (value) => !value ? 'Please enter a Facebook title' : null,
      og_description: (value) => !value ? 'Please enter a Facebook description' : null,
      og_image: (value) => !value ? 'Please enter a Facebook image' : null,
      twitter_title: (value) => !value ? 'Please enter a Twitter title' : null,
      twitter_image: (value) => !value ? 'Please enter a Twitter image' : null,
      twitter_description: (value) => !value ? 'Please enter a Twitter description' : null,
      twitter_creator: (value) => !value ? 'Please enter a Twitter creator' : null,
      twitter_site: (value) => !value ? 'Please enter a Twitter site' : null,
      twitter_app_id_iphone: (value) => !value ? 'Please enter a Twitter app ID for iPhone' : null,
      twitter_app_name_iphone: (value) => !value ? 'Please enter a Twitter app name for iPhone' : null,
      twitter_app_url_iphone: (value) => !value ? 'Please enter a Twitter app URL for iPhone' : null,
      twitter_app_id_googleplay: (value) => !value ? 'Please enter a Twitter app ID for Google Play' : null,
      twitter_app_name_googleplay: (value) => !value ? 'Please enter a Twitter app name for Google Play' : null,
      twitter_app_url_googleplay: (value) => !value ? 'Please enter a Twitter app URL for Google Play' : null,
    },
  });

  useEffect(() => {
    if (project.metatags) {
      const { title, description, html, ...metatags } = project.metatags
      form.setValues({
        ...metatags,
        robots: project.metatags?.robots?.split(",")
      })
    }
  }, [project]);

  useEffect(() => {
    const url = `${project.website}/blog/${parseString(form.values.title)}`

    form.setValues({
      og_url: url,
      twitter_site: url,
      og_title: form.values.title,
      twitter_title: form.values.title,
    })
  }, [project, form.values.title])

  return form;
}

export default useHtmlTagsForm