"use client";

import { Mail, MapPin, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { companyDetails, socialLinks, footerLinks } from "../helper/constant";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "../icons/social-icon";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface SocialProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const socialMediaLinks: SocialProps[] = [
  {
    icon: <FacebookIcon />,
    label: "Facebook",
    href: socialLinks.facebookLink,
  },
  {
    icon: <InstagramIcon />,
    label: "Instagram",
    href: socialLinks.instaLink,
  },
  {
    icon: <TwitterIcon />,
    label: "Twitter",
    href: socialLinks.twitterLink,
  },
  {
    icon: <YoutubeIcon />,
    label: "Youtube",
    href: socialLinks.youtubeLink,
  },
  {
    icon: <LinkedInIcon />,
    label: "LinkedIn",
    href: socialLinks.linkedIn,
  },
];

export default function FooterComponent() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Ensure theme is resolved after hydration
    if (resolvedTheme) {
      setIsDark(resolvedTheme === "dark");
    }
  }, [resolvedTheme]);

  return (
    <footer className="bg-secondary/40 dark:bg-secondary/20 w-full place-self-end rounded-t-xl">
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col items-start">
            <Image
              src={isDark ? companyDetails.darkLogo : companyDetails.lightLogo}
              alt="logo"
              className="flex h-14 md:h-16 w-fit object-contain sm:h-20 self-start shrink-0"
              width={32}
              height={32}
            />

            <p className="text-foreground/50 mt-6 max-w-md text-center leading-relaxed sm:max-w-xs sm:text-left">
              {companyDetails.description}
            </p>

            <ul className="w-full mt-8 flex items-center justify-center gap-6 sm:justify-start md:gap-8">
              {socialMediaLinks.map(
                ({ icon: SocialIcon, label, href }) =>
                  href && (
                    <li key={label}>
                      <Link
                        href={href}
                        className="hover:text-primary/80 transition"
                      >
                        <span className="sr-only">{label}</span>
                        {SocialIcon}
                      </Link>
                    </li>
                  ),
              )}


            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium">Information</p>
              <ul className="mt-8 space-y-4 text-sm">
                {footerLinks.about.map(({ lable, href }) => (
                  <li key={lable}>
                    <Link
                      className="hover:underline underline-offset-4 transition-all duration-700 ease-in-out"
                      href={href}
                    >
                      {lable}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-lg font-medium">Our Policies</p>
              <ul className="mt-8 space-y-4 text-sm">
                {footerLinks.policy.map(({ lable, href }) => (
                  <li key={lable}>
                    <Link
                      className="hover:underline underline-offset-4 transition-all duration-700 ease-in-out"
                      href={href}
                    >
                      {lable}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* <div className="text-center sm:text-left">
              <p className="text-lg font-medium">Helpful Links</p>
              <ul className="mt-8 space-y-4 text-sm">
                {footerLinks.help.map(({ lable, href, hasIndicator }) => (
                  <li key={lable}>
                    <a
                      href={href}
                      className={`${
                        hasIndicator
                          ? "group flex justify-center gap-1.5 sm:justify-start"
                          : "text-secondary-foreground/70 transition"
                      }`}
                    >
                      <span className="text-secondary-foreground/70 transition">
                        {lable}
                      </span>
                      {hasIndicator && (
                        <span className="relative flex size-2">
                          <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                          <span className="bg-green-500 relative inline-flex size-2 rounded-full" />
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}

            <div className="text-center sm:text-left">
              <p className="text-lg font-medium">Contact Us</p>
              <ul className="mt-8 space-y-4 text-sm">
                <li>
                  <Link
                    className="flex items-center justify-center gap-1.5 sm:justify-start"
                    href={"mailto:" + companyDetails.email}
                    target="_blank"
                  >
                    <Mail className="size-5 shrink-0" />
                    <span className="flex-1 transition">
                      {companyDetails.email}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center justify-center gap-1.5 sm:justify-start"
                    href={"https://wa.me/91" + companyDetails.contactNumber}
                    target="_blank"
                  >
                    <WhatsAppIcon className="size-5 shrink-0" />

                    <span className="flex-1 transition">
                      +91 {companyDetails.contactNumber}
                    </span>
                  </Link>
                </li>
                <li>
                  <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                    <MapPin className="size-5 shrink-0" />
                    <address className="-mt-0.5 flex-1 not-italic transition">
                      {companyDetails.address}
                    </address>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary dark:border-white pt-6">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-sm transition sm:order-first sm:mt-0">
              Copyright &copy; 2025 {companyDetails.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
