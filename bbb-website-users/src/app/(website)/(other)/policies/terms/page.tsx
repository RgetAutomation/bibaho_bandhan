"use client";

import { WhatsAppIcon } from "@/components/icons/social-icon";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Mail, MapPin, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TermsProps {
  lastUpdated: string;
  effectiveDate: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  stateCity: string;
}

const data: TermsProps = {
  lastUpdated: format(new Date("2025-09-01"), "PPPP"),
  effectiveDate: format(new Date("2025-09-01"), "PPPP"),
  companyName: "Bangali Bibaho Bandhan",
  contactEmail: "support@bibahobandhan.com",
  contactPhone: "+91-9735661155",
  officeAddress: "Malda, West Bengal, India",
  stateCity: "Malda, West Bengal",
};

type TermsSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const sectionsEn: TermsSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <p>
        Welcome to <strong>{data.companyName}</strong>. These Terms & Conditions
        (&quot;Terms&quot;) govern your use of our website, applications, and
        services. By accessing or using our platform, you agree to be bound by
        these Terms. If you do not agree, please do not use our services.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "1. Eligibility",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Our platform is strictly for adults (18+).</li>
        <li>
          Users must be legally eligible for marriage (as per Indian law – Male:
          21+, Female: 18+).
        </li>
        <li>
          Providing false information, fraud, or fake identity is a punishable
          offense under law.
        </li>
      </ul>
    ),
  },

  {
    id: "account",
    title: "2. Account Responsibilities",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          You are responsible for maintaining the confidentiality of your
          account and password.
        </li>
        <li>
          You agree to provide accurate, complete, and updated information.
        </li>
        <li>You must not share your login credentials with others.</li>
        <li>
          Any activity under your account will be considered your
          responsibility.
        </li>
      </ul>
    ),
  },
  {
    id: "obligations",
    title: "3. User Responsibilities",
    content: (
      <div>
        <p>The User agrees that he/she will:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            Not upload obscene, offensive or illegal content to the Platform.
          </li>
          <li>Not harass, defraud or blackmail other users.</li>
          <li>Not use fake profiles, multiple profiles or bots.</li>
          <li>Accept the terms of paid subscriptions/services.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "rights",
    title: "4. Our Rights",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          We reserve the right to verify any profile or content on the platform.
        </li>
        <li>
          If any fake or suspicious activity is detected, we may suspend or
          permanently terminate the account.
        </li>
        <li>
          We reserve the right to modify, improve, or discontinue any part of
          the services from time to time.
        </li>
      </ul>
    ),
  },

  {
    id: "subscription",
    title: "5. Subscription & Payments",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Both free and premium services may be available on the platform.
        </li>
        <li>
          Subscription charges for premium services are non-refundable (as per
          the Refund Policy).
        </li>
        <li>All payments will be processed through secure payment gateways.</li>
      </ul>
    ),
  },
  {
    id: "content-ownership",
    title: "6. Content Ownership",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Information/photos provided by the user remain their own property.
        </li>
        <li>
          By using the platform, users agree that their information/photos may
          be used on the platform for matching and display purposes.
        </li>
        <li>
          The platform’s design, logo, software, and content are our
          intellectual property and cannot be used without prior permission.
        </li>
      </ul>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "7. Limitation of Liability",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          We are only a matchmaking platform and do not guarantee marriage or
          relationships.
        </li>
        <li>
          The platform is not responsible for the accuracy or authenticity of
          user-provided information.
        </li>
        <li>
          Any communication, meeting, or marriage between users is solely at
          their own responsibility.
        </li>
        <li>
          We will not be liable for any financial or emotional loss resulting
          from the use of the platform.
        </li>
      </ul>
    ),
  },
  {
    id: "termination-of-account",
    title: "8. Termination of Account",
    content: (
      <div>
        <p>
          We may suspend or delete a user’s account for the following reasons:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Providing false information.</li>
          <li>Engaging in unethical or illegal activities.</li>
          <li>Harassing or deceiving other users.</li>
          <li>Violating the terms and conditions.</li>
        </ul>
      </div>
    ),
  },

  {
    id: "changes",
    title: "9. Changes to Terms",
    content: (
      <p>
        We may update these Terms periodically. Continued use of our services
        after changes are posted constitutes acceptance of the updated Terms.
      </p>
    ),
  },
  {
    id: "governing",
    title: "10. Governing Law",
    content: (
      <p>
        These Terms are governed by the laws of India. Any disputes will be
        subject to the exclusive jurisdiction of the courts in{" "}
        <strong>{data.stateCity}</strong>, India.
      </p>
    ),
  },
  {
    id: "contact",
    title: "11. Contact Information",
    content: (
      <div id="contact">
        <p>For any queries, please contact us:</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4" /> Email
            </div>
            <p className="text-sm">{data.contactEmail}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <WhatsAppIcon className="w-4 h-4" /> Whatsapp
            </div>
            <p className="text-sm">{data.contactPhone}</p>
          </div>
        </div>
        {data.officeAddress && (
          <p className="flex items-center gap-2 mt-3 text-xs">
            <MapPin className="w-4 h-4" /> Address: {data.officeAddress}
          </p>
        )}
      </div>
    ),
  },
];

const sectionsBn: TermsSection[] = [
  {
    id: "overview",
    title: "সংক্ষিপ্ত বিবরণ",
    content: (
      <p>
        <strong>{data.companyName}</strong>-এ স্বাগতম। এই শর্তাবলী আমাদের
        ওয়েবসাইট, অ্যাপ্লিকেশন এবং পরিষেবার ব্যবহারের নিয়ম নির্ধারণ করে।
        আমাদের পরিষেবা ব্যবহার করলে আপনি এই শর্তাবলীতে সম্মতি দিচ্ছেন।
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "১. যোগ্যতা",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>আমাদের প্ল্যাটফর্ম শুধুমাত্র প্রাপ্তবয়স্কদের (১৮+) জন্য।</li>
        <li>
          ব্যবহারকারীকে আইনত বিবাহের যোগ্য হতে হবে (ভারতের আইন অনুযায়ী – পুরুষ:
          ২১+, নারী: ১৮+)।
        </li>
        <li>
          কোনো ভুয়া তথ্য, প্রতারণা বা ভুয়া পরিচয় প্রদান আইনত দণ্ডনীয় অপরাধ।
        </li>
      </ul>
    ),
  },

  {
    id: "account",
    title: "২. অ্যাকাউন্ট দায়িত্ব",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>অ্যাকাউন্ট ও পাসওয়ার্ডের নিরাপত্তা বজায় রাখা আপনার দায়িত্ব।</li>
        <li>সঠিক ও হালনাগাদ তথ্য প্রদান করতে হবে।</li>
        <li>আপনার লগইন তথ্য অন্যের সাথে ভাগ করা যাবে না।</li>
        <li>আপনার অ্যাকাউন্টে যা কার্যকলাপ হবে তার দায়ভার আপনার।</li>
      </ul>
    ),
  },
  {
    id: "obligations",
    title: "৩. ব্যবহারকারীর দায়িত্ব",
    content: (
      <div>
        <p>ব্যবহারকারী সম্মত থাকবেন যে তিনি:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            প্ল্যাটফর্মে অশ্লীল, আক্রমণাত্মক বা অবৈধ কনটেন্ট আপলোড করবেন না।
          </li>
          <li>অন্য ব্যবহারকারীকে হয়রানি, প্রতারণা বা ব্ল্যাকমেল করবেন না।</li>
          <li>ভুয়া প্রোফাইল, একাধিক প্রোফাইল বা বট ব্যবহার করবেন না।</li>
          <li>পেইড সাবস্ক্রিপশন/সার্ভিসের শর্তাবলী মানবেন।</li>
        </ul>
      </div>
    ),
  },
  {
    id: "rights",
    title: "৪. আমাদের অধিকার",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>আমরা যেকোনো প্রোফাইল বা কনটেন্ট যাচাই করতে পারি।</li>
        <li>
          ভুয়া বা সন্দেহজনক কার্যকলাপ পাওয়া গেলে অ্যাকাউন্ট স্থগিত বা
          স্থায়ীভাবে বন্ধ করার অধিকার আমাদের আছে।
        </li>
        <li>
          পরিষেবার যে কোনো অংশ সময়ে সময়ে পরিবর্তন, উন্নয়ন বা বন্ধ করার অধিকার
          আমাদের আছে।
        </li>
      </ul>
    ),
  },

  {
    id: "subscription",
    title: "৫. সাবস্ক্রিপশন ও পেমেন্ট",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>ফ্রি এবং প্রিমিয়াম উভয় ধরণের পরিষেবা থাকতে পারে।</li>
        <li>
          প্রিমিয়াম পরিষেবা নেওয়ার ক্ষেত্রে সাবস্ক্রিপশন চার্জ ফেরতযোগ্য নয়
          (Refund Policy অনুযায়ী)।
        </li>
        <li>
          সমস্ত পেমেন্ট সুরক্ষিত পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়াকৃত হবে।
        </li>
      </ul>
    ),
  },
  {
    id: "content-ownership",
    title: "৬. কনটেন্টের মালিকানা",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>ব্যবহারকারীর প্রদান করা তথ্য/ছবি তার নিজস্ব সম্পত্তি।</li>
        <li>
          ব্যবহারকারী সম্মত হচ্ছেন যে, তার তথ্য/ছবি ম্যাচিং ও প্রদর্শনের
          উদ্দেশ্যে প্ল্যাটফর্মে ব্যবহৃত হতে পারে।
        </li>
        <li>
          প্ল্যাটফর্মের ডিজাইন, লোগো, সফটওয়্যার ও কনটেন্ট আমাদের বৌদ্ধিক
          সম্পত্তি এবং অনুমতি ছাড়া ব্যবহার করা যাবে না।
        </li>
      </ul>
    ),
  },

  {
    id: "limitation-of-liability",
    title: "৭. দায়বদ্ধতার সীমাবদ্ধতা",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          আমরা শুধুমাত্র একটি ম্যাচমেকিং প্ল্যাটফর্ম, কোনো বিবাহ বা সম্পর্কের
          নিশ্চয়তা দিচ্ছি না।
        </li>
        <li>
          ব্যবহারকারীর প্রদত্ত তথ্যের সত্যতা বা বিশ্বাসযোগ্যতার জন্য প্ল্যাটফর্ম
          দায়ী নয়।
        </li>
        <li>
          ব্যবহারকারীদের মধ্যে যে কোনো যোগাযোগ, সাক্ষাৎ বা বিবাহ তাদের নিজস্ব
          দায়িত্বে হবে।
        </li>
        <li>
          প্ল্যাটফর্মের ব্যবহার থেকে কোনো আর্থিক/মানসিক ক্ষতির জন্য আমরা দায়ী
          থাকব না।
        </li>
      </ul>
    ),
  },
  {
    id: "termination-of-account",
    title: "৮. অ্যাকাউন্ট বন্ধকরণ",
    content: (
      <div>
        <p>
          আমরা নিম্নলিখিত কারণে ব্যবহারকারীর অ্যাকাউন্ট স্থগিত বা মুছে ফেলতে
          পারি:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>ভুয়া তথ্য প্রদান।</li>
          <li>অনৈতিক বা বেআইনি কার্যকলাপ।</li>
          <li>অন্য ব্যবহারকারীকে হয়রানি বা প্রতারণা।</li>
          <li>শর্তাবলী ভঙ্গ করা।</li>
        </ul>
      </div>
    ),
  },

  {
    id: "changes",
    title: "৯ . শর্তাবলীর পরিবর্তন",
    content: (
      <p>
        সময়ে সময়ে শর্তাবলী পরিবর্তন হতে পারে। পরিবর্তনের পর পরিষেবা ব্যবহার
        করা মানেই আপনি নতুন শর্তাবলীতে সম্মত হচ্ছেন।
      </p>
    ),
  },
  {
    id: "governing",
    title: "১০. প্রযোজ্য আইন",
    content: (
      <p>
        এই শর্তাবলী ভারতের আইন দ্বারা নিয়ন্ত্রিত। কোনো বিরোধ হলে{" "}
        {data.stateCity}-এর আদালতে নিষ্পত্তি হবে।
      </p>
    ),
  },
  {
    id: "contact",
    title: "১১. যোগাযোগ",
    content: (
      <div id="contact">
        <p>প্রশ্ন বা অভিযোগের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4" /> ইমেইল
            </div>
            <p className="text-sm">{data.contactEmail}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <WhatsAppIcon className="w-4 h-4" /> Whatsapp
            </div>
            <p className="text-sm">{data.contactPhone}</p>
          </div>
        </div>
        {data.officeAddress && (
          <p className="flex items-center gap-2 mt-3 text-xs">
            <MapPin className="w-4 h-4" /> ঠিকানা: {data.officeAddress}
          </p>
        )}
      </div>
    ),
  },
];

export default function TermsPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const content = lang === "en" ? sectionsEn : sectionsBn;

  return (
    <Container>
      <Header data={data} lang={lang} setLang={setLang} />
      <div className="border-t border-dashed border-slate-500 dark:border-slate-200 mt-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {content.map((s) => (
              <Section key={s.id} s={s} />
            ))}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-xl border p-4">
                <h4 className="text-sm font-semibold">
                  {lang === "en" ? "Quick Links" : "দ্রুত লিঙ্ক"}
                </h4>
                <nav className="mt-3 flex flex-col gap-2 text-sm">
                  {content.map((s) => (
                    <Link
                      key={s.id}
                      href={`#${s.id}`}
                      className="hover:text-primary transition-all duration-300"
                    >
                      {s.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl bg-card border shadow-lg rounded-2xl p-8">
        {children}
      </div>
    </div>
  );
}

function Header({
  data,
  lang,
  setLang,
}: {
  data: TermsProps;
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Terms of Service
          </h1>
          <Button
            variant={"outline"}
            onClick={() => window.print()}
            size={"icon"}
            className="rounded-full"
          >
            <Printer className="size-4" />
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Effective Date:{" "}
          <span className="font-medium">{data.effectiveDate}</span> · Last
          Updated: <span className="font-medium">{data.lastUpdated}</span>
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>
    </div>
  );
}

function Section({ s }: { s: TermsSection }) {
  return (
    <section id={s.id} className="mb-6">
      <h3 className="text-lg font-semibold">{s.title}</h3>
      <div className="mt-2 text-sm leading-relaxed">{s.content}</div>
    </section>
  );
}

function LanguageToggle({
  lang,
  setLang,
}: {
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
}) {
  return (
    <div className="w-full grid grid-cols-2 gap-2 mb-6 justify-center border bg-card p-2 rounded-full">
      <Button
        className="cursor-pointer px-3 py-1 rounded-l-full text-sm font-medium"
        variant={lang === "en" ? "default" : "outline"}
        onClick={() => setLang("en")}
      >
        English
      </Button>
      <Button
        className="cursor-pointer px-3 py-1 rounded-r-full text-sm font-medium"
        variant={lang === "bn" ? "default" : "outline"}
        onClick={() => setLang("bn")}
      >
        বাংলা
      </Button>
    </div>
  );
}
