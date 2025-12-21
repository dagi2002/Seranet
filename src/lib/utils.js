import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merge helper
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Centralized route mapping
export function createPageUrl(name) {
  const routes = {
    Landing: "/",
    Onboarding: "/onboarding",
    OnboardingComplete: "/onboarding-complete",
    Dashboard: "/dashboard",
    Products: "/products",
    Orders: "/orders",
    OrderDetail: "/order-detail",
    StoreSettings: "/store-settings",
    Storefront: "/storefront",
    ProductDetail: "/product-detail",
    Checkout: "/checkout",
    PaymentSuccess: "/payment-success",
  };

  return routes[name] || "/";
}
