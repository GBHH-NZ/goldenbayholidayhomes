import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("price-match");

export default function Page() {
  return <StaticPage slug="price-match" />;
}
