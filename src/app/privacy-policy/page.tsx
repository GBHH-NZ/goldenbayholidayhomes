import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("privacy-policy");

export default function Page() {
  return <StaticPage slug="privacy-policy" />;
}
