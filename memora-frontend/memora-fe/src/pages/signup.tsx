import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate, Link } from "react-router-dom";
import signupImg from "../assets/signup.png";
import { Logo } from "../icons/logo";

/* ─── Rotating Header Items with Unique Fonts & Colors ─────────────────────────── */
const ROTATING_ITEMS = [
  {
    text: "second brain?",
    style:
      "bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold tracking-[-0.03em]",
  },
  {
    text: "knowledge hub?",
    style:
      "bg-gradient-to-r from-indigo-400 via-blue-400 to-sky-400 bg-clip-text text-transparent font-semibold tracking-[-0.03em]",
  },
  {
    text: "learning library?",
    style:
      "bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent font-semibold tracking-[-0.03em]",
  },
  {
    text: "idea vault?",
    style:
      "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent font-semibold tracking-[-0.03em]",
  },
  {
    text: "digital memory?",
    style:
      "bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent font-semibold tracking-[-0.03em]",
  },
  {
    text: "research space?",
    style:
      "bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent font-semibold tracking-[-0.03em]",
  },
];

export function Signup() {
  /* ── All form state & logic ── */
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const navigate    = useNavigate();

  const [agreed,      setAgreed]      = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [userFocus,   setUserFocus]   = useState(false);
  const [passFocus,   setPassFocus]   = useState(false);

  /* ── Text rotation animation state ── */
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fadeState,   setFadeState]   = useState<"in" | "out">("in");

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % ROTATING_ITEMS.length);
        setFadeState("in");
      }, 350);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const username = usernameRef.current?.value?.trim();
    const password = passwordRef.current?.value;

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, { username, password });
      navigate("/signin");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen max-h-screen w-full flex bg-white font-sans text-gray-800 overflow-hidden">

      {/* ══════════════════════════════════════
          LEFT COLUMN — Dynamic Typography + Single Screen Fit
      ══════════════════════════════════════ */}
      <div className="h-full flex flex-col justify-between w-full lg:w-[48%] xl:w-[45%] px-8 sm:px-14 lg:px-14 xl:px-20 py-6 sm:py-8 shrink-0 overflow-hidden">

        {/* Top Header / Logo */}
        <div className="flex-shrink-0 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38bdf8] text-white shadow-sm group-hover:bg-[#0284c7] transition-colors">
              <Logo className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Memora</span>
          </Link>
        </div>

        {/* Form Container — Vertically Centered with Multi-Font Text Rotator */}
        <div className="my-auto py-2 w-full max-w-[400px] sm:max-w-[440px] mx-auto lg:mx-0 flex-shrink-0">

          {/* Title with Custom Font & Color Rotator */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111827] leading-[1.2]">
            Ready to build your<br />
            <span
              className={`inline-block pb-2 pt-1 leading-normal transition-all duration-350 ease-in-out transform ${
                ROTATING_ITEMS[phraseIndex].style
              } ${
                fadeState === "in"
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95"
              }`}
            >
              {ROTATING_ITEMS[phraseIndex].text}
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
            Signup to our website and start curating your Memora today!
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
              </svg>
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-5 sm:gap-6">

            {/* Field 1: Full name / Username */}
            <div className="flex flex-col">
              <label className={`text-xs sm:text-sm font-semibold transition-colors ${userFocus ? 'text-[#38bdf8]' : 'text-gray-400'}`}>
                Full name
              </label>
              <div className={`relative mt-1 border-b-2 transition-colors pb-1 ${userFocus ? 'border-[#38bdf8]' : 'border-gray-200'}`}>
                <input
                  ref={usernameRef}
                  type="text"
                  autoComplete="username"
                  onFocus={() => setUserFocus(true)}
                  onBlur={() =>  setUserFocus(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!passwordRef.current?.value) {
                        e.preventDefault();
                        passwordRef.current?.focus();
                      }
                    }
                  }}
                  placeholder="Jane Doe"
                  className="w-full bg-transparent text-base sm:text-lg font-medium text-gray-900 outline-none placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="flex flex-col">
              <label className={`text-xs sm:text-sm font-semibold transition-colors ${passFocus ? 'text-[#38bdf8]' : 'text-gray-400'}`}>
                Password
              </label>
              <div className={`relative mt-1 border-b-2 transition-colors pb-1 flex items-center ${passFocus ? 'border-[#38bdf8]' : 'border-gray-200'}`}>
                <input
                  ref={passwordRef}
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  onFocus={() => setPassFocus(true)}
                  onBlur={() =>  setPassFocus(false)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-base sm:text-lg font-medium text-gray-900 outline-none placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-400 hover:text-[#38bdf8] transition-colors pl-2 cursor-pointer"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 114.24 4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox: Terms & Conditions */}
            <div className="flex items-center gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-[#38bdf8] focus:ring-[#38bdf8] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-500 cursor-pointer select-none">
                I agree to the{" "}
                <a href="#" className="text-[#38bdf8] font-medium hover:underline">
                  Terms & Conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-3.5 rounded-full bg-[#8cd6f7] hover:bg-[#6ec9f5] active:bg-[#52bceb] text-white font-semibold text-base sm:text-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </div>

          </form>

          {/* Sign In Link */}
          <div className="mt-5 text-xs sm:text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/signin" className="text-[#38bdf8] font-semibold hover:underline">
              Sign in
            </Link>
          </div>

        </div>

        {/* Footer info */}
        <div className="flex-shrink-0 text-xs text-gray-400">
          © {new Date().getFullYear()} Memora Inc. All rights reserved.
        </div>

      </div>

      {/* ══════════════════════════════════════
          RIGHT COLUMN — Centered Illustration (Fits 100vh)
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] h-full relative bg-white items-center justify-center p-6 xl:p-10 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={signupImg}
            alt="Memora Signup Visual"
            className="max-w-full max-h-[138vh] object-contain select-none"
          />
        </div>
      </div>

    </div>
  );
}