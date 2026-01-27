"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const BADGE =
  "inline-flex items-center text-xs font-mono tracking-wider uppercase rounded-sm px-1 py-0.5 lg:px-2 lg:py-1 bg-[rgba(255,237,160,0.1)] border border-[rgba(255,237,160,0.2)] text-[#ffeda0]";

const PLATFORMS = [
  { name: "Twitter/X", id: "twitter", href: "https://docs.getlate.dev/platforms/twitter" },
  { name: "Instagram", id: "instagram", href: "https://docs.getlate.dev/platforms/instagram" },
  { name: "TikTok", id: "tiktok", href: "https://docs.getlate.dev/platforms/tiktok" },
  { name: "LinkedIn", id: "linkedin", href: "https://docs.getlate.dev/platforms/linkedin" },
  { name: "Facebook", id: "facebook", href: "https://docs.getlate.dev/platforms/facebook" },
  { name: "YouTube", id: "youtube", href: "https://docs.getlate.dev/platforms/youtube" },
  { name: "Threads", id: "threads", href: "https://docs.getlate.dev/platforms/threads" },
  { name: "Reddit", id: "reddit", href: "https://docs.getlate.dev/platforms/reddit" },
  { name: "Pinterest", id: "pinterest", href: "https://docs.getlate.dev/platforms/pinterest" },
  { name: "Bluesky", id: "bluesky", href: "https://docs.getlate.dev/platforms/bluesky" },
  { name: "Telegram", id: "telegram", href: "https://docs.getlate.dev/platforms/telegram" },
  { name: "Snapchat", id: "snapchat", href: "https://docs.getlate.dev/platforms/snapchat" },
  { name: "Google Business", id: "google-business", href: "https://docs.getlate.dev/platforms/google-business" },
];

const TESTIMONIALS = [
  { name: "Dmytro Potekhin", role: "Founder, Factology.Systems", text: "Thanks for Late - I have just discovered it, but I love it already!" },
  { name: "Razvan Ghetiu", role: "Founder, purplepalm.ai", text: "I use Late for my SaaS purplepalm.ai. Integration was incredibly easy - had everything up and running in less than an hour. The API is super straightforward." },
  { name: "Zahareus", role: "Developer", text: "I spent a long time looking for a simple solution for integration into the self-hosted version of n8n. Late was just perfect! I highly recommend it to everyone." },
  { name: "Deborah", role: "Social Media Manager", text: "This concept to have an API first social media scheduler is just phenomenal! The amount of time saved, the automation capabilities is unlike anything else." },
  { name: "Valentina", role: "Content Creator", text: "Easiest set-up ever, great reliability, saves me hours per week. I love how you can customize the message for each platform starting from the same content." },
  { name: "Jim", role: "Developer", text: "Late makes programmatic multi-platform social posting as simple as I've ever seen it. The API is straightforward, well-documented, and simple. It just works." },
];

const FEATURES = [
  { method: "POST", methodColor: "bg-[#22c55e20] text-[#22c55e]", endpoint: "/posts", description: "One call. 13 platforms. Text, images, video, carousels—scheduled or now.", href: "https://docs.getlate.dev/core/posts" },
  { method: "GET", methodColor: "bg-[#3b82f620] text-[#3b82f6]", endpoint: "/connect/{platform}", description: "Let your users connect accounts. One OAuth flow, all platforms. No dev apps.", href: "https://docs.getlate.dev/core/connect" },
  { method: "GET", methodColor: "bg-[#3b82f620] text-[#3b82f6]", endpoint: "/analytics", description: "Likes, shares, reach, impressions, clicks, views. Unified across platforms.", href: "https://docs.getlate.dev/core/analytics" },
  { method: "POST", methodColor: "bg-[#22c55e20] text-[#22c55e]", endpoint: "/webhooks/settings", description: "Posts published? Failed? Get pinged instantly. No polling required.", href: "https://docs.getlate.dev/core/webhooks" },
  { method: "GET", methodColor: "bg-[#3b82f620] text-[#3b82f6]", endpoint: "/inbox/conversations", description: "DMs, comments, reviews. One inbox for all platforms. Reply programmatically.", href: "https://docs.getlate.dev/core/inbox" },
];

const FAQ = [
  { q: "How fast can I integrate Late compared to building custom integrations?", a: "Custom integrations take 8-12 months. Late takes under an hour." },
  { q: "Do I need to create developer apps for each platform?", a: "No. We handle all developer apps, approvals, and quota limits." },
  { q: "How reliable is the scheduling?", a: "We auto-transform content for each platform's requirements. Posts go out on time, every time." },
  { q: "Is Late white-label friendly?", a: "Yes. Your users never see Late branding." },
  { q: "Can Late handle thousands of client accounts?", a: "Yes. Scales to 5,000+ accounts, no changes needed." },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen font-mono relative overflow-hidden"
      style={{ backgroundColor: "#222222", color: "#fafafa" }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-amber-900/20 pointer-events-none" />
      <div className="hidden md:block absolute top-0 left-1/4 z-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 right-1/4 z-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-yellow-500/5 to-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[#333]" style={{ backgroundColor: "rgba(34,34,34,0.8)" }}>
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center gap-2 shrink-0" title="Late homepage">
              <img
                src="https://getlate.dev/images/icon_light.svg"
                alt="Late logo"
                width={48}
                height={48}
                className="w-12 h-12 transition-transform duration-500 hover:rotate-[360deg]"
              />
              <span className="text-xl font-bold text-white font-mono">Late</span>
              <span className="text-xs text-[#a1a1aa] ml-1">Sandbox</span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:justify-center lg:gap-8 lg:items-center">
            <Link href="https://docs.getlate.dev" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors font-mono">
              docs
            </Link>
            <Link href="https://getlate.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors font-mono">
              pricing
            </Link>
          </div>
          <div className="hidden lg:flex lg:justify-end lg:flex-1 lg:gap-3 lg:items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#404040] border border-[#404040] hover:border-[#525252] rounded-lg transition-all duration-200 text-white font-mono text-sm"
            >
              dashboard
            </Link>
            <Link
              href="/dashboard"
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-semibold text-sm h-10 px-6 rounded-md transition-colors flex items-center justify-center"
            >
              get started
            </Link>
          </div>
          <div className="lg:hidden">
            <Link href="/dashboard" className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-semibold text-sm px-4 py-2 rounded-md transition-colors">
              dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <div className="max-w-xl lg:max-w-3xl mx-auto px-8 pt-12 lg:pt-24">
          <div className="mb-8 lg:mb-10 flex items-center gap-3">
            <span className={BADGE}>Social Media API</span>
            <Link
              href="https://docs.getlate.dev/changelog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs lg:text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors flex items-center gap-1"
            >
              What&apos;s new
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight mb-5 lg:mb-8 text-[#fafafa]">
            The API that replaces 13 social media integrations.
          </h1>
          <p className="text-base lg:text-xl mb-7 lg:mb-10 text-[#a1a1aa]">
            We handle approvals, rate limits, and API changes. One endpoint to post, schedule, and pull analytics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <Link
              href="/dashboard"
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-semibold text-sm lg:text-base h-10 lg:h-12 px-3 lg:px-6 rounded-md transition-colors flex items-center justify-center"
            >
              Get started
            </Link>
            <button
              type="button"
              className="bg-white hover:bg-[#f4f4f5] text-black px-3 lg:px-6 h-10 lg:h-12 rounded-md font-semibold text-sm lg:text-base flex items-center justify-center gap-3 transition-colors"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>
          <p className="text-xs lg:text-sm text-[#71717a] mb-8 lg:mb-12">No credit card required</p>

          {/* Code block */}
          <div className="mb-16 lg:mb-24 rounded-lg lg:rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#333]">
            <div className="px-4 py-2 lg:py-3 flex items-center justify-between bg-[#161616] border-b border-[#333]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 lg:gap-2">
                  <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full bg-red-500" />
                  <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full bg-green-500" />
                </div>
                <span className="text-xs lg:text-sm text-[#71717a] ml-2">schedule-post.ts</span>
              </div>
              <span className="text-xs text-[#52525b]">TypeScript</span>
            </div>
            <pre className="p-4 lg:p-6 text-[10px] sm:text-xs lg:text-sm overflow-x-auto font-mono">
              <code className="text-[#d4d4d4]">
                <span className="text-[#c586c0]">const</span> <span className="text-[#9cdcfe]">response</span>{" "}
                <span className="text-[#d4d4d4]">=</span> <span className="text-[#c586c0]">await</span>{" "}
                <span className="text-[#dcdcaa]">fetch</span>
                <span className="text-[#d4d4d4]">(</span>
                <span className="text-[#ce9178]">&quot;https://getlate.dev/api/v1/posts&quot;</span>
                <span className="text-[#d4d4d4]">, </span>
                <span className="text-[#d4d4d4]">{"{"}</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">method</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#ce9178]">&quot;POST&quot;</span>
                <span className="text-[#d4d4d4]">,</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">headers</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#d4d4d4]">{"{"}</span>{" "}
                <span className="text-[#ce9178]">&quot;Authorization&quot;</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#ce9178]">{`\`Bearer $`}</span>
                <span className="text-[#d4d4d4]">{`{`}</span>
                <span className="text-[#9cdcfe]">LATE_API_KEY</span>
                <span className="text-[#d4d4d4]">{`}`}</span>
                <span className="text-[#ce9178]">`</span>{" "}
                <span className="text-[#d4d4d4]">{"}"}</span>
                <span className="text-[#d4d4d4]">,</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">body</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#4ec9b0]">JSON</span>
                <span className="text-[#d4d4d4]">.</span>
                <span className="text-[#dcdcaa]">stringify</span>
                <span className="text-[#d4d4d4]">(</span>
                <span className="text-[#d4d4d4]">{"{"}</span>
                {"\n    "}
                <span className="text-[#9cdcfe]">text</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#ce9178]">&quot;New feature drop!&quot;</span>
                <span className="text-[#d4d4d4]">,</span>
                {"\n    "}
                <span className="text-[#9cdcfe]">platforms</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#d4d4d4]">[</span>
                <span className="text-[#ce9178]">&quot;twitter&quot;</span>
                <span className="text-[#d4d4d4]">, </span>
                <span className="text-[#ce9178]">&quot;instagram&quot;</span>
                <span className="text-[#d4d4d4]">, </span>
                <span className="text-[#ce9178]">&quot;linkedin&quot;</span>
                <span className="text-[#d4d4d4]">],</span>
                {"\n    "}
                <span className="text-[#9cdcfe]">mediaUrls</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#d4d4d4]">[</span>
                <span className="text-[#ce9178]">&quot;https://example.com/demo.mp4&quot;</span>
                <span className="text-[#d4d4d4]">],</span>
                {"\n    "}
                <span className="text-[#9cdcfe]">scheduledFor</span>
                <span className="text-[#d4d4d4]">: </span>
                <span className="text-[#ce9178]">&quot;2025-01-15T09:00:00Z&quot;</span>
                {"\n  "}
                <span className="text-[#d4d4d4]">{"}"}</span>
                <span className="text-[#d4d4d4]">)</span>
                {"\n"}
                <span className="text-[#d4d4d4]">{"}"}</span>
                <span className="text-[#d4d4d4]">);</span>
              </code>
            </pre>
          </div>

          {/* Platforms */}
          <div className="mb-16">
            <span className={`${BADGE} mb-8 block w-fit`}>Platforms</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-[#d4d4d8]">
              {PLATFORMS.map((p) => (
                <Link
                  key={p.id}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 hover:text-white transition-colors"
                >
                  {p.name}
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trusted by */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 px-8">
              <p className="text-sm w-full text-center mb-0 text-[#71717a]">Trusted by builders at</p>
              <div className="max-w-2xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 items-center mt-4">
                {["ClickUp", "RE/MAX", "PwC", "Peakweb", "Reportei", "Blenda Labs"].map((name) => (
                  <div key={name} className="flex items-center justify-center text-[#71717a] text-sm">
                    {name}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mb-16 px-8">
              <Link
                href="https://getlate.dev/open"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center gap-4 text-sm hover:text-[#d4d4d4] transition-colors text-[#71717a]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">85,382 posts this week</span>
                </div>
              </Link>
            </div>

            {/* Testimonials */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 px-8">
              {[0, 1, 2].map((col) => (
                <div key={col} className="flex flex-col gap-4">
                  {TESTIMONIALS.filter((_, i) => i % 3 === col).map((t, i) => (
                    <div
                      key={t.name}
                      className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg"
                    >
                      <p className="text-sm text-zinc-100 mb-4">{t.text}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-sm">
                          {t.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-zinc-100 block">{t.name}</span>
                          <p className="text-sm text-zinc-500 truncate">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="md:hidden overflow-x-auto pb-4 px-8">
              <div className="flex gap-4" style={{ width: "max-content" }}>
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.name}
                    className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg w-72 flex-shrink-0"
                  >
                    <p className="text-sm text-zinc-100 mb-4">{t.text}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-zinc-100 block">{t.name}</span>
                        <p className="text-sm text-zinc-500 truncate">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works, What You Can Do, FAQ */}
        <div className="max-w-xl mx-auto px-8">
          <div className="mb-16">
            <span className={`${BADGE} mb-8 block w-fit`}>How It Works</span>
            <ol className="space-y-4">
              {[
                { n: "1.", title: "Get your API key.", desc: "Sign up and grab your key. Takes 30 seconds." },
                { n: "2.", title: "Connect accounts.", desc: "Link social accounts via OAuth. No developer apps needed." },
                { n: "3.", title: "Start posting.", desc: "One API call to publish everywhere." },
              ].map((step) => (
                <li key={step.n} className="flex gap-3">
                  <span className="text-sm leading-5 text-[#a1a1aa]">{step.n}</span>
                  <div>
                    <div className="font-semibold text-sm leading-5 text-[#fafafa]">{step.title}</div>
                    <div className="text-sm leading-5 text-[#a1a1aa]">{step.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-16">
            <span className={`${BADGE} mb-8 block w-fit`}>What You Can Do</span>
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <Link
                  key={f.endpoint}
                  href={f.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg transition-colors hover:bg-zinc-800/50 bg-[#1a1a1a] border border-[#333]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${f.methodColor}`}>
                      {f.method}
                    </span>
                    <span className="text-sm font-mono text-[#fafafa]">{f.endpoint}</span>
                  </div>
                  <p className="text-sm text-[#a1a1aa]">{f.description}</p>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="https://docs.getlate.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
              >
                See all endpoints →
              </Link>
            </div>
          </div>

          <div className="mb-16">
            <span className={`${BADGE} mb-8 block w-fit`}>Frequently Asked Questions</span>
            <dl className="space-y-6">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-sm text-[#fafafa]">{item.q}</dt>
                  <dd className="mt-1 grid grid-cols-[auto_1fr] gap-x-2">
                    <span className="text-[#a1a1aa]">└</span>
                    <span className="text-sm text-[#a1a1aa]">{item.a}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <p className="text-sm text-[#a1a1aa]">
                Still have questions?{" "}
                <Link href="https://getlate.dev" target="_blank" rel="noopener noreferrer" className="text-[#ffeda0] hover:underline">
                  Ask our team →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="py-12 px-8 max-w-xl mx-auto">
          <p className="text-sm mb-2 text-[#fafafa]">Stop maintaining 13 integrations.</p>
          <p className="text-sm mb-6 text-[#a1a1aa]">Start shipping features.</p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-semibold text-sm h-10 px-6 rounded-md transition-colors flex items-center justify-center w-fit"
          >
            Get started
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-8 font-mono border-t border-[#333]" style={{ backgroundColor: "#222222" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white mb-2">PRODUCT</span>
              <a href="https://docs.getlate.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Documentation</a>
              <Link href="/dashboard" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Dashboard</Link>
              <a href="https://getlate.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Pricing</a>
              <a href="https://getlate.dev/features" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Features</a>
              <a href="https://docs.getlate.dev/changelog" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Changelog</a>
              <a href="https://getlate.dev/open" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Open analytics</a>
              <a href="https://getlate.dev/tools" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Tools</a>
              <a href="https://getlate.dev/n8n-templates" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">n8n Templates</a>
              <a href="https://late.featurebase.app/roadmap" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Roadmap</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white mb-2">INTEGRATIONS</span>
              <a href="https://getlate.dev/tiktok" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">TikTok</a>
              <a href="https://getlate.dev/instagram" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Instagram</a>
              <a href="https://getlate.dev/facebook" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Facebook</a>
              <a href="https://getlate.dev/youtube" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">YouTube</a>
              <a href="https://getlate.dev/linkedin" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">LinkedIn</a>
              <a href="https://getlate.dev/x" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">X (Twitter)</a>
              <a href="https://getlate.dev/threads" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Threads</a>
              <a href="https://getlate.dev/reddit" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Reddit</a>
              <a href="https://getlate.dev/pinterest" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Pinterest</a>
              <a href="https://getlate.dev/bluesky" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Bluesky</a>
              <a href="https://getlate.dev/googlebusiness" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Google Business</a>
              <a href="https://getlate.dev/telegram" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Telegram</a>
              <a href="https://getlate.dev/snapchat" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Snapchat</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white mb-2">COMPANY</span>
              <a href="https://getlate.dev/blog" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Blog</a>
              <a href="https://getlate.dev/social-media-tips" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Social Media Tips</a>
              <a href="https://getlate.dev/affiliates" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Affiliates</a>
              <a href="https://getlate.dev/tos" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Terms</a>
              <a href="https://getlate.dev/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Privacy</a>
              <a href="https://getlate.dev/content-guidelines" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Content Guidelines</a>
              <a href="https://getlate.dev/legal-disclosure" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Impressum</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white mb-2">COMPARISONS</span>
              <a href="https://getlate.dev/alternatives/hootsuite" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">vs Hootsuite</a>
              <a href="https://getlate.dev/alternatives/buffer" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">vs Buffer</a>
              <a href="https://getlate.dev/alternatives/metricool" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">vs Metricool</a>
              <a href="https://getlate.dev/alternatives/ayrshare" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">vs Ayrshare</a>
              <a href="https://getlate.dev/alternatives/blotato" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">vs Blotato</a>
              <a href="https://getlate.dev/alternatives/publer" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">vs Publer</a>
              <a href="https://getlate.dev/alternatives/postiz" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">vs Postiz</a>
              <a href="https://getlate.dev/compare" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Compare</a>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-xs font-medium text-white mb-2 block">TOOLS</span>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 mt-2">
                <a href="https://getlate.dev/tools/tiktok-video-downloader" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">TikTok Video Downloader</a>
                <a href="https://getlate.dev/tools/youtube-video-downloader" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">YouTube Video Downloader</a>
                <a href="https://getlate.dev/tools/instagram-handle-checker" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Instagram Handle Checker</a>
                <a href="https://getlate.dev/tools/youtube-audio-downloader" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">YouTube Audio Extractor</a>
                <a href="https://getlate.dev/tools/instagram-banned-hashtag-checker" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Instagram Hashtag Checker</a>
                <a href="https://getlate.dev/tools/youtube-shorts-downloader" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">YouTube Shorts Downloader</a>
                <a href="https://getlate.dev/tools/tiktok-username-checker" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">TikTok Username Checker</a>
                <a href="https://getlate.dev/tools/youtube-reel-downloader" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">YouTube Reel Downloader</a>
                <a href="https://getlate.dev/tools/instagram-reel-downloader" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Instagram Reel Downloader</a>
                <a href="https://getlate.dev/tools/youtube-live-downloader" target="_blank" rel="noopener noreferrer" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">YouTube Live Downloader</a>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center gap-4">
            <a href="https://www.linkedin.com/in/miquelpalet/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
              <img src="https://getlate.dev/images/linkedin_profile.webp" alt="Miquel Palet" width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
            </a>
            <a href="https://linkedin.com/company/getlatedev" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors">
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a href="https://www.trustpilot.com/review/getlate.dev" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors">
              <TrustpilotIcon className="w-4 h-4" />
            </a>
            <a href="https://t.me/lateapi" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-white transition-colors">
              <TelegramIcon className="w-4 h-4" />
            </a>
            <p className="text-sm text-[#a1a1aa]">© 2026 Late</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TrustpilotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
