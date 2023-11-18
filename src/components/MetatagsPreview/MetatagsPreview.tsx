import { useMantineTheme } from "@mantine/core";
import { CodeHighlight } from '@mantine/code-highlight';

const MetatagsPreview = ({ values }) => {
  const theme = useMantineTheme();

  const content = `
  {/* <!-- Primary Meta Tags --> */}
  <title>${values.title}</title>
  <meta name="title" content="${values.title}" />
  <meta name="description" content="${values.description}" />
  <meta name="author" content="${values.author}" />
  <meta name="robots" content="${values.robots?.join?.(',') || ''}" />
  <meta name="keywords" content="${values.keywords}" />
  <meta name="viewport" content="${values.viewport}" />

  {/* <!-- Open Graph / Facebook --> */}
  <meta property="og:type" content="${values.og_type}" />
  <meta property="og:url" content="${values.og_url}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="${values.og_title}" />
  <meta property="og:description" content="${values.og_description}" />
  <meta property="og:image" content="${values.og_image}" />

  {/* <!-- Twitter --> */}
  <meta property="twitter:creator" content="${values.twitter_creator}" />
  <meta property="twitter:card" content="${values.twitter_card}" />
  <meta property="twitter:url" content="${values.twitter_site}" />
  <meta property="twitter:image:alt" content="${values.twitter_image}" />
  <meta property="twitter:title" content="${values.twitter_title}" />
  <meta property="twitter:description" content="${values.twitter_description}" />
  <meta property="twitter:image" content="${values.twitter_image}" />
  <meta property="twitter:site" content="${values.twitter_site}" />
  <meta name="twitter:app:id:iphone" content="${values.twitter_app_id_iphone}" />
  <meta name="twitter:app:name:iphone" content="${values.twitter_app_name_iphone}" />
  <meta name="twitter:app:url:iphone" content="${values.twitter_app_url_iphone}" />
  <meta name="twitter:app:id:googleplay" content="${values.twitter_app_id_googleplay}" />
  <meta name="twitter:app:name:googleplay" content="${values.twitter_app_name_googleplay}" />
  <meta name="twitter:app:url:googleplay" content="${values.twitter_app_url_googleplay}" />
            `

  // TODO: replace with codehighlight component
  return (
    <>
      <CodeHighlight
        code={content}
        language="html"
        copyLabel="Copy code"
        copiedLabel="Copied!"
      />
      {/* <Code m={0} p={0}>
        <pre style={{ backgroundColor: 'black', color: 'white', padding: 20, borderRadius: 10, flexWrap: 'wrap', overflow: 'scroll', fontSize: 14, position: 'relative' }}>
          <Tooltip label="Copy">
            <CopyButton value={content}>
              {({ copied, copy }) => (
                <ActionIcon
                  onClick={() => {
                    notifications.show({
                      message: 'Copy to clipboard.',
                      color: 'green',
                      icon: <IconCheck size="1.2rem" />,
                      autoClose: true,
                    })
                    setTimeout(() => {
                      notifications.clean()
                    }, 2000)
                  }}
                  variant="transparent"
                  style={{ position: 'absolute', right: 20 }}
                >
                  <IconCopy />
                </ActionIcon>
              )}
            </CopyButton>

          </Tooltip>
          {content}
        </pre>
      </Code> */}
    </>
  )
}

export default MetatagsPreview