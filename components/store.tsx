"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Department, Gender } from "@/lib/products";
import {
  readJson,
  writeJson,
  parseSizePrefs,
  sizeKey,
  isKeptSize,
  STORAGE_KEYS,
  type BagLine,
  type SizePrefs,
  type WishlistItem,
} from "@/lib/storage";

type Store = {
  bag: BagLine[];
  wishlist: WishlistItem[];
  viewed: string[];
  sizePrefs: SizePrefs;
  bagOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  setBagOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  addToBag: (line: BagLine) => void;
  addLines: (lines: BagLine[]) => void;
  updateQty: (variantId: string, quantity: number) => void;
  removeFromBag: (variantId: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isWished: (handle: string) => boolean;
  remember: (handle: string) => void;
  sizeFor: (gender: Gender, department: Department, subcategory?: string) => string | undefined;
  rememberSize: (
    gender: Gender,
    department: Department,
    size: string,
    subcategory?: string,
  ) => void;
  setSizePref: (gender: Gender, department: Department, size: string, subcategory?: string) => void;
};

const StoreContext = createContext<Store | null>(null);

let lockedY = 0;

function lockScroll(locked: boolean) {
  const root = document.documentElement;
  const body = document.body;
  const isLocked = body.classList.contains("lock-scroll");
  if (locked) {
    if (!isLocked) {
      lockedY = window.scrollY;
      body.style.top = `-${lockedY}px`;
      root.classList.add("lock-scroll");
      body.classList.add("lock-scroll");
    }
    return;
  }
  if (!isLocked) return;
  root.classList.remove("lock-scroll");
  body.classList.remove("lock-scroll");
  body.style.top = "";
  window.scrollTo(0, lockedY);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [bag, setBag] = useState<BagLine[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [viewed, setViewed] = useState<string[]>([]);
  const [sizePrefs, setSizePrefs] = useState<SizePrefs>({});
  const [sizesReady, setSizesReady] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBag(readJson<BagLine[]>(STORAGE_KEYS.bag, []));
    setWishlist(readJson<WishlistItem[]>(STORAGE_KEYS.wishlist, []));
    setViewed(readJson<string[]>(STORAGE_KEYS.viewed, []));
    const loaded = parseSizePrefs(readJson(STORAGE_KEYS.sizes, {}));
    setSizePrefs((current) => ({ ...loaded, ...current }));
    setSizesReady(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeJson(STORAGE_KEYS.bag, bag);
  }, [bag, ready]);

  useEffect(() => {
    if (ready) writeJson(STORAGE_KEYS.wishlist, wishlist);
  }, [wishlist, ready]);

  useEffect(() => {
    if (ready) writeJson(STORAGE_KEYS.viewed, viewed);
  }, [viewed, ready]);

  useEffect(() => {
    if (sizesReady) writeJson(STORAGE_KEYS.sizes, sizePrefs);
  }, [sizePrefs, sizesReady]);

  useEffect(() => {
    const shouldLock = bagOpen || searchOpen || menuOpen;
    lockScroll(shouldLock);
    return () => {
      if (shouldLock) lockScroll(false);
    };
  }, [bagOpen, searchOpen, menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBagOpen(false);
        setSearchOpen(false);
        setMenuOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        setBagOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mergeLines = useCallback((current: BagLine[], lines: BagLine[]) => {
    let next = current;
    for (const line of lines) {
      const existing = next.find((item) => item.variantId === line.variantId);
      if (existing) {
        next = next.map((item) =>
          item.variantId === line.variantId
            ? { ...item, quantity: item.quantity + line.quantity }
            : item,
        );
      } else {
        next = [...next, line];
      }
    }
    return next;
  }, []);

  const addToBag = useCallback((line: BagLine) => {
    setBag((current) => mergeLines(current, [line]));
    setBagOpen(true);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [mergeLines]);

  const addLines = useCallback((lines: BagLine[]) => {
    if (lines.length === 0) return;
    setBag((current) => mergeLines(current, lines));
    setBagOpen(true);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [mergeLines]);

  const updateQty = useCallback((variantId: string, quantity: number) => {
    setBag((current) =>
      current
        .map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromBag = useCallback((variantId: string) => {
    setBag((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((current) => {
      if (current.some((entry) => entry.handle === item.handle)) {
        return current.filter((entry) => entry.handle !== item.handle);
      }
      return [item, ...current].slice(0, 60);
    });
  }, []);

  const isWished = useCallback(
    (handle: string) => wishlist.some((item) => item.handle === handle),
    [wishlist],
  );

  const remember = useCallback((handle: string) => {
    setViewed((current) => [handle, ...current.filter((item) => item !== handle)].slice(0, 12));
  }, []);

  const sizeFor = useCallback(
    (gender: Gender, department: Department, subcategory?: string) => {
      const key = sizeKey(gender, department, subcategory);
      return key ? sizePrefs[key] : undefined;
    },
    [sizePrefs],
  );

  const setSizePref = useCallback(
    (gender: Gender, department: Department, size: string, subcategory?: string) => {
      const key = sizeKey(gender, department, subcategory);
      if (!key) return;
      setSizePrefs((current) => {
        if (!isKeptSize(size)) {
          if (!(key in current)) return current;
          const next = { ...current };
          delete next[key];
          return next;
        }
        const kept = size.trim();
        if (current[key] === kept) return current;
        return { ...current, [key]: kept };
      });
    },
    [],
  );

  const rememberSize = useCallback(
    (gender: Gender, department: Department, size: string, subcategory?: string) => {
      if (!isKeptSize(size)) return;
      setSizePref(gender, department, size, subcategory);
    },
    [setSizePref],
  );

  const value = useMemo(
    () => ({
      bag,
      wishlist,
      viewed,
      sizePrefs,
      bagOpen,
      searchOpen,
      menuOpen,
      setBagOpen,
      setSearchOpen,
      setMenuOpen,
      addToBag,
      addLines,
      updateQty,
      removeFromBag,
      toggleWishlist,
      isWished,
      remember,
      sizeFor,
      rememberSize,
      setSizePref,
    }),
    [
      bag,
      wishlist,
      viewed,
      sizePrefs,
      bagOpen,
      searchOpen,
      menuOpen,
      addToBag,
      addLines,
      updateQty,
      removeFromBag,
      toggleWishlist,
      isWished,
      remember,
      sizeFor,
      rememberSize,
      setSizePref,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}
