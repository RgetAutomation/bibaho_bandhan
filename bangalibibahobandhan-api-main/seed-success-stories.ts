import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const successStories = [
  {
    title: "Zahra & Hasan",
    image: "/matching/BBBCI5278413002.webp",
    text: "Thanks to Bangali Bibaho Bandhan, I found someone who truly understands me. Our bond grew effortlessly, and within months, we tied the knot in a traditional Bengali wedding.",
  },
  {
    title: "Tania & Arijit",
    image: "/matching/BBBCI5278965420.webp",
    text: "A simple match request turned into the most meaningful connection of my life. With love, laughter, and shared dreams, we started our forever together. Grateful to this amazing platform.",
  },
  {
    title: "Poulomi & Subhankar",
    image: "/matching/BBBCI5482346951.webp",
    text: "Our families matched us through Bangali Bibaho Bandhan. With every conversation, love blossomed. From strangers to soulmates, our journey has been magical. We couldn't be happier.",
  },
  {
    title: "Madhumita & Ritam",
    image: "/matching/BBBCI5469824566.webp",
    text: "I never thought I'd find love online, but Bangali Bibaho Bandhan changed everything. Ritam and I share the same values and dreams. Our story is just beginning!",
  },
  {
    title: "Ishita & Debayan",
    image: "/matching/BBBCI6255662497.webp",
    text: "We met, we talked, we laughed — and soon realized we were made for each other. Thanks to Bangali Bibaho Bandhan, I found my best friend and life partner.",
  },
  {
    title: "Nandini & Abir",
    image: "/matching/BBBCI6258453360.webp",
    text: "From our first message on Bangali Bibaho Bandhan, everything just felt right. We discovered shared dreams, values, and a deep connection. Our wedding was filled with joy, and our hearts with gratitude.",
  },
];

async function main() {
  console.log("Seeding Success Stories...");
  for (const story of successStories) {
    await prisma.successStory.create({
      data: {
        title: story.title,
        image: story.image,
        text: story.text,
        isActive: true,
      },
    });
  }
  console.log("Success Stories Seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
