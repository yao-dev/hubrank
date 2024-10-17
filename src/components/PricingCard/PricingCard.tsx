'use client';;
import { Button, Card, Flex, Slider, Typography } from "antd";
import * as CurrencyFormat from 'react-currency-format';
import { IconCheck } from "@tabler/icons-react";
import { APP_URL } from "@/helpers/url";
import { useState } from "react";
import useUser from "@/hooks/useUser";
import { checkout } from "@/app/app/actions";

const ONE_ARTICLE_WORD_COUNT = 1500;
const DEFAULT_WORDS = ONE_ARTICLE_WORD_COUNT * 10 * 3;

type Props = {
  borderless?: boolean;
  title?: string;
  subtitle?: string;
}

const PricingCard = ({
  borderless,
  title,
  subtitle
}: Props) => {
  const user = useUser();
  const [words, setWords] = useState(DEFAULT_WORDS);

  let costPerWord;
  let pricingTitle;

  if (words >= ONE_ARTICLE_WORD_COUNT * 200) {
    pricingTitle = "Enterprise";
    costPerWord = 0.0009
  } else if (words >= ONE_ARTICLE_WORD_COUNT * 100) {
    pricingTitle = "Pro";
    costPerWord = 0.0010
  } else if (words >= ONE_ARTICLE_WORD_COUNT * 10) {
    pricingTitle = "Growth";
    costPerWord = 0.0011;
  } else {
    pricingTitle = "Starter";
    costPerWord = 0.0012;
  }

  const addOns = {
    keywords_research: Math.floor((words / ONE_ARTICLE_WORD_COUNT) * 5),
    ai_images: Math.floor((words / ONE_ARTICLE_WORD_COUNT) * 3),
  }
  const price = Math.round(costPerWord * words);
  const wordsCount = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(
    words,
  )

  return (
    <div>
      {/* <div className="flex flex-col justify-center gap-1">
        {title && <PageTitle title={title} style={{ margin: "14px 0", marginBottom: subtitle ? 0 : undefined }} />}
        {subtitle && <PageTitle subtitle title={subtitle} style={{ fontSize: 16, fontWeight: 400, color: "grey" }} />}
      </div> */}
      <Card className={`w-fit rounded-lg ${borderless ? "border-none" : "border-2"}`}>
        <Flex vertical>
          <p className="text-center text-xl font-bold mb-8">{pricingTitle}</p>

          <div className="flex items-baseline justify-center mb-6">
            <Typography.Text style={{ fontSize: 42, fontWeight: 800 }}>
              <CurrencyFormat
                value={price}
                displayType={'text'}
                prefix={"$"}
              />
            </Typography.Text>
          </div>

          {/* <Typography.Text type="secondary" style={{ marginBottom: 12 }}>200 credits</Typography.Text> */}

          <Slider
            className="mb-4"
            min={15000}
            max={450000}
            step={15000}
            defaultValue={DEFAULT_WORDS}
            tooltip={{ open: false }}
            onChange={setWords}
          />

          <p className="text-xl text-center font-bold mb-6">{wordsCount} words</p>


          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <Button
                size="large"
                type="primary"
                href={user ? undefined : `${APP_URL}?create_checkout=${words}`}
                onClick={async () => {
                  if (user) {
                    const checkoutSessionUrl = await checkout({
                      url: location.origin + location.pathname,
                      words,
                      customer_email: user.email,
                      referral: window?.promotekit_referral
                    })
                    window.location.href = checkoutSessionUrl;
                  }
                }}
                style={{
                  // backgroundColor: tokens.token.colorPrimary,
                  color: "#FFF",
                  border: "1px solid transparent",
                  boxShadow: "0 2px 0 rgba(5, 55, 255, 0.06)"
                }}
              >
                Buy Now
              </Button>
              <Typography.Text type="secondary" className="text-center text-xs">One time purchase</Typography.Text>
            </div>

            <Flex vertical gap="large">
              <Flex vertical gap="small">
                {[
                  // { name: `${words} words (~${words / ONE_ARTICLE_WORD_COUNT} blog posts of ${ONE_ARTICLE_WORD_COUNT} words)` },
                  { name: `${wordsCount} words (~${words / ONE_ARTICLE_WORD_COUNT} blog posts)` },
                  { name: `${addOns.keywords_research} Keywords research` },
                  { name: `${addOns.ai_images} AI images` },
                  { name: "SEO schema markups" },
                  { name: "Multi-language support" },
                  { name: "Youtube to blog/social media" },
                  { name: "Export in HTML & Markdown" },
                  { name: "Auto-publish with Zapier" },
                  { name: "In-article stock images" },
                  { name: "Auto-generated slug & meta description" }
                ].map((feature) => {
                  return (
                    <Flex key={feature.name} gap="middle">
                      <IconCheck
                        style={{
                          fontSize: 22,
                          // color: tokens.token.colorPrimary
                        }}
                      />
                      <Typography.Text type="secondary" style={{ fontWeight: 400 }}>{feature.name}</Typography.Text>
                    </Flex>
                  )
                })}
                {/* <Flex gap="middle">
              <CloseCircleFilled style={{ fontSize: 22 }} />
              <Typography.Text>5 workspaces</Typography.Text>
            </Flex> */}
              </Flex>
            </Flex>
          </div>
        </Flex>
      </Card>
    </div>
  )
}

export default PricingCard