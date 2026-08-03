import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("terms-and-conditions");

export default function Page() {
  return <StaticPage slug="terms-and-conditions" />;
}
