'use client';;
import PageTitle from "@/components/PageTitle/PageTitle";
import PricingCard from "@/components/PricingCard/PricingCard";

export default function Subscriptions() {
  return (
    <div className="container mx-auto px-6 lg:px-40 flex flex-col gap-16 md:flex-row items-center md:items-start md:justify-center">
      <div className="text-center md:text-left">
        <PageTitle title="Pricing" style={{ margin: "14px 0", marginBottom: 0 }} />
        <PageTitle subtitle title="Ready to outrank your competitors?" style={{ fontSize: 16, fontWeight: 400, color: "grey" }} />
      </div>
      <PricingCard />
    </div>
  )
}