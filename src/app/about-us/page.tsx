import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("about-us");

export default function Page() {
  return <StaticPage slug="about-us" />;
}
