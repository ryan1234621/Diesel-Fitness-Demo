import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elite Recovery Protocols | Diesel Fitness",
  description: "Why sleep, nutrition, and active recovery dictate your true potential.",
};

export default function ArticlePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto w-full">
        <Link href="/articles" className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
        </Link>
        
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Elite Recovery Protocols</h1>
          <div className="flex items-center text-gray-500 font-medium">
            <Clock className="w-5 h-5 mr-2" />
            <span>4 min read &bull; June 22, 2026</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead text-xl font-medium text-gray-900 mb-8">
            You don't grow in the gym; you grow in bed. The gym is merely the stimulus. Your recovery is the actual growth phase.
          </p>
          
          <h2 className="text-2xl font-bold text-black mt-10 mb-4">The Hierarchy of Recovery</h2>
          <p className="mb-6">
            Many athletes focus on supplements, ice baths, or massage guns. While these have their place, they account for maybe 5% of your total recovery capacity. The absolute foundation of recovery relies on two pillars: Sleep and Nutrition.
          </p>

          <h2 className="text-2xl font-bold text-black mt-10 mb-4">Non-Negotiable Sleep</h2>
          <p className="mb-6">
            Human Growth Hormone (HGH) is primarily released during deep sleep phases. Consistently sleeping under 7 hours a night blunts this hormonal release, limits glycogen replenishment, and dramatically increases cortisol levels, which is highly catabolic to muscle tissue. Elite athletes prioritize 8-9 hours of quality sleep in a cold, dark room.
          </p>

          <h2 className="text-2xl font-bold text-black mt-10 mb-4">Active Recovery</h2>
          <p className="mb-6">
            Complete rest days are sometimes necessary, but "active recovery" is often superior for clearing metabolic waste. A light 30-minute walk, mobility work, or low-intensity cycling promotes blood flow to damaged tissues without adding systemic fatigue, drastically accelerating the repair process.
          </p>
        </div>
      </article>

      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Elite Recovery Protocols",
            "image": "https://dieselfitness.com/og-image.png",
            "author": {
              "@type": "Organization",
              "name": "Diesel Fitness"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Diesel Fitness",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dieselfitness.com/og-image.png"
              }
            },
            "datePublished": "2026-06-22",
            "dateModified": "2026-06-25"
          })
        }}
      />
    </div>
  );
}
