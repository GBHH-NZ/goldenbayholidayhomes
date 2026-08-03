import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("cancellation-policy");

export default function Page() {
  return <StaticPage slug="cancellation-policy" />;
}
