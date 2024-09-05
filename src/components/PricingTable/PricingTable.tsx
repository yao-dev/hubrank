'use client';;
import { Badge, Button, Card, Flex, Modal, Spin, Tag, theme, Typography } from "antd";
import { useEffect, useState } from "react";
import { Product } from "@billing-js/react-billing-js";
import PageTitle from "@/components/PageTitle/PageTitle";
import { usePricing, useStripe } from "@/features/payment/hooks";
import * as CurrencyFormat from 'react-currency-format';
import { currencies } from "@/features/payment/constants";
import { IconCheck } from "@tabler/icons-react";
import { stripeUnixTimestampToDate } from "@/features/payment/helpers";
import { format } from "date-fns";
import useUser from "@/hooks/useUser";

type Props = {
  title?: string;
  subtitle?: string;
}

export default function PricingTable({ title, subtitle }: Props) {
  const tokens = theme.useToken();
  const user = useUser();
  const { products, prices, userSubscriptions, redirectToCustomerPortal, isLoading } = usePricing();
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const { openCheckout } = useStripe({
    priceId: selectedProduct?.default_price,
    metadata: selectedProduct?.metadata ?? {}
  });

  useEffect(() => {
    if (selectedProduct) {
      setIsCheckoutLoading(true)
      openCheckout().finally(() => {
        setIsCheckoutLoading(false)
      })
    }
  }, [selectedProduct, openCheckout]);

  const onCancelPlan = () => {
    Modal.confirm({
      type: "warning",
      title: 'Cancel subscription',
      content: 'Are you sure you want to cancel?',
      centered: true,
      onCancel: () => redirectToCustomerPortal.mutate(),
      okText: "Cancel",
      cancelText: "Continue",
      closable: true,
    });
  }

  const onDowngradePlan = () => {
    Modal.confirm({
      type: "info",
      title: 'Downgrade subscription',
      content: 'You won\'t lose your current credits',
      centered: true,
      onCancel: () => redirectToCustomerPortal.mutate(),
      okText: "Cancel",
      cancelText: "Continue",
      closable: true
    });
  }

  const onUpgradePlan = () => {
    redirectToCustomerPortal.mutate()
  }

  return (
    <Spin spinning={redirectToCustomerPortal.isPending || isCheckoutLoading || isLoading}>
      <Flex vertical align="center" gap="large">
        <Flex vertical gap="small" align="center">
          {title && <PageTitle title={title} style={{ margin: "14px 0", marginBottom: subtitle ? 0 : undefined }} />}
          {subtitle && <PageTitle subtitle title={subtitle} style={{ fontSize: 16, fontWeight: 400, color: "grey" }} />}
        </Flex>
        <Flex vertical gap="large">
          <Flex vertical>
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

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {products.map((product: Product) => {
                  if (!product?.id) return null;

                  const bestValueSubscription = product.metadata.best_value;
                  const mostPopularSubscription = product.metadata.most_popular;
                  const currentPrice = prices[product.id]
                  const subscription: any = Object.values(userSubscriptions)?.[0];
                  const hasSubscription = !!subscription;
                  const isSubscribed = subscription?.plan?.id === currentPrice?.id;
                  const price = currentPrice?.unit_amount_decimal / 100
                  const safePrice = isNaN(price) ? 0 : price

                  const pricing = (
                    <Card key={product.id} className="w-full rounded-lg" style={{ borderColor: mostPopularSubscription ? tokens.token.colorPrimary : undefined, borderWidth: 2 }}>
                      <Flex vertical>
                        <Flex align="center" gap="small" style={{ marginBottom: 4 }}>
                          <Typography.Text strong style={{ fontSize: 20 }}>{product.name}</Typography.Text>
                          {isSubscribed && !subscription?.cancel_at && subscription?.current_period_end && <div><Tag color="green">Renews {format(stripeUnixTimestampToDate(subscription.current_period_end), "d MMM")}</Tag></div>}
                          {isSubscribed && subscription?.cancel_at && <div><Tag color="volcano">Cancels {format(stripeUnixTimestampToDate(subscription.cancel_at), "d MMM")}</Tag></div>}
                        </Flex>
                        <Typography.Text type="secondary" style={{ marginBottom: 12 }}>{product.description}</Typography.Text>

                        <Flex vertical gap="small">
                          <Flex align="baseline">
                            <Typography.Text style={{ fontSize: 42, fontWeight: 800 }}>
                              <CurrencyFormat
                                value={safePrice}
                                displayType={'text'}
                                prefix={currencies[currentPrice?.currency?.toUpperCase()]?.symbol}
                              />
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ position: "relative", bottom: 2 }}>/month</Typography.Text>
                          </Flex>

                          {isSubscribed ? (
                            <Flex vertical gap="small">
                              {subscription?.cancel_at ? (
                                <Button
                                  size="large"
                                  onClick={() => redirectToCustomerPortal.mutate()}
                                >
                                  Renew plan
                                </Button>
                              ) : (
                                <Button
                                  size="large"
                                  onClick={() => onCancelPlan()}
                                >
                                  Cancel plan
                                </Button>
                              )}
                            </Flex>
                          ) : (
                            <Button
                              size="large"
                              href={user ? undefined : "/login"}
                              onClick={() => {
                                if (!hasSubscription) {
                                  return setSelectedProduct(product)
                                }

                                const downgrade = subscription.plan.amount > currentPrice.unit_amount;
                                const upgrade = subscription.plan.amount < currentPrice.unit_amount;

                                if (hasSubscription && downgrade) {
                                  return onDowngradePlan();
                                }
                                if (hasSubscription && upgrade) {
                                  return onUpgradePlan();
                                }
                              }}
                              style={{
                                backgroundColor: tokens.token.colorPrimary,
                                color: "#FFF",
                                border: "1px solid transparent",
                                boxShadow: "0 2px 0 rgba(5, 55, 255, 0.06)"
                              }}
                            >
                              {hasSubscription ? "Switch plan" : !user ? "Try for FREE" : "Subscribe"}
                            </Button>
                            // <Button onClick={products[2].selectedPricing.onSelectPricing}>
                            //   switch plan
                            // </Button>
                          )}

                          <Flex vertical gap="large">
                            <Flex vertical gap="small">
                              {product?.marketing_features?.map?.((feature) => {
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
                        </Flex>
                      </Flex>
                    </Card>
                  );

                  if (mostPopularSubscription) {
                    return (
                      <Badge.Ribbon key={product.id} text="Most popular" color="green">
                        {pricing}
                      </Badge.Ribbon>
                    )
                  }

                  if (bestValueSubscription) {
                    return (
                      <Badge.Ribbon key={product.id} text="Best value" color="gold">
                        {pricing}
                      </Badge.Ribbon>
                    )
                  }

                  return pricing
                })}
              </div>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Spin>
  )
}