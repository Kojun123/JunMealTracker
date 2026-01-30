export default function DashboardHeader({ user, onOpenGoal, onLogout }) {
  const name = user?.email ? user.email.split("@")[0] : null;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
          Meal Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          먹은 거 대충 던지면 기록해주는 앱
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {name && (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-slate-100">
            {name} 님
          </span>
        )}

        <button
          onClick={onOpenGoal}
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          <span aria-hidden>⚙</span>
          <span>목표 설정</span>
        </button>

        <button
          onClick={onLogout}
          type="button"
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
