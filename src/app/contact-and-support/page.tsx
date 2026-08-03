import type { Metadata } from "next";
import { StaticPage, pageMeta } from "@/components/StaticPage";

export const generateMetadata = async (): Promise<Metadata> =>
  pageMeta("contact-and-support");

export default function Page() {
  return <StaticPage slug="contact-and-support" />;
}
