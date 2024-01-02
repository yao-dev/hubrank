import SeoTagsContext from "@/context/SeoTagsContext";
import useHtmlTagsForm from "@/hooks/useHtmlTagsForm";
import { Flex, MultiSelect, TextInput, Fieldset, Text } from "@mantine/core";
import { useState, useContext } from "react";

const robotOptions = [
  // 'all',
  // 'noindex',
  // 'dofollow',
  'follow',
  // 'nofollow',
  // 'none',
  // 'noarchive',
  // 'nositelinkssearchbox',
  // 'nosnippet',
  // 'indexifembedded',
  'max-snippet:-1',
  'max-image-preview:large',
  'max-video-preview:-1',
  'notranslate',
  // 'noimageindex',
  'NOODP',
].map((i) => (
  { value: i, label: i }
))

const HtmlHeadTagsForm = () => {
  const [checked, setChecked] = useState({
    title: true,
    description: true,
    keywords: true,
    author: true,
    google_site_verification: true,
    viewport: true,
    http_equiv_value: true,
    http_equiv_content: true,
    robots: true,
    link_canonical: true,
    itemprop_name: true,
    itemprop_description: true,
    itemprop_image: true,
    og_url: true,
    og_type: true,
    og_title: true,
    og_description: true,
    og_image: true,
    twitter_card: true,
    twitter_title: true,
    twitter_image: true,
    twitter_description: true,
    twitter_creator: true,
    twitter_site: true,
    twitter_app_id_iphone: true,
    twitter_app_name_iphone: true,
    twitter_app_url_iphone: true,
    twitter_app_id_googleplay: true,
    twitter_app_name_googleplay: true,
    twitter_app_url_googleplay: true,
  });
  const defaultForm = useHtmlTagsForm();
  const seoTagsContext = useContext(SeoTagsContext);
  const form = seoTagsContext.form || defaultForm;

  return (
    <Flex direction="column" gap="md">
      <Fieldset legend={<Text fw="bold">Defaults</Text>}>
        <Flex direction="column" gap="xs">
          <TextInput
            label="Title"
            disabled={!checked.title}
            {...form.getInputProps('title')}
          />
          <TextInput
            label="Description"
            disabled={!checked.description}
            {...form.getInputProps('description')}
          />
          <TextInput
            label="Keywords"
            disabled={!checked.keywords}
            {...form.getInputProps('keywords')}
          />
          <TextInput
            label="Author"
            {...form.getInputProps('author')}
          />
          <TextInput
            label="Viewport"
            {...form.getInputProps('viewport')}
          />
          <TextInput
            label="HTTP-Equiv Value"
            {...form.getInputProps('http_equiv_value')}
          />
          <TextInput
            label="HTTP-Equiv Content"
            {...form.getInputProps('http_equiv_content')}
          />
        </Flex>
      </Fieldset>

      <Fieldset legend={<Text fw="bold">Google</Text>}>
        <Flex direction="column" gap="xs">
          <TextInput
            label="Name"
            {...form.getInputProps('itemprop_name')}
          />
          <TextInput
            label="Description"
            {...form.getInputProps('itemprop_description')}
          />
          <TextInput
            label="Image"
            {...form.getInputProps('itemprop_image')}
          />
          <MultiSelect
            data={robotOptions}
            label="Robots"
          // {...form.getInputProps('robots')}
          />
          <TextInput
            label="Link Canonical"
            {...form.getInputProps('link_canonical')}
          />
          <TextInput
            label="Google Site Verification"
            {...form.getInputProps('google_site_verification')}
          />
        </Flex>
      </Fieldset>

      <Fieldset legend={<Text fw="bold">Facebook</Text>}>
        <Flex direction="column" gap="xs">
          <TextInput
            label="URL"
            disabled={!checked.og_url}
            {...form.getInputProps('og_url')}
          />
          <TextInput
            label="Type"
            {...form.getInputProps('og_type')}

          />
          <TextInput
            label="Title"
            {...form.getInputProps('og_title')}
          />
          <TextInput
            label="Description"
            {...form.getInputProps('og_description')}
          />
          <TextInput
            label="Image"
            {...form.getInputProps('og_image')}
          />
        </Flex>
      </Fieldset>

      <Fieldset legend={<Text fw="bold">Twitter</Text>}>
        <Flex direction="column" gap="xs">
          <TextInput
            label="Title"
            {...form.getInputProps('twitter_title')}
          />
          <TextInput
            label="Image"
            {...form.getInputProps('twitter_image')}
          />
          <TextInput
            label="Description"
            {...form.getInputProps('twitter_description')}
          />
          <TextInput
            label="Creator"
            {...form.getInputProps('twitter_creator')}
          />
          <TextInput
            label="Site"
            {...form.getInputProps('twitter_site')}
          />
        </Flex>
      </Fieldset>

      <Fieldset legend={<Text fw="bold">iOS</Text>}>
        <Flex direction="column" gap="xs">
          <TextInput
            label="App ID"
            {...form.getInputProps('twitter_app_id_iphone')}
          />
          <TextInput
            label="App Name"
            {...form.getInputProps('twitter_app_name_iphone')}
          />
          <TextInput
            label="App URL"
            {...form.getInputProps('twitter_app_url_iphone')}
          />
        </Flex>
      </Fieldset>

      <Fieldset legend={<Text fw="bold">Google Play</Text>}>
        <Flex direction="column" gap="xs">
          <TextInput
            label="App ID"
            {...form.getInputProps('twitter_app_id_googleplay')}
          />
          <TextInput
            label="App Name"
            {...form.getInputProps('twitter_app_name_googleplay')}
          />
          <TextInput
            label="App URL"
            {...form.getInputProps('twitter_app_url_googleplay')}
          />
        </Flex>
      </Fieldset>
    </Flex>
  )
}

export default HtmlHeadTagsForm;