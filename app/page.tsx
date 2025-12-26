import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-6xl font-bold text-white mb-4">
              README Stats Generator
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Create stunning, customizable GitHub profile stats cards for your
              README. Beautiful themes, real-time preview, and easy embedding.
            </p>
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <Link href="/builder">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started →
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View Demo
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="glass-dark p-6 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Beautiful Themes
              </h3>
              <p className="text-slate-400">
                Choose from 6 pre-built themes or customize your own colors
              </p>
            </div>

            <div className="glass-dark p-6 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-slate-400">
                Aggressive caching and CDN optimization for instant loading
              </p>
            </div>

            <div className="glass-dark p-6 rounded-xl border border-slate-700">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Rich Stats
              </h3>
              <p className="text-slate-400">
                Profile, repos, commits, streaks, languages, and achievements
              </p>
            </div>
          </div>

          {/* Example */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-white mb-6">
              See it in action
            </h2>
            <div className="glass-dark p-8 rounded-xl border border-slate-700">
              <img
                src="/api/generate?user=torvalds&theme=dark&cards=profile,repositories,commits,streak&layout=grid"
                alt="Example GitHub Stats"
                className="w-full max-w-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
