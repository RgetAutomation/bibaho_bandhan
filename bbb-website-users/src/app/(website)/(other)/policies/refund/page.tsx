"use client";

import { WhatsAppIcon } from "@/components/icons/social-icon";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Mail, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface RefundPolicyProps {
  lastUpdated: string;
  effectiveDate: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  stateCity: string;
}

const data: RefundPolicyProps = {
  lastUpdated: format(new Date("2025-09-01"), "PPPP"),
  effectiveDate: format(new Date("2025-09-01"), "PPPP"),
  companyName: "Bangali Bibaho Bandhan",
  contactEmail: "support@bibahobandhan.com",
  contactPhone: "+91-9735661155",
  officeAddress: "Malda, West Bengal, India",
  stateCity: "Malda, West Bengal",
};

const sectionsEn: PolicySection[] = [
  {
    id: "general",
    title: "1. General Policy",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Membership fees, subscription charges, or any other service charges
          paid on the platform are generally non-refundable.
        </li>
        <li>
          Refunds will only be considered under specific circumstances (see
          below).
        </li>
        <li>
          Users are advised to carefully read the features, duration, and terms
          of subscription before making a purchase.
        </li>
      </ul>
    ),
  },
  {
    id: "eligibility",
    title: "2. Refund Eligibility",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Duplicate Payment:</strong> If due to a technical error,
          multiple payments are deducted.
        </li>
        <li>
          <strong>Service Not Provided:</strong> If purchased premium features
          cannot be accessed at all due to technical issues.
        </li>
        <li>
          <strong>Wrong/Unauthorized Charging:</strong> If an unauthorized
          charge is deducted without the user’s consent.
        </li>
      </ul>
    ),
  },
  {
    id: "non-refundable",
    title: "3. Non-Refundable Situations",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          If the user purchases a premium subscription but chooses not to use
          it.
        </li>
        <li>
          Refunds will not be given for reasons such as not finding a match or
          not getting married, since we are only a matchmaking platform.
        </li>
        <li>
          If an account is blocked/suspended due to violation of terms and
          conditions.
        </li>
        <li>
          If a subscription is canceled after partial use, the remaining
          period’s charges will not be refunded.
        </li>
      </ul>
    ),
  },
  {
    id: "process",
    title: "4. Refund Process",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          Users must apply for a refund in writing within{" "}
          <strong>3 days of the purchase</strong>.
        </li>
        <li>
          Requests must be sent via:
          <div className="py-4 space-y-1">
            <p className="flex gap-2 items-center">
              {" "}
              <Mail className="w-4 h-4" /> Email:{" "}
              <Link
                href={`mailto:${data.contactEmail}`}
                className="text-sky-600 underline px-2"
              >
                {data.contactEmail}
              </Link>
            </p>
            <p className="flex gap-2 items-center">
              <WhatsAppIcon className="w-4 h-4" /> Whatsapp:{" "}
              <Link
                href={`https://wa.me/91${data.contactPhone.split("-")[1]}`}
                className="text-sky-600 underline px-2"
              >
                {data.contactPhone}
              </Link>
            </p>
          </div>
        </li>
        <li>Our team will verify the request within 7–10 business days.</li>
        <li>
          If approved, the refund will be processed through the original payment
          method within 7–15 business days.
        </li>
      </ol>
    ),
  },
  {
    id: "cancellation",
    title: "5. Subscription Cancellation",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Users may cancel their subscription at any time; however, payments for
          the current billing cycle are non-refundable.
        </li>
        <li>
          Once canceled, no further charges will be made from the next billing
          cycle.
        </li>
      </ul>
    ),
  },
  {
    id: "changes",
    title: "6. Changes to Refund Policy",
    content: (
      <p>
        We may update or modify this Refund Policy from time to time. The
        updated policy will become effective as soon as it is published on our
        website.
      </p>
    ),
  },
  {
    id: "contact",
    title: "7. Contact Us",
    content: (
      <div>
        <p>For any refund-related queries, please contact us:</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <p className="flex gap-1 items-center text-sm font-medium">
              <Mail className="w-4 h-4" /> Email
            </p>
            <p className="text-sm">{data.contactEmail}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="flex gap-1 items-center text-sm font-medium">
              <WhatsAppIcon className="w-4 h-4" /> Whatsapp
            </p>
            <p className="text-sm">{data.contactPhone}</p>
          </div>
        </div>
        {data.officeAddress && (
          <p className="mt-3 text-xs">Address: {data.officeAddress}</p>
        )}
      </div>
    ),
  },
];

const sectionsBn: PolicySection[] = [
  {
    id: "general",
    title: "১. সাধারণ নীতি",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          সদস্যপদ ফি, সাবস্ক্রিপশন চার্জ বা অন্য যে কোনও সেবা চার্জ সাধারণত
          ফেরতযোগ্য নয়।
        </li>
        <li>
          শুধুমাত্র নির্দিষ্ট পরিস্থিতিতে (নিচে উল্লেখ করা হয়েছে) রিফান্ড
          বিবেচনা করা হবে।
        </li>
        <li>
          সাবস্ক্রিপশন কেনার আগে ব্যবহারকারীদের বৈশিষ্ট্য, সময়কাল এবং শর্তাবলী
          মনোযোগ দিয়ে পড়ার পরামর্শ দেওয়া হয়।
        </li>
      </ul>
    ),
  },
  {
    id: "eligibility",
    title: "২. রিফান্ডের যোগ্যতা",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>ডুপ্লিকেট পেমেন্ট:</strong> টেকনিক্যাল ত্রুটির কারণে একাধিকবার
          টাকা কেটে গেলে।
        </li>
        <li>
          <strong>সেবা প্রদান না হলে:</strong> কেনা প্রিমিয়াম ফিচার যদি
          একেবারেই ব্যবহার করা না যায়।
        </li>
        <li>
          <strong>ভুল/অননুমোদিত চার্জিং:</strong> ব্যবহারকারীর সম্মতি ছাড়া টাকা
          কেটে নিলে।
        </li>
      </ul>
    ),
  },
  {
    id: "non-refundable",
    title: "৩. নন-রিফান্ডেবল পরিস্থিতি",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>ব্যবহারকারী প্রিমিয়াম সাবস্ক্রিপশন কিনে সেটি ব্যবহার না করলে।</li>
        <li>
          ম্যাচ না পাওয়া বা বিয়ে না হওয়ার কারণে রিফান্ড দেওয়া হবে না, কারণ
          আমরা শুধুমাত্র ম্যাচমেকিং প্ল্যাটফর্ম।
        </li>
        <li>শর্ত ভঙ্গের কারণে অ্যাকাউন্ট ব্লক/সাসপেন্ড হলে।</li>
        <li>
          সাবস্ক্রিপশন আংশিক ব্যবহারের পর বাতিল করলে অবশিষ্ট সময়ের চার্জ ফেরত
          দেওয়া হবে না।
        </li>
      </ul>
    ),
  },
  {
    id: "process",
    title: "৪. রিফান্ড প্রক্রিয়া",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          ব্যবহারকারীদের অবশ্যই <strong>৩ দিনের মধ্যে</strong> লিখিতভাবে রিফান্ড
          আবেদন করতে হবে।
        </li>
        <li>
          আবেদন পাঠাতে হবে:
          <div className="py-4 space-y-1">
            <p className="flex gap-2 items-center">
              {" "}
              <Mail className="w-4 h-4" /> ইমেইল:{" "}
              <Link
                href={`mailto:${data.contactEmail}`}
                className="text-sky-600 underline px-2"
              >
                {data.contactEmail}
              </Link>
            </p>
            <p className="flex gap-2 items-center">
              <WhatsAppIcon className="w-4 h-4" /> Whatsapp:{" "}
              <Link
                href={`https://wa.me/91${data.contactPhone.split("-")[1]}`}
                className="text-sky-600 underline px-2"
              >
                {data.contactPhone}
              </Link>
            </p>
          </div>
        </li>
        <li>আমাদের টিম ৭–১০ কার্যদিবসের মধ্যে আবেদন যাচাই করবে।</li>
        <li>
          অনুমোদিত হলে ৭–১৫ কার্যদিবসের মধ্যে মূল পেমেন্ট মেথডে টাকা ফেরত দেওয়া
          হবে।
        </li>
      </ol>
    ),
  },
  {
    id: "cancellation",
    title: "৫. সাবস্ক্রিপশন বাতিল",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          ব্যবহারকারীরা যেকোনো সময় সাবস্ক্রিপশন বাতিল করতে পারবেন; তবে চলতি
          বিলিং সাইকেলের টাকা ফেরতযোগ্য নয়।
        </li>
        <li>
          একবার বাতিল করলে, পরবর্তী বিলিং সাইকেল থেকে আর কোনো চার্জ নেওয়া হবে
          না।
        </li>
      </ul>
    ),
  },
  {
    id: "changes",
    title: "৬. নীতির পরিবর্তন",
    content: (
      <p>
        আমরা সময়ে সময়ে এই রিফান্ড নীতি পরিবর্তন করতে পারি। আপডেটকৃত নীতি
        প্রকাশের সাথে সাথেই কার্যকর হবে।
      </p>
    ),
  },
  {
    id: "contact",
    title: "৭. যোগাযোগ",
    content: (
      <div>
        <p>রিফান্ড সংক্রান্ত প্রশ্নের জন্য যোগাযোগ করুন:</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <p className="flex gap-1 items-center text-sm font-medium">
              <Mail className="w-4 h-4" /> ইমেইল
            </p>
            <p className="text-sm">{data.contactEmail}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="flex gap-1 items-center text-sm font-medium">
              <WhatsAppIcon className="w-4 h-4" /> Whatsapp
            </p>
            <p className="text-sm">{data.contactPhone}</p>
          </div>
        </div>
        {data.officeAddress && (
          <p className="mt-3 text-xs"> ঠিকানা: {data.officeAddress}</p>
        )}
      </div>
    ),
  },
];

export default function RefundPolicyPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const content = lang === "en" ? sectionsEn : sectionsBn;

  return (
    <Container>
      <Header data={data} lang={lang} setLang={setLang} />
      <div className="border-t border-dashed border-slate-100 mt-6 pt-6">
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

              <div className="rounded-xl border p-4">
                <h4 className="text-sm font-semibold">
                  {lang === "en" ? "Refund Assistance" : "রিফান্ড সহায়তা"}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground">
                  {lang === "en"
                    ? "Need help with refunds? Contact our support team for assistance."
                    : "রিফান্ড সংক্রান্ত সহায়তার জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* <footer className="mt-8 text-xs">
        Copyright &copy; {new Date().getFullYear()} {data.companyName}. All
        rights reserved.
      </footer> */}
    </Container>
  );
}

type PolicySection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

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
  data: RefundPolicyProps;
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold">Refund Policy</h1>
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

function Section({ s }: { s: PolicySection }) {
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
        className={
          "cursor-pointer px-3 py-1 rounded-l-full text-sm font-medium"
        }
        variant={lang === "en" ? "default" : "outline"}
        onClick={() => setLang("en")}
      >
        English
      </Button>
      <Button
        className={
          "cursor-pointer px-3 py-1 rounded-r-full text-sm font-medium"
        }
        variant={lang === "bn" ? "default" : "outline"}
        onClick={() => setLang("bn")}
      >
        বাংলা
      </Button>
    </div>
  );
}
