const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    vendor
    productType
    tags
    availableForSale
    descriptionHtml
    images(first: 8) {
      nodes {
        url
      }
    }
    variants(first: 100) {
      nodes {
        id
        availableForSale
        quantityAvailable
        price {
          amount
        }
        compareAtPrice {
          amount
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const SEARCHED_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query SearchedProducts($cursor: String, $query: String, $first: Int = 50) {
    products(
      first: $first
      after: $cursor
      query: $query
      sortKey: CREATED_AT
      reverse: true
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const NEWEST_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query NewestProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

/** Header taxonomy only — tags, vendor, one image. One page per gender. */
export const NAV_PAGE_QUERY = /* GraphQL */ `
  query NavPage($query: String!) {
    products(first: 250, query: $query, sortKey: BEST_SELLING) {
      nodes {
        handle
        title
        vendor
        productType
        tags
        availableForSale
        images(first: 1) {
          nodes {
            url
          }
        }
      }
    }
  }
`;

/** Houses directory only — vendor + one still. Bounded pages, not a catalog walk. */
export const VENDOR_PAGE_QUERY = /* GraphQL */ `
  query VendorPage($cursor: String, $sortKey: ProductSortKeys = BEST_SELLING, $reverse: Boolean = false) {
    products(first: 250, after: $cursor, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        vendor
        availableForSale
        images(first: 1) {
          nodes {
            url
          }
        }
      }
    }
  }
`;

export const HANDLES_PAGE_QUERY = /* GraphQL */ `
  query HandlesPage($cursor: String) {
    products(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
      }
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 250) {
          nodes {
            quantity
            merchandise {
              ... on ProductVariant {
                id
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation NewsletterCustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;
