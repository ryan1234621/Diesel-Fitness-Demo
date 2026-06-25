import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Science of Hypertrophy | Diesel Fitness",
  description: "Understanding progressive overload and rep ranges for optimal muscle growth.",
};

export default function ArticlePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto w-full">
        <Link href="/articles" className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
        </Link>
        
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">The Science of Hypertrophy</h1>
          <div className="flex items-center text-gray-500 font-medium">
            <Clock className="w-5 h-5 mr-2" />
            <span>5 min read &bull; June 25, 2026</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead text-xl font-medium text-gray-900 mb-8">
            Building muscle isn't just about moving heavy weight—it's a physiological adaptation driven by mechanical tension, muscle damage, and metabolic stress.
          </p>
          
          <h2 className="text-2xl font-bold text-black mt-10 mb-4">The Mechanism of Muscle Growth</h2>
          <p className="mb-6">
            Hypertrophy refers to the increase in the size of skeletal muscle fibers. To achieve this, the muscles must be exposed to an overload stimulus that forces them to adapt. This is known as the principle of progressive overload.
          </p>

          <h2 className="text-2xl font-bold text-black mt-10 mb-4">Mechanical Tension</h2>
          <p className="mb-6">
            Mechanical tension is arguably the most critical driver of hypertrophy. It occurs when muscles are stretched under load and contracted forcefully. To maximize tension, exercises should be taken close to muscular failure (within 1-3 reps in reserve) while maintaining strict form.
          </p>

          <h2 className="text-2xl font-bold text-black mt-10 mb-4">Rep Ranges</h2>
          <p className="mb-6">
            While the traditional "hypertrophy range" is often cited as 8-12 reps, modern research shows that muscle growth can occur across a much wider spectrum (anywhere from 5 to 30 reps), provided the sets are taken sufficiently close to failure. The key is total volume and sustained mechanical tension.
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
            "headline": "The Science of Hypertrophy",
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
            "datePublished": "2026-06-25",
            "dateModified": "2026-06-25"
          })
        }}
      />
    </div>
  );
}
