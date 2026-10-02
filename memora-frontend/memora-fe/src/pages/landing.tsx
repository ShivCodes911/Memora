import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Logo } from "../icons/logo";

export function Landing() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white cursor-pointer ">
            <a href="/"><Logo /></a>
          </div>
          <span className="font-bold text-xl tracking-tight">Memora</span>
        </div>
        {/* middle options - notch pill */}
        <div className="hidden md:flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 px-2 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-900/80 shadow-sm">
          <a href="#features" className="px-4 py-1.5 rounded-full transition hover:bg-purple-200 dark:hover:bg-purple-600/30 hover:text-purple-600 dark:hover:text-purple-200">Features</a>
          <a href="#how" className="px-4 py-1.5 rounded-full transition hover:bg-purple-200 dark:hover:bg-purple-600/30 hover:text-purple-600 dark:hover:text-purple-200">How it works</a>
          <a href="#types" className="px-4 py-1.5 rounded-full transition hover:bg-purple-200 dark:hover:bg-purple-600/30 hover:text-purple-600 dark:hover:text-purple-200">Content types</a>
          <a href="#faq" className="px-4 py-1.5 rounded-full transition hover:bg-purple-200 dark:hover:bg-purple-600/30 hover:text-purple-600 dark:hover:text-purple-200">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? "☀️" : "🌙"}
          </button>
          <Link to="/signin" className="text-sm font-medium px-4 py-2 rounded-lg bg-purple-200/40 text-purple-600 border border-purple-600/30 transition hover:bg-purple-200 hover:shadow-sm dark:bg-purple-600/20 dark:text-purple-200 dark:border-purple-600/40 dark:hover:bg-purple-600/30">Sign in</Link>
          <Link to="/signup" className="text-sm font-medium px-4 py-2 rounded-lg bg-purple-600 text-white hover:opacity-90">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 py-20 md:py-28 max-w-4xl mx-auto">
        <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-600/20 text-purple-600 dark:text-purple-200 mb-6">
          YOUR SECOND BRAIN
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Remember Everything.<br />
          <span className="text-purple-600">Find Anything. Instantly.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Memora is your personal knowledge vault. Save YouTube videos, tweets, articles, links and notes — then share your entire brain with one link.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="px-7 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:opacity-90">
            Start Saving — It's Free
          </Link>
          <Link to="/signin" className="px-7 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800">
            Live Demo
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">No credit card • Free forever plan • 30-sec setup</p>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-gray-100 dark:bg-gray-900 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Trusted by students, creators & researchers to save 10,000+ links
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 md:px-12 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Everything you need to never forget</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-3">One dashboard for all your digital memory.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { t: "Save Anything", d: "YouTube, Twitter/X, articles, docs, links. One click to add to your brain." },
            { t: "Search Instantly", d: "All your content organized as cards. Find any title or link in seconds." },
            { t: "Share Your Brain", d: "One public link shares your whole collection. Perfect for portfolios & teams." },
            { t: "Clean Dashboard", d: "Sidebar + card view keeps YouTube, tweets and notes beautifully separated." },
            { t: "Private by Default", d: "JWT-secured. Only you see your content until you hit Share." },
            { t: "Access Anywhere", d: "Fully responsive. Your second brain on mobile, tablet and desktop." },
          ].map((f) => (
            <div key={f.t} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition">
              <h3 className="font-bold text-lg">{f.t}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-gray-100 dark:bg-gray-900 px-6 md:px-12 py-16">
        <h2 className="text-3xl font-bold text-center">How Memora works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10 text-center">
          {[
            { s: "1", t: "Create Account", d: "Sign up in 30 seconds." },
            { s: "2", t: "Add Content", d: "Hit Add Content, paste link, pick type." },
            { s: "3", t: "Share Brain", d: "Click Share Brain and send the link." },
          ].map((x) => (
            <div key={x.s} className="bg-white dark:bg-gray-950 p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-600 text-white font-bold flex items-center justify-center">{x.s}</div>
              <h3 className="font-bold mt-4">{x.t}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTENT TYPES */}
      <section id="types" className="px-6 md:px-12 py-16 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold">Save it all in one place</h2>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {["YouTube Videos", "Tweets / X", "Articles", "Documentation", "Links", "Notes"].map((t) => (
            <span key={t} className="px-5 py-2 rounded-full bg-purple-200 dark:bg-purple-600/20 text-purple-600 dark:text-purple-200 font-medium text-sm">{t}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto bg-purple-600 text-white rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Stop losing links. Start building your brain.</h2>
          <p className="mt-4 opacity-90">Join Memora today and carry your knowledge everywhere.</p>
          <Link to="/signup" className="inline-block mt-8 px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 max-w-3xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-center mb-6">FAQ</h2>
        {[
          { q: "Is Memora free?", a: "Yes, core saving, dashboard and sharing are free." },
          { q: "What can I save?", a: "YouTube, Twitter/X, articles, links and text notes." },
          { q: "How does sharing work?", a: "Enable Share and you get a public link to your collection." },
        ].map((f) => (
          <details key={f.q} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
            <summary className="font-semibold cursor-pointer">{f.q}</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{f.a}</p>
          </details>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-bold text-black dark:text-white">Memora © 2026</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-black dark:hover:text-white">Privacy</a>
          <a href="#" className="hover:text-black dark:hover:text-white">Terms</a>
          <a href="#" className="hover:text-black dark:hover:text-white">Contact</a>
          <Link to="/signin" className="hover:text-black dark:hover:text-white">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
