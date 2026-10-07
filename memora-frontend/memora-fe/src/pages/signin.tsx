import { useRef, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate, Link } from "react-router-dom";
import signinImg from "../assets/signin.png";
import { Logo } from "../icons/logo";
import { ShaderBackground } from "../components/ShaderBackground";

export function Signin() {
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const navigate    = useNavigate();

  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [userFocus, setUserFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const username = usernameRef.current?.value?.trim();
    const password = passwordRef.current?.value;

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signin`, {
        username,
        password,
      });

      const jwt = response.data.token;
      if (jwt) {
        localStorage.setItem("token", jwt);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#0c0a09] p-3 sm:p-6 lg:p-8 flex items-center justify-center font-sans text-gray-800 overflow-hidden">

      {/* 🌌 Dynamic Animated Fluid Shader Background */}
      <ShaderBackground />

      {/* ══════════════════════════════════════
          ELEVATED PAYONEER CARD CONTAINER WITH GLASS BLUR
      ══════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[1240px] h-full max-h-[90vh] bg-[#141312]/95 backdrop-blur-2xl rounded-[28px] sm:rounded-[36px] overflow-hidden flex flex-col lg:flex-row shadow-[0_30px_90px_rgba(0,0,0,0.8)] border border-white/10">

        {/* ══════════════════════════════════════
            LEFT PANEL — Signin Image Asset Display (Clean, No Extra Text)
        ══════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] items-center justify-center bg-[#141312]/90 relative overflow-hidden border-r border-white/5">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={signinImg}
              alt="Memora Sign In Visual"
              className="max-w-full max-h-[106vh] object-cover select-none"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT PANEL — Payoneer-Style Light Signin Form
        ══════════════════════════════════════ */}
        <div className="flex-1 bg-white rounded-t-[28px] lg:rounded-t-none lg:rounded-r-[36px] flex flex-col justify-between p-8 sm:p-12 xl:p-16 h-full overflow-y-auto lg:overflow-hidden">

          {/* Top Bar: Logo Left, Sign Up Right */}
          <div className="flex items-center justify-between flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-pink-500 text-white shadow-md group-hover:opacity-90 transition-opacity">
                <Logo className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Memora</span>
            </Link>

            <Link
              to="/signup"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors py-1.5 px-3 rounded-full hover:bg-gray-50"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign Up
            </Link>
          </div>

          {/* Form Container Vertically Centered */}
          <div className="my-auto py-6 w-full max-w-[400px] sm:max-w-[440px] mx-auto flex-shrink-0">

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1a1a1a] tracking-tight mb-8">
              Sign In
            </h2>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                </svg>
                {error}
              </div>
            )}

            {/* Signin Form */}
            <form onSubmit={handleSignin} className="flex flex-col gap-4">

              {/* Input 1: Email or Username */}
              <div>
                <div className={`rounded-full border bg-white px-6 py-3.5 transition-all duration-200 shadow-sm ${userFocus ? "border-orange-500 ring-2 ring-orange-500/15" : "border-gray-200 hover:border-gray-300"}`}>
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
                    placeholder="Email or Username"
                    className="w-full bg-transparent text-sm sm:text-base font-normal text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Input 2: Password */}
              <div>
                <div className={`rounded-full border bg-white px-6 py-3.5 transition-all duration-200 shadow-sm flex items-center justify-between ${passFocus ? "border-orange-500 ring-2 ring-orange-500/15" : "border-gray-200 hover:border-gray-300"}`}>
                  <input
                    ref={passwordRef}
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    onFocus={() => setPassFocus(true)}
                    onBlur={() =>  setPassFocus(false)}
                    placeholder="Password"
                    className="w-full bg-transparent text-sm sm:text-base font-normal text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-gray-400 hover:text-gray-600 transition-colors pl-2 shrink-0"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 114.24 4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="pl-3 pt-0.5">
                <a href="#" className="text-xs sm:text-sm font-semibold text-[#ff5226] hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ff0066] hover:opacity-95 text-white font-semibold text-base shadow-lg shadow-[#ff4500]/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

          {/* Bottom Footer Bar */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400 flex-shrink-0 pt-4 border-t border-gray-100">
            <span>© {new Date().getFullYear()} Memora Inc.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-600 transition-colors">Contact Us</a>
              <span className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                English
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}