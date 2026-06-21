import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlusCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { AUTHENTICATION_REGISTER } from "@/components/helper/constant";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about Bangali Bibaho Bandhan's mission, vision, and values.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Bangali Bibaho Bandhan
              </h1>
              <div>
                <Badge className="bg-green-600 rounded-full">
                  <ShieldCheck className="w-10 h-10 text-white" />
                  <span className="text-sm text-white">Trusted & Verified</span>
                </Badge>
              </div>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-xl">
              A modern, secure, and culturally-aware matrimonial platform
              helping families and individuals find meaningful life
              partnerships.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="group flex items-center justify-center shadow-md rounded-full transition-all duration-200"
            >
              <Link
                href={AUTHENTICATION_REGISTER}
                className="flex items-center"
              >
                <span className="font-semibold">Get Started</span>
                <ArrowRight className="w-5 h-5 ml-0 overflow-hidden max-w-0 group-hover:ml-1 group-hover:max-w-[20px] transition-all duration-500 ease-in-out" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-tr from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <h2 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Our Vision
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              To be the most trusted matrimonial platform that blends technology
              with cultural values, empowering families and individuals to
              discover genuine, long-lasting partnerships.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
            <ul
              style={{ listStyleType: "disc" }}
              className="space-y-2 text-slate-600 dark:text-slate-300 ps-3"
            >
              <li>Protect user privacy with industry-standard safeguards.</li>
              <li>
                Enable precise matchmaking with advanced search and filters.
              </li>
              <li>Reduce fraud with robust profile verification.</li>
              <li>Deliver friendly and timely customer support.</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">Core Values</h2>
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                <strong>Integrity:</strong> We act honestly and transparently.
              </p>
              <p>
                <strong>Safety:</strong> User security is our priority.
              </p>
              <p>
                <strong>Respect:</strong> We honor all backgrounds equally.
              </p>
              <p>
                <strong>Trust:</strong> We build long-term relationships with
                users.
              </p>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-2xl font-semibold mb-2">How We Work</h3>
              <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300">
                <li>
                  <strong>Create a profile:</strong> Register with essential
                  details and preferences.
                </li>
                <li>
                  <strong>Verify identity:</strong> Profiles are verified to
                  reduce fake accounts.
                </li>
                <li>
                  <strong>Discover matches:</strong> Use advanced filters to
                  refine results.
                </li>
                <li>
                  <strong>Connect securely:</strong> Communicate privately;
                  premium features available.
                </li>
                <li>
                  <strong>Support:</strong> Our care team helps with any
                  questions or concerns.
                </li>
              </ol>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Why Choose Us?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h4 className="font-medium">Security</h4>
                  <p className="text-sm">
                    Advanced data protection so your information stays private
                    and secure.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Verified Profiles</h4>
                  <p className="text-sm">
                    Manual and automated checks to prevent fake or misleading
                    accounts.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Personalized Search</h4>
                  <p className="text-sm">
                    Filters for preferences, beliefs, education, location, and
                    family values.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Dedicated Support</h4>
                  <p className="text-sm">
                    Responsive support team ready to help by chat or email.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold">Our Team</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                A focused team of customer care and management professionals
                dedicated to ensuring a smooth, respectful matchmaking
                experience.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold">Social Responsibility</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                We promote healthy marriage culture through verified profiles,
                educational content, and guidance for families.
              </p>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="relative h-44">
                <Image
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Families connecting"
                  className="w-full h-full object-center object-cover"
                  fill
                />
              </div>
            </Card>
          </aside>
        </section>

        <section className="mt-12">
          <Card className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">
                Ready to find a meaningful match?
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Create your profile today — our team will help you get started
                and verify your account for peace of mind.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="rounded-full">
                <Link href={AUTHENTICATION_REGISTER}>
                  <PlusCircle className="size-4" />
                  <span>Create your profile</span>
                </Link>
              </Button>
              {/* <Button className="rounded-full" variant="outline">
                Learn More
              </Button> */}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
