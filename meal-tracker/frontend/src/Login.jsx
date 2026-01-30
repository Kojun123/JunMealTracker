import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setAccessToken } from "./lib/apiFetch";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      setAccessToken(data.accessToken);
      navigate("/");
    } catch (e2) {
      console.error(e2);
      setErr("로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href =
      `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur shadow-[0_20px_70px_-30px_rgba(0,0,0,0.9)] sm:p-8">
            {/* header */}
            <header className="space-y-2">
              <div className="text-xl font-semibold tracking-tight sm:text-2xl">
                Meal Tracker
              </div>
              <div className="text-xs text-slate-400 sm:text-sm">
                빠르게 기록, 간편하게 관리하는 식사 기록 앱
              </div>
            </header>

            <form
              className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
              onSubmit={submit}
            >
              {/* email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  이메일
                </label>
                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none placeholder:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] focus:border-sky-300/60 focus:ring-4 focus:ring-sky-400/15"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              {/* password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  비밀번호
                </label>

                <div className="relative">
                  <input
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pr-11 text-sm text-slate-100 outline-none placeholder:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] focus:border-sky-300/60 focus:ring-4 focus:ring-sky-400/15"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100"
                    aria-label="비밀번호 보기"
                  >
                    {showPw ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4.5 9 7-1.01 2.05-2.86 4.03-5.17 5.27M6.7 6.7C4.3 8.12 3 10.16 3 12c1.01 2.05 2.86 4.03 5.17 5.27"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M1.5 12S5.25 5.25 12 5.25 22.5 12 22.5 12 18.75 18.75 12 18.75 1.5 12 1.5 12z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {err && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {err}
                </div>
              )}

              {/* submit */}
              <button
                className={[
                  "h-11 w-full rounded-2xl text-sm font-semibold transition",
                  "shadow-[0_12px_40px_-20px_rgba(56,189,248,0.7)]",
                  loading
                    ? "cursor-not-allowed bg-white/10 text-slate-400"
                    : "bg-gradient-to-r from-sky-500 to-violet-500"
                ].join(" ")}
                type="submit"
                disabled={loading}
              >
                {loading ? "로그인 중" : "로그인"}
              </button>

              {/* divider */}
              <div className="relative py-2">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
                <div className="relative mx-auto w-fit rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-[11px] text-slate-300">
                  또는
                </div>
              </div>

              {/* google */}
              <button
                type="button"
                onClick={googleLogin}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  className="h-4 w-4"
                />
                Google로 로그인
              </button>

              <div className="pt-1 text-center text-sm text-slate-300">
                <button
                  type="button"
                  className="font-semibold text-slate-100 hover:underline"
                  onClick={() => navigate("/signup")}
                >
                  회원가입
                </button>
              </div>
            </form>
          </div>

          <div className="mt-5 text-center text-[11px] text-slate-500 sm:mt-6">
            © Meal Tracker
          </div>
        </div>
      </div>
    </div>
  );
}
