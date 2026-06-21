"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Mail, MapPin, Phone, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PrivacyPolicyProps {
  lastUpdated: string;
  effectiveDate: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  stateCity: string;
}

const data: PrivacyPolicyProps = {
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
    id: "overview",
    title: "Overview",
    content: (
      <p>
        This Privacy Policy explains how{" "}
        <strong>
          {data.companyName} (&quot;Company&quot, &quot;we&quot;,
          &quot;our&quot;, &quot;us&quot;)
        </strong>{" "}
        collects, uses, discloses, and protects information when you use our
        website or applications. By using our platform, you consent to the
        practices described in this Policy.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "1. Information We Collect",
    content: (
      <div className="space-y-2">
        <p>
          We may collect information that helps us provide and improve our
          services, including but not limited to:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Personal & Profile Information:</strong> Name, date of
            birth, gender, marital status, religion, caste/community, education,
            occupation, photos, family details, preferences and expectations for
            a life partner.
          </li>
          <li>
            <strong>Contact Information:</strong> Mobile number, email address,
            and current/permanent address.
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, device identifiers,
            browser and operating system details, log files, cookies and similar
            tracking technologies.
          </li>
          <li>
            <strong>Payment & Transaction Data:</strong> Information necessary
            to process payments for subscriptions or premium services. We do not
            store full card or banking numbers; payments are handled through
            PCI-compliant payment gateways.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "use-of-info",
    title: "2. Use of Collected Information",
    content: (
      <div>
        <p>
          We use the data we collect to provide, personalize and improve our
          services, and to maintain a safe platform. Common uses include:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>Create and display user profiles and search results.</li>
          <li>
            Deliver personalized match suggestions and relevant recommendations.
          </li>
          <li>
            Send account-related updates, security alerts and promotional
            communications when permitted.
          </li>
          <li>
            Prevent, detect and respond to fraud, abuse, and other security
            incidents.
          </li>
          <li>
            Comply with legal obligations and enforce our Terms of Service.
          </li>
          <li>
            Conduct analytics, product research, and service improvements.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "3. Cookies & Tracking Technologies",
    content: (
      <p>
        We use cookies and similar technologies to remember your preferences,
        enable core site functionality, analyze trends, and serve relevant
        content. You can control cookies through your browser settings;
        disabling certain cookies may impact site functionality.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "4. Data Sharing & Disclosure",
    content: (
      <div>
        <p>
          We do not sell personal information. We may disclose data under these
          limited circumstances:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>
            <strong>Legal Requirements:</strong> To comply with court orders,
            laws, or government requests.
          </li>
          <li>
            <strong>Service Providers:</strong> To trusted third-party vendors
            who perform services on our behalf (hosting, payments, messaging).
            We require these partners to protect personal data and limit usage.
          </li>
          <li>
            <strong>With Your Consent:</strong> When you explicitly authorize
            sharing with other users or third-parties.
          </li>
          <li>
            <strong>Fraud & Safety:</strong> To detect or prevent fraudulent or
            illegal activities and to protect users and our platform.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "security",
    title: "5. Data Security",
    content: (
      <p>
        We implement reasonable administrative, technical and physical
        safeguards — such as SSL/TLS, encrypted backups, access controls, and
        monitoring — to protect user data. However, no system is entirely
        risk-free; we encourage users to follow security best practices and
        report suspicious activity to our support team.
      </p>
    ),
  },
  {
    id: "user-rights",
    title: "6. User Rights",
    content: (
      <div>
        <p>Users have the following rights regarding their personal data:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>
            Access and view the personal information associated with their
            account.
          </li>
          <li>Request corrections to inaccurate or incomplete information.</li>
          <li>
            Request deletion or permanent account closure (subject to legal or
            operational retention requirements).
          </li>
          <li>Opt out of promotional communications and marketing messages.</li>
          <li>
            Ask for clarification on how their information is processed and
            shared.
          </li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          To exercise these rights, contact our Data Protection Officer at the
          address below.
        </p>
      </div>
    ),
  },
  {
    id: "eligibility",
    title: "7. Eligibility of Users",
    content: (
      <p>
        Our services are intended for adults (18 years or older). If we learn
        that an account belongs to a minor, we will take prompt steps to delete
        the account and related information in accordance with applicable laws.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "8. Third-Party Links",
    content: (
      <p>
        Our platform may link to third-party sites or services. These external
        sites have their own privacy policies and practices, and we are not
        responsible for their content or data handling. Review third-party
        policies before providing personal information.
      </p>
    ),
  },
  {
    id: "retention",
    title: "9. Data Retention",
    content: (
      <p>
        We retain personal information only as long as necessary to provide
        services, comply with legal obligations, resolve disputes, and enforce
        agreements. When an account is closed, we will delete or anonymize
        personal data within a reasonable timeframe, except where retention is
        required by law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "10. Changes to This Policy",
    content: (
      <p>
        We may update this Policy from time to time. Continued use of the
        service after updates constitutes acceptance of the updated Policy.
      </p>
    ),
  },
  {
    id: "governing",
    title: "11. Governing Law",
    content: (
      <p>
        This Policy is governed by the laws of India. Any disputes arising in
        connection with this Policy will be subject to the courts located in{" "}
        <strong>{data.stateCity}</strong>, India.
      </p>
    ),
  },
  {
    id: "contact",
    title: "12. Contact Information",
    content: (
      <div id="contact">
        <p>
          For questions, requests, or complaints about this Privacy Policy,
          please contact our support team:
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border  p-4">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm ">{data.contactEmail}</p>
          </div>
          <div className="rounded-lg border  p-4">
            <p className="text-sm font-medium">Whatsapp</p>
            <p className="text-sm ">{data.contactPhone}</p>
          </div>
        </div>
        {data.officeAddress && (
          <p className="mt-3 text-xs ">Address: {data.officeAddress}</p>
        )}
      </div>
    ),
  },
];

const sectionsBn: PolicySection[] = [
  {
    id: "overview",
    title: "সংক্ষিপ্ত বিবরণ",
    content: (
      <p>
        এই গোপনীয়তা নীতি ব্যাখ্যা করে কিভাবে{" "}
        <strong>
          {data.companyName} (&quot;কোম্পানি&quot;, &quot;আমরা&quot;)
        </strong>{" "}
        ব্যবহারকারীর তথ্য সংগ্রহ, ব্যবহার, প্রকাশ এবং সুরক্ষা করে। আমাদের
        প্ল্যাটফর্ম ব্যবহার করে আপনি এই নীতির সাথে সম্মত হচ্ছেন।
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "১. আমরা যে তথ্য সংগ্রহ করি",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>ব্যক্তিগত ও প্রোফাইল তথ্য:</strong> নাম, জন্ম তারিখ, লিঙ্গ,
          বৈবাহিক অবস্থা, ধর্ম, জাত/সম্প্রদায়, শিক্ষা, পেশা, ছবি, পারিবারিক
          তথ্য, জীবনসঙ্গীর পছন্দ ও প্রত্যাশা।
        </li>
        <li>
          <strong>যোগাযোগ তথ্য:</strong> মোবাইল নম্বর, ইমেইল ঠিকানা,
          স্থায়ী/বর্তমান ঠিকানা।
        </li>
        <li>
          <strong>প্রযুক্তিগত তথ্য:</strong> আইপি অ্যাড্রেস, ডিভাইস আইডি,
          ব্রাউজার তথ্য, লগ ফাইল, কুকি।
        </li>
        <li>
          <strong>পেমেন্ট তথ্য:</strong> লেনদেন সম্পর্কিত তথ্য (আমরা সম্পূর্ণ
          ব্যাংক/কার্ড নম্বর সংরক্ষণ করি না)।
        </li>
      </ul>
    ),
  },
  {
    id: "use-of-info",
    title: "২. তথ্যের ব্যবহার",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>প্রোফাইল তৈরি ও প্রদর্শনের জন্য।</li>
        <li>উপযুক্ত মিল প্রস্তাব দেওয়ার জন্য।</li>
        <li>নোটিফিকেশন ও যোগাযোগ পাঠানোর জন্য।</li>
        <li>প্রতারণা প্রতিরোধ ও নিরাপত্তার জন্য।</li>
        <li>আইনগত প্রয়োজন পূরণের জন্য।</li>
        <li>সেবার মান উন্নয়ন ও বিশ্লেষণের জন্য।</li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "৩. কুকি ও ট্র্যাকিং প্রযুক্তি",
    content: (
      <p>
        আমরা ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে এবং সাইট সঠিকভাবে চালানোর জন্য
        কুকি ব্যবহার করি। ব্রাউজার থেকে কুকি বন্ধ করলে কিছু ফিচার সঠিকভাবে নাও
        কাজ করতে পারে।
      </p>
    ),
  },
  {
    id: "sharing",
    title: "৪. তথ্য শেয়ার ও প্রকাশ",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>আইনগত প্রয়োজন:</strong> আদালত বা সরকারি কর্তৃপক্ষের নির্দেশে।
        </li>
        <li>
          <strong>সেবা প্রদানকারী:</strong> টেকনোলজি পার্টনার, পেমেন্ট গেটওয়ে,
          ইমেইল/SMS প্রোভাইডার।
        </li>
        <li>
          <strong>সম্মতিতে:</strong> ব্যবহারকারীর স্পষ্ট অনুমোদনের মাধ্যমে।
        </li>
        <li>
          <strong>প্রতারণা প্রতিরোধ:</strong> সংশ্লিষ্ট প্রতিষ্ঠানের সাথে।
        </li>
      </ul>
    ),
  },
  {
    id: "security",
    title: "৫. তথ্য সুরক্ষা",
    content: (
      <p>
        আমরা SSL এনক্রিপশন, সুরক্ষিত সার্ভার, ফায়ারওয়াল ও অ্যাক্সেস কন্ট্রোল
        ব্যবহার করি। তবে কোনো সিস্টেম পুরোপুরি নিরাপদ নয়; তাই ব্যবহারকারীদেরও
        সতর্ক থাকতে হবে।
      </p>
    ),
  },
  {
    id: "user-rights",
    title: "৬. ব্যবহারকারীর অধিকার",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>নিজের প্রোফাইল দেখা ও সম্পাদনা করার অধিকার।</li>
        <li>অপযুক্ত তথ্য সংশোধনের অধিকার।</li>
        <li>একাউন্ট বন্ধ ও তথ্য মুছে ফেলার অধিকার।</li>
        <li>মার্কেটিং নোটিফিকেশন থেকে অপ্ট আউট করার অধিকার।</li>
        <li>তথ্য ব্যবহারের ব্যাখ্যা চাওয়ার অধিকার।</li>
      </ul>
    ),
  },
  {
    id: "eligibility",
    title: "৭. ব্যবহারযোগ্যতা",
    content: (
      <p>
        এই সেবা শুধুমাত্র ১৮ বছরের বেশি প্রাপ্তবয়স্কদের জন্য। অপ্রাপ্তবয়স্কের
        তথ্য পাওয়া গেলে তা অবিলম্বে মুছে ফেলা হবে।
      </p>
    ),
  },
  {
    id: "third-party",
    title: "৮. তৃতীয় পক্ষের লিঙ্ক",
    content: (
      <p>
        আমাদের প্ল্যাটফর্মে তৃতীয় পক্ষের লিঙ্ক থাকতে পারে। তাদের নীতি আমাদের
        নিয়ন্ত্রণে নয়, তাই আলাদাভাবে পড়া উচিত।
      </p>
    ),
  },
  {
    id: "retention",
    title: "৯. তথ্য সংরক্ষণ",
    content: (
      <p>
        একাউন্ট বন্ধ হলে তথ্য যুক্তিযুক্ত সময়ের মধ্যে মুছে ফেলা হবে, তবে আইনগত
        কারণে কিছু তথ্য রাখা হতে পারে।
      </p>
    ),
  },
  {
    id: "changes",
    title: "১০. নীতির পরিবর্তন",
    content: (
      <p>
        আমরা সময়ে সময়ে এই নীতি পরিবর্তন করতে পারি। আপডেটের পরও সেবা ব্যবহার
        অব্যাহত থাকলে তা হালনাগাদ নীতির প্রতি আপনার সম্মতি হিসেবে গণ্য হবে।
      </p>
    ),
  },
  {
    id: "governing",
    title: "১১. প্রযোজ্য আইন",
    content: (
      <p>
        এই নীতি ভারতের আইন দ্বারা নিয়ন্ত্রিত। কোনো বিরোধ হলে {data.stateCity}
        -এর আদালতে নিষ্পত্তি হবে।
      </p>
    ),
  },
  {
    id: "contact",
    title: "১২. যোগাযোগ",
    content: (
      <div id="contact">
        <p>প্রশ্ন, অনুরোধ বা অভিযোগের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4" />
              ইমেইল
            </div>
            <p className="text-sm ">{data.contactEmail}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4" />
              Whatsapp
            </div>
            <p className="text-sm ">{data.contactPhone}</p>
          </div>
        </div>
        {data.officeAddress && (
          <p className="flex items-center gap-2 mt-3 text-xs ">
            <MapPin className="w-4 h-4" />
            ঠিকানা: {data.officeAddress}
          </p>
        )}
      </div>
    ),
  },
];

export default function PrivacyPolicyPage() {
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

              <div className="rounded-xl border p-4">
                <h4 className="text-sm font-semibold">
                  {lang === "en" ? "Privacy Controls" : "গোপনীয়তা নিয়ন্ত্রণ"}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground">
                  {lang === "en"
                    ? "Manage marketing preferences and access requests from your account settings."
                    : "আপনার অ্যাকাউন্ট সেটিংস থেকে মার্কেটিং পছন্দ এবং অ্যাক্সেস অনুরোধ পরিচালনা করুন।"}
                </p>

                <div className="mt-3 flex gap-2">
                  {/* <button className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm">
                    Manage Account
                  </button> */}
                  <button className="flex-1 cursor-pointer rounded-md bg-primary px-3 py-2 text-sm">
                    {lang === "en" ? "Request Data" : "ডাটা অনুরোধ করুন"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                {lang === "en" ? (
                  <>
                    <h4 className="text-sm font-semibold">Safety Tips</h4>
                    <ul className="mt-2 text-xs list-disc pl-4">
                      <li>Don&apos;t share OTPs or passwords.</li>
                      <li>Report suspicious profiles immediately.</li>
                      <li>Use a strong, unique password for your account.</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-semibold">সুরক্ষার টিপস</h4>
                    <ul className="mt-2 text-xs list-disc pl-4">
                      <li>OTP বা পাসওয়ার্ড কখনো শেয়ার করবেন না।</li>
                      <li>সন্দেহজনক প্রোফাইল সঙ্গে সঙ্গে রিপোর্ট করুন।</li>
                      <li>
                        আপনার অ্যাকাউন্টের জন্য শক্তিশালী ও অনন্য পাসওয়ার্ড
                        ব্যবহার করুন।
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-8 text-xs">
        Copyright &copy; {new Date().getFullYear()} {data.companyName}. All
        rights reserved.
      </footer>
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
  data: PrivacyPolicyProps;
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold">Privacy Policy</h1>
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
        {/* <div className="flex items-center gap-3">
          
          <Button asChild className="rounded-full">
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 text-sm shadow-sm hover:bg-sky-700"
            >
              Contact Support
            </Link>
          </Button>
        </div> */}
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
