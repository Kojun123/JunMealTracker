import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import Signup from "./Signup";
import Login from "./Login";
import OAuthCallback from "./OAuthCallback";
import { restoreSession, subscribeAccessToken } from "./lib/apiFetch";
import { Navigate } from "react-router-dom";

function StatusScreen({ title, description, onRetry }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/5 p-6 text-center shadow-xl backdrop-blur sm:p-8">
        <h1 className="text-lg font-semibold">
          {title}
        </h1>

        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-400">
          {description}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 h-11 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 text-sm font-semibold text-white transition hover:opacity-90"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}

function ProtectedRoute({ loading, authed, children, restoreError }) {
  if (loading) {
    return (
      <StatusScreen
        title="로그인 상태 확인 중"
        description="잠시만 기다려 주세요"
      />
    );
  }

  if (restoreError) {
     return (
      <StatusScreen
        title="연결할 수 없어요"
        description={"인터넷 연결이나 서버 상태를 확인한 뒤\n 다시 시도해주세요."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [restoreError, setRestoreError] = useState(false);

  useEffect(() => {
    const unsub = subscribeAccessToken((token) => {
      setAuthed(!!token);
      setLoading(false);
    });
    (async () => {
      try {
      const ok = await restoreSession();
      setAuthed(ok);
    } catch(error) {
      console.error("로그인 상태 복구 실패", error);
      setRestoreError(true);
    } finally {
      setLoading(false);    
    }
  })();

    return unsub;
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route
        path="/"
        element={
          <ProtectedRoute 
            loading={loading}
            authed={authed}
            restoreError={restoreError}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
