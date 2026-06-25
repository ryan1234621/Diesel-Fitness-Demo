import Link from "next/link";
import { ArrowRight, Dumbbell } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles & Insights | Diesel Fitness",
  description: "Read the latest expert insights, fitness tips, and training protocols from Diesel Fitness.",
};

const articles = [
  { title: "The Science of Hypertrophy", desc: "Understanding progressive overload and rep ranges for optimal muscle growth.", slug: "the-science-of-hypertrophy" },
  { title: "Elite Recovery Protocols", desc: "Why sleep, nutrition, and active recovery dictate your true potential.", slug: "elite-recovery-protocols" },
  { title: "Mastering the Deadlift", desc: "A complete biomechanical breakdown for the ultimate compound movement.", slug: "mastering-the-deadlift" }
];

export default function ArticlesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Expert Insights</h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
            Elevate your training IQ with deep dives into biomechanics, nutrition, and recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <Link key={i} href={`/articles/${article.slug}`}>
              <article className="group p-8 rounded-3xl bg-[#F4F3EF] border border-transparent hover:border-black/10 transition-all cursor-pointer h-full hover:shadow-lg">
                <div className="w-full h-48 bg-white rounded-2xl mb-8 shadow-sm overflow-hidden flex items-center justify-center">
                  <Dumbbell className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
                <p className="text-gray-600 font-medium leading-relaxed">{article.desc}</p>
                <div className="mt-6 flex items-center text-sm font-bold uppercase tracking-wider text-black">
                  Read Article <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
