"use client";

import { usePathname } from "next/navigation";
import FooterComponent from "@/components/landing/footer";

const HIDDEN_FOOTER_PATHS = [
  "/account/setup",
];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isHidden = HIDDEN_FOOTER_PATHS.some((path) => pathname.startsWith(path));

  if (isHidden) return null;

  return <FooterComponent />;
}
