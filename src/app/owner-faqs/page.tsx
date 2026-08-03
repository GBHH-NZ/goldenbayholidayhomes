import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("owner-faqs");

export default function Page() {
  return <StaticPage slug="owner-faqs" />;
}
