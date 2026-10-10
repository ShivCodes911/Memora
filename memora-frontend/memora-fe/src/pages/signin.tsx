import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../icons/logo";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);



export function Signin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
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
  };

  const handleSocialClick = () => {
    alert("Integration coming soon!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-[#37352f]">
      {/* Container */}
      <div className="w-full max-w-[380px] px-4 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center w-10 h-9">
          <Logo className="w-8 h-8 text-black" />
        </div>

        {/* Title */}
        <h1 className="text-[28px] font-bold text-center mb-1 leading-tight tracking-tight">
          Your second brain awaits.
        </h1>
        <h2 className="text-[20px] font-medium text-center text-[#787774] mb-8 leading-tight tracking-tight">
          Log in to your Memora account
        </h2>

        {/* Form */}
        <div className="w-full">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSignin} className="w-full flex flex-col">
            <label className="text-[13px] font-medium text-[#787774] mb-1.5">Username</label>
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2383e2]/30 focus:border-[#2383e2] transition-colors mb-4 text-[15px] placeholder:text-[#91918e]"
            />
            
            <label className="text-[13px] font-medium text-[#787774] mb-1.5">Password</label>
            <div className="relative mb-5">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2383e2]/30 focus:border-[#2383e2] transition-colors text-[15px] placeholder:text-[#91918e] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#37352f] transition-colors flex items-center justify-center"
                tabIndex={-1}
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 114.24 4.24M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2383e2] hover:bg-[#1a73cc] text-white font-medium py-2 rounded-md transition-colors text-[14px] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center my-6">
          <div className="flex-grow border-t border-[#e5e5e5]"></div>
          <span className="px-3 text-[#91918e] text-[13px]">or continue with</span>
          <div className="flex-grow border-t border-[#e5e5e5]"></div>
        </div>

        {/* Social Authentication */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleSocialClick}
            className="flex items-center justify-center gap-3 w-full py-2.5 border border-[#e5e5e5] rounded-md hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#37352f]"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center w-full">
          <p className="text-[14px] text-[#787774] mb-5">
            New user? <Link to="/signup" className="text-[#2383e2] hover:underline">Sign up</Link>
          </p>
          <div className="border-t border-[#e5e5e5] pt-4 w-full"></div>
          <p className="text-[12px] text-[#91918e] mt-4 max-w-[320px] mx-auto leading-relaxed">
            By continuing, you acknowledge that you understand and agree to the{" "}
            <a href="#" className="underline hover:text-gray-500">Terms & Conditions</a> and{" "}
            <a href="#" className="underline hover:text-gray-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}