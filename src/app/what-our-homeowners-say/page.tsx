import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("what-our-homeowners-say");

export default function Page() {
  return <StaticPage slug="what-our-homeowners-say" />;
}
