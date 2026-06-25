import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mastering the Deadlift | Diesel Fitness",
  description: "A complete biomechanical breakdown for the ultimate compound movement.",
};

export default function ArticlePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto w-full">
        <Link href="/articles" className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
        </Link>
        
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Mastering the Deadlift</h1>
          <div className="flex items-center text-gray-500 font-medium">
            <Clock className="w-5 h-5 mr-2" />
            <span>6 min read &bull; June 15, 2026</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead text-xl font-medium text-gray-900 mb-8">
            The deadlift is the undisputed king of compound exercises. It recruits more muscle mass than virtually any other movement, but it is also the most unforgiving of poor technique.
          </p>
          
          <h2 className="text-2xl font-bold text-black mt-10 mb-4">The Setup is Everything</h2>
          <p className="mb-6">
            A successful deadlift is decided before the bar even leaves the floor. The setup requires immense core bracing, a neutral spine, and optimal foot positioning. The bar should intersect the middle of your foot, and your shins should barely touch the knurling when you hinge down to grip the bar.
          </p>

          <h2 className="text-2xl font-bold text-black mt-10 mb-4">Creating Tension (Taking the Slack Out)</h2>
          <p className="mb-6">
            You never want to "jerk" the bar off the floor. Instead, you must pull the slack out of the bar. This means pulling up against the bar just enough so that it clicks against the inside of the plates, engaging your lats and hamstrings simultaneously before initiating the true lift.
          </p>

          <h2 className="text-2xl font-bold text-black mt-10 mb-4">The Leg Press Cue</h2>
          <p className="mb-6">
            Many people view the deadlift strictly as a "pulling" movement, leading to extreme lower back rounding. Instead, cue yourself to "push the floor away" as if you were on a leg press machine. This engages the powerful quadriceps to initiate the lift off the floor, saving your lower back and generating maximum force.
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
            "headline": "Mastering the Deadlift",
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
            "datePublished": "2026-06-15",
            "dateModified": "2026-06-25"
          })
        }}
      />
    </div>
  );
}
