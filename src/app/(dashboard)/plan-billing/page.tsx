'use client';
import { getUser, getUserEmail } from "@/helpers/user";
import { Button, Card, Col, Flex, Row, Tabs, Tag, theme, Typography } from "antd";
import { useEffect, useState } from "react";
import {
  useProducts,
  PaymentModal,
  CustomerPortal,
  CustomerProfile,
  PaymentMethods,
  InvoicesHistory,
  Product,
} from "@billing-js/react-billing-js";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleFilled } from "@ant-design/icons";
import { BillingProvider, BillingErrorType, useAuth } from "@billing-js/react-billing-js";
import axios from "axios";
import PageTitle from "@/components/PageTitle/PageTitle";

const StripeConsumer = () => {
  const [user, setUser] = useState<any>();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const tokens = theme.useToken();
  console.log(tokens.token.colorPrimary)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 500);
  }, [])

  const {
    // isLoading, // loading state
    // products: [premiumPlan], // list of the products fetched
    products,
    activeSubscriptions, // list of active subscriptions of the user
    pricingFilter: {
      currency: {
        selectedCurrency, // current currency (USD by default)
        availableCurrencies, // list of the available currencies
        setCurrency // function to set the desired currency
      },
      recurrence: {
        selectedRecurrence, // current recurrence
        availableRecurrences, // list of the available recurrences
        setRecurrence // function to set the desired recurrence
      }
    }
  } = useProducts([
    "prod_PX3l49am87ELev", // starter
    "prod_PX5569uBv4gEPI", // growth
    "prod_PX57RVaevinnHf", // business
  ], {
    modal: {
      maskClassName: "bg-white opacity-75", // modal mask class name
      showPromotionCodeInput: false,
    },
    // set the name of the customer if you have it
    // (i.e. the user is sign in already and you know their name)
    // defaultCustomerName: getCustomerName(),

    // Normalize all the display prices on the given recurrence
    // in this case, all prices will be displayed as their monthly equivalent
    // so if a product cost 120$/year it will be displayed as 10$/month
    // this is useful for the user to compare the different prices
    // without having to do some conversions
    normalizePriceOnRecurrence: "monthly",
    // Default currency to filter the prices with
    defaultCurrency: "usd",
    // Default recurrence to filter the prices with
    defaultRecurrence: "monthly",
    // Callback when payment is successful
    onPaymentSuccessful: () => window.location.reload(),
    // Callback when payment is unsuccessful
    onPaymentError: (error: unknown) => console.log(`Payment error`, error)
  })


  useEffect(() => {
    (async () => {
      const result = await getUser();
      setUser(result);
    })()
  }, []);


  const onChange = (key: string) => {
    setActiveTab(key)
    router.push(`/plan-billing?tab=${key}`)
  };

  const activeProducts = products.filter((i) => i.active);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <PaymentModal />
      <PageTitle title="Plan & Billing" />
      <Flex vertical gap="small">
        {/* <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Plan & Billing</Typography.Title> */}
        <CustomerPortal options={{ enableSubscriptionTransfer: true }}>
          <Tabs
            // tabPosition="left"
            defaultActiveKey="profile"
            activeKey={activeTab}
            onChange={onChange}
            items={[
              {
                key: 'profile',
                label: 'Profile',
                children: (
                  <Row>
                    <Col span={8}>
                      <CustomerProfile />
                      <PaymentMethods />
                    </Col>
                  </Row>
                ),
              },
              // {
              //   key: 'subscription',
              //   label: 'Subscription',
              //   children: (
              //     <Row>
              //       <Col span={10}>
              //       {/* from @billing-js/react-billing-js */}
              //         <Subscriptions />
              //       </Col>
              //     </Row>
              //   ),
              // },
              {
                key: 'plan',
                label: 'Plan',
                children: (
                  <Flex vertical gap="large">
                    <Flex vertical>
                      <PageTitle title="Subscriptions" subtitle />
                      <Flex vertical gap={32} style={{ marginTop: 24, width: "fit-content" }}>

                        {/* <Flex gap="middle" justify="center">
                      <Typography.Text strong={selectedRecurrence?.name === "monthly"}>Billed monthly</Typography.Text>
                      <Switch
                        defaultValue={selectedRecurrence?.name === "yearly"}
                        onChange={(value) => {
                          setRecurrence(availableRecurrences.find(i => {
                            // console.log(value, i)
                            return !value ? i.name === "monthly" : i.name === "yearly"
                          }))
                        }}
                      />
                      <Flex gap="small">
                        <Typography.Text strong={selectedRecurrence?.name === "yearly"}>Billed yearly</Typography.Text>
                        <Tag color={selectedRecurrence?.name === "yearly" ? tokens.token.colorPrimary : undefined}>2 months FREE</Tag>
                      </Flex>
                    </Flex> */}

                        <Flex gap="middle" justify="center">
                          {activeProducts.map((product: Product, index) => {
                            if (!product?.id) return null;

                            const activeSubscriptionId = activeSubscriptions?.[0]?.items?.data?.[0]?.price?.id
                            const currentPricing = product.pricings.find(pricing => selectedRecurrence.name.startsWith(pricing.recurring.interval));
                            const isActivePlan = activeSubscriptionId === currentPricing?.id;
                            const isUpgrade = currentPricing?.unit_amount > activeSubscriptions?.[0]?.items?.data?.[0]?.price?.unit_amount;

                            console.log(currentPricing?.unit_amount, activeSubscriptions?.[0]?.items?.data?.[0]?.price?.unit_amount)

                            return (
                              <Card key={product.id} style={{ width: 350 }}>
                                <Flex vertical>
                                  <Flex align="center" gap="small" style={{ marginBottom: 4 }}>
                                    <Typography.Text strong style={{ fontSize: 20 }}>{product.name}</Typography.Text>
                                    {isActivePlan && <div><Tag color="green">active</Tag></div>}
                                  </Flex>
                                  <Typography.Text type="secondary" style={{ marginBottom: 24 }}>{product.description}</Typography.Text>

                                  <Flex vertical gap="large">
                                    <Typography.Text>
                                      <Typography.Text strong style={{ fontSize: 24 }}>
                                        {product.selectedPricing.priceFormatted?.replace?.(".00", "")}</Typography.Text><Typography.Text type="secondary">/{product.selectedPricing.pricingRecurrence} {/* /month */}</Typography.Text>
                                    </Typography.Text>

                                    {isActivePlan ? (
                                      <Button size="large" onClick={() => { }}>Cancel plan</Button>
                                    ) : (
                                      <Button
                                        size="large"
                                        onClick={product.selectedPricing.onSelectPricing}
                                        style={{
                                          backgroundColor: tokens.token.colorPrimary,
                                          color: "#FFF",
                                          border: "1px solid transparent",
                                          boxShadow: "0 2px 0 rgba(5, 55, 255, 0.06)"
                                        }}
                                      >
                                        {isUpgrade ? "Upgrade" : "Downgrade"}
                                      </Button>
                                      // <Button onClick={products[2].selectedPricing.onSelectPricing}>
                                      //   switch plan
                                      // </Button>
                                    )}

                                    <Flex vertical gap="large">
                                      <Flex vertical gap="small">
                                        {product?.features?.map?.((feature) => {
                                          return (
                                            <Flex key={feature.name} gap="middle">
                                              <CheckCircleFilled
                                                style={{
                                                  fontSize: 22,
                                                  color: "#353b48",
                                                  // color: tokens.token.colorPrimary
                                                }}
                                              />
                                              <Typography.Text>{feature.name}</Typography.Text>
                                            </Flex>
                                          )
                                        })}
                                        {/* <Flex gap="middle">
                                <CloseCircleFilled style={{ fontSize: 22 }} />
                                <Typography.Text>5 workspaces</Typography.Text>
                              </Flex> */}
                                      </Flex>


                                    </Flex>
                                  </Flex>
                                </Flex>
                              </Card>
                            )
                          })}
                        </Flex>
                      </Flex>
                    </Flex>
                    {/* <Flex vertical>
                      <PageTitle title="Credits" subtitle />
                    </Flex> */}
                  </Flex>
                )
              },
              {
                key: 'billing-history',
                label: 'Billing history',
                children: (
                  <Row>
                    <Col span={12}>
                      <InvoicesHistory />
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
        </CustomerPortal>
      </Flex>
    </>
  )
}

export default function PlanAndBilling() {
  const { signIn, signOut } = useAuth();
  return (
    <div>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@billing-js/react-billing-js/styles.css"></link>
      <BillingProvider
        // [Optional] default to false (test mode)
        // switch between live and test mode
        liveMode={process.env.ENVIRONMENT === "production"}
        stripeAccount={process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID || ""} // Your stripe account id that you can find in the billing.js dashboard (https://billingjs.com)
        options={{
          // whether the link to the terms and conditions should be shown on the payment modal
          showTermsAndConditions: true,
          // whether the link to the privacy policy should be shown on the payment moda
          showPrivacyPolicy: true,
          // URL to redirect the user when they click
          // on the "terms and conditions" link
          termsAndConditionsUrl: "/terms",
          // used for the privacy policy link in the payment modal
          privacyPolicyUrl: "/privacy",
          // URL of the pricing page to redirect the user
          // when they click on "Update subscription"
          // used to redirect the user when they want to
          // update their subscription or add a new subscription
          productPageUrl: "/plan-billing?tab=plan",
          // used to redirect the user from the pricing page when
          // they have an active subscription
          customerPortalUrl: "/plan-billing?tab=plan",
          // options for the cancel modal that opens when a user click on "Cancel subscription"
          cancelSubscriptionOptions: {
            // whether the modal should be shown to the user
            // or the subscription should be canceled directly
            showModal: true,
            // the message that will be displayed when the modal is opened
            cancelMessage: "Are you sure you want to cancel your subscription? You will lose access the premium features provided by your current plan.",
          }
        }}
        // [Optional]
        // getEmailHmac is called when no user is signed in and:
        // A. The user wants to access their customer portal
        // B. The user wants to update their subscription
        // C. A new user wants to start a new subscription
        //
        // This function has to return a JSON object containing the email address
        // and the corresponding hmac ({ email, hmac }). This object can be returned
        // from a Promise (like in the example below)
        // If this function returns undefined or null, Billing will ask the user
        // for their email address, send an email with a link to sign them in.
        getEmailHmac={async () => {
          console.log("getEmailHmac")
          // to sign in as a demo you can simply directly
          // return the following object:
          /*
          ** return { email: "demo@billingjs.com" }
          */
          //
          // to sign in your user using SSO you need to return the email and hmac
          // you can read how to setup SSO on your backend from this page
          const user_email = await getUserEmail();
          console.log({ user_email })
          const { data } = await axios.post("/api/stripe/sso", {
            user_email
          });
          return {
            email: data.email,
            hmac: data.hmac
          }
        }}

        // [Optional]
        // called when the customer has signed in on Billing
        onCustomerSignedIn={() => {
          console.log("onCustomerSignedIn");
          signIn()
        }}

        // [Optional]
        // called when Billing has to sign out the user
        // (ex: after transferring the account)
        onCustomerSignedOut={() => {
          console.log("onCustomerSignedOut")
          signOut()
          // window.open("/signOut", "_self")
        }}

        // [Optional]
        // called when an error occurred and was not handled
        onError={(error: any) => {
          console.error("BillingProvider - error", { error })
          if (
            error.type === BillingErrorType.customer_not_found ||
            error.type === BillingErrorType.stripe_account_not_found
          ) {
            console.log("Error - should sign out")
            // window.open("/signOut", "_self")
          }
        }}
      >
        <StripeConsumer />
      </BillingProvider>
    </div>
  )
}