import { Link } from "react-router-dom";
import { Logo } from "../icons/logo";
import { useState } from "react";

interface NavbarProps {
  dark: boolean;
  setDark: (val: boolean) => void;
}

export function Navbar({ dark, setDark }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 w-full flex justify-center pointer-events-none">
      <nav className="pointer-events-auto relative w-full max-w-5xl bg-white/70 dark:bg-neutral-900/75 backdrop-blur-lg backdrop-saturate-150 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 group-hover:shadow-purple-600/50 transition-all duration-300">
            <Logo />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            Memora
          </span>
        </Link>

        {/* MIDDLE NAV OPTIONS (GLASS PILL CONTAINER) */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-900/[0.04] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] backdrop-blur-md shadow-inner">
          <a
            href="#features"
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all duration-200"
          >
            Features
          </a>
          <a
            href="#how"
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all duration-200"
          >
            How it works
          </a>
          <a
            href="#types"
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all duration-200"
          >
            Content types
          </a>
          <a
            href="#faq"
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm transition-all duration-200"
          >
            FAQ
          </a>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="hidden sm:flex items-center gap-2">
          {/* THEME TOGGLE */}
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-black/5 dark:border-white/15 backdrop-blur-md text-gray-700 dark:text-white flex items-center justify-center transition-all duration-200 text-sm shadow-sm hover:shadow-md focus:outline-none"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* SIGN IN */}
          <Link
            to="/signin"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/70 hover:bg-white dark:text-neutral-200 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-200"
          >
            Sign in
          </Link>

          {/* GET STARTED (PRIMARY CTA WITH GLOW) */}
          <Link
            to="/signup"
            className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-slate-100 transition-all duration-200 shadow-md shadow-purple-600/25 dark:shadow-white/10 hover:shadow-lg active:scale-95"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-black/5 dark:border-white/15 backdrop-blur-md text-gray-700 dark:text-white flex items-center justify-center transition-all duration-200 text-sm shadow-sm"
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-black/5 dark:border-white/15 backdrop-blur-md text-gray-700 dark:text-white flex items-center justify-center transition-all shadow-sm"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] md:hidden text-gray-900 dark:text-white z-50 ring-1 ring-black/5 dark:ring-white/10">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-neutral-200 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
          >
            Features
          </a>
          <a
            href="#how"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-neutral-200 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
          >
            How it works
          </a>
          <a
            href="#types"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-neutral-200 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
          >
            Content types
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-neutral-200 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
          >
            FAQ
          </a>
          <div className="pt-2 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-neutral-200 bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


