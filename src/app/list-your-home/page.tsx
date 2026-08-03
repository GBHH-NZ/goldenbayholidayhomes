import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("list-your-home");

export default function Page() {
  return <StaticPage slug="list-your-home" />;
}
