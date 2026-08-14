"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { scrollIframePanelIntoView } from "@/components/BookingEmbedPanel";
import {
  defaultGuestyPropertiesUrl,
  guestyPropertiesUrl,
  type GuestySearchParams,
} from "@/lib/guesty/properties-url";

export type CatalogueSearch = {
  checkIn?: string;
  checkOut?: string;
  guests: number;
  city?: string;
};

type GuestyEmbedContextValue = {
  iframeSrc: string;
  showCatalogue: boolean;
  filtered: boolean;
  iframeHeight: number | undefined;
  resultsId: string;
  lastSearch: CatalogueSearch | null;
  setIframeHeight: (height: number | undefined) => void;
  openProperty: (url: string) => void;
  openSearch: (params: GuestySearchParams) => void;
  clear: () => void;
};

const GuestyEmbedContext = createContext<GuestyEmbedContextValue | null>(null);

function scrollToResults(resultsId: string) {
  requestAnimationFrame(() => {
    scrollIframePanelIntoView(document.getElementById(resultsId));
  });
}

export function GuestyEmbedProvider({
  children,
  resultsId = "book-online-results",
}: {
  children: ReactNode;
  resultsId?: string;
}) {
  const [iframeSrc, setIframeSrc] = useState(() => defaultGuestyPropertiesUrl());
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [filtered, setFiltered] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number | undefined>();
  const [lastSearch, setLastSearch] = useState<CatalogueSearch | null>(null);

  const openProperty = useCallback(
    (url: string) => {
      setIframeSrc(url);
      setFiltered(true);
      setShowCatalogue(true);
      setIframeHeight(undefined);
      scrollToResults(resultsId);
    },
    [resultsId],
  );

  const openSearch = useCallback(
    (params: GuestySearchParams) => {
      const guests = params.guests ?? params.adults ?? 1;
      const city = params.city?.trim() || undefined;
      setIframeSrc(
        guestyPropertiesUrl({
          ...params,
          guests,
          adults: params.adults ?? guests,
        }),
      );
      setFiltered(
        Boolean(params.checkIn || params.checkOut || city || guests > 1),
      );
      setLastSearch({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests,
        city,
      });
      setShowCatalogue(true);
      setIframeHeight(undefined);
      scrollToResults(resultsId);
    },
    [resultsId],
  );

  const clear = useCallback(() => {
    setIframeSrc(defaultGuestyPropertiesUrl());
    setIframeHeight(undefined);
    setFiltered(false);
    setShowCatalogue(false);
    setLastSearch(null);
  }, []);

  const value = useMemo(
    () => ({
      iframeSrc,
      showCatalogue,
      filtered,
      iframeHeight,
      resultsId,
      lastSearch,
      setIframeHeight,
      openProperty,
      openSearch,
      clear,
    }),
    [
      iframeSrc,
      showCatalogue,
      filtered,
      iframeHeight,
      resultsId,
      lastSearch,
      openProperty,
      openSearch,
      clear,
    ],
  );

  return (
    <GuestyEmbedContext.Provider value={value}>
      {children}
    </GuestyEmbedContext.Provider>
  );
}

/** Returns null when no provider is present (e.g. /homes page). */
export function useGuestyEmbed(): GuestyEmbedContextValue | null {
  return useContext(GuestyEmbedContext);
}

export function useGuestyEmbedRequired(): GuestyEmbedContextValue {
  const value = useContext(GuestyEmbedContext);
  if (!value) {
    throw new Error("useGuestyEmbedRequired must be used within GuestyEmbedProvider");
  }
  return value;
}
