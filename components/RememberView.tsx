"use client";

import { useEffect } from "react";
import { useStore } from "@/components/store";
import { track } from "@/components/pixel";
import { CURRENCY } from "@/lib/site";

export function RememberView({
  handle,
  name,
  price,
}: {
  handle: string;
  name: string;
  price: number;
}) {
  const { remember } = useStore();

  useEffect(() => {
    remember(handle);
    track("ViewContent", {
      content_name: name,
      content_ids: [handle],
      value: price,
      currency: CURRENCY,
    });
  }, [handle, name, price, remember]);

  return null;
}
