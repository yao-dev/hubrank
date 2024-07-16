
"use client";;
import { loadStripe } from '@stripe/stripe-js';
import { useCallback } from 'react';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { stripeUrls } from './constants';
import useUser from '@/hooks/useUser';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export const useStripe = ({
  priceId,
  metadata = {},
}: {
  priceId: string;
  metadata?: { [key: string]: any };
}): {
  openCheckout: () => Promise<void>
} => {
  const user = useUser();
  const openCheckout = useCallback(async () => {
    // Create a Checkout Session
    const { data } = await axios.post(stripeUrls.CREATE_CHECKOUT_SESSION, {
      price_id: priceId,
      customer_id: user.customer_id,
      customer_email: user.email,
      metadata
    });
    window.location.href = data.checkoutSessionUrl;
  }, [priceId, user, metadata]);

  return {
    openCheckout
  }
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => {
      return axios.get(stripeUrls.GET_PRODUCTS)
    },
    select(data) {
      return data.data.products.data ?? []
    },
    gcTime: 0,
  });
}

export const useProductPrices = (productIds: string[] = []) => {
  return useQuery({
    enabled: !!productIds.length,
    queryKey: ["prices", productIds],
    queryFn: () => {
      return axios.post(stripeUrls.GET_PRICES, {
        ids: productIds
      })
    },
    select(data) {
      return data?.data?.prices?.data ?? []
    },
    gcTime: 0,
  });

}

export const useUserSubscriptions = (customerId: string) => {
  const { data } = useQuery({
    queryKey: ['subscriptions', { customerId }],
    queryFn: () => {
      return axios.post(stripeUrls.USER_SUBSCRIPTIONS, { customerId })
    },
    select(data) {
      return data.data.subscriptions ?? []
    },
    gcTime: 0,
  });
  return data ?? []
}

export const usePricing = () => {
  const user = useUser();
  const customerId = user?.customer_id
  const userSubscriptions = useUserSubscriptions(customerId)
  const productsQuery = useProducts();
  const pricesQuery = useProductPrices(productsQuery.data?.map((i: any) => i.id));
  const pricesByProductId: any = {};
  const subscriptionsByPriceId: any = {};

  const redirectToCustomerPortal = useMutation({
    mutationFn: () => {
      return axios.post(stripeUrls.CUSTOMER_PORTAL, { customerId })
    },
    onSuccess(data) {
      window.location.href = data.data.url
    }
  })

  productsQuery.data?.forEach((product: any) => {
    pricesByProductId[product.id] = pricesQuery.data?.find((price: any) => price.active && price.product === product.id)
  })

  userSubscriptions.forEach((userSubscription: any) => {
    subscriptionsByPriceId[userSubscription.plan.id] = userSubscription
  });

  return {
    products: productsQuery.data ?? [],
    prices: pricesByProductId,
    userSubscriptions: subscriptionsByPriceId,
    redirectToCustomerPortal,
    isLoading: productsQuery.isPending || pricesQuery.isPending
  }
}