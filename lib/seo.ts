import { COMPANY, CURRENCY, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";
import type { Product } from "@/lib/products";

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: COMPANY.legalName,
    url: SITE_URL,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    vatID: COMPANY.vatId,
    sameAs: SOCIAL.map((item) => item.href),
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.streetAddress,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.addressLocality,
      addressCountry: COMPANY.addressCountry,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images,
    description: product.description,
    url: absoluteUrl(`/product/${product.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: CURRENCY,
      price: product.price,
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${product.slug}`),
    },
  };
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
