import { useEffect } from "react";

export default function GoalSettingModal({
  open,
  targetCalories,
  setTargetCalories,
  targetProtein,
  setTargetProtein,
  onClose,
  onSave,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* card */}
      <div
        className={[
          "relative w-full max-w-sm rounded-3xl",
          "border border-white/12 bg-slate-950/60 text-slate-100",
          "shadow-[0_24px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur",
          "p-6",
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">목표 설정</h2>
            <p className="mt-1 text-xs text-slate-400">
              하루 목표를 정해두면 자동으로 남은 양을 보여드려요
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-slate-200 hover:bg-white/10"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* calories */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              목표 칼로리
              <span className="ml-2 text-xs font-medium text-slate-400">
                (kcal)
              </span>
            </label>

            <input
              type="number"
              inputMode="numeric"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              placeholder="예: 2000"
              className={[
                "h-11 w-full rounded-2xl px-4 text-sm outline-none tabular-nums",
                "border border-white/10 bg-white/5 text-slate-100",
                "placeholder:text-slate-400",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                "focus:border-sky-300/60 focus:ring-4 focus:ring-sky-400/15",
              ].join(" ")}
            />
          </div>

          {/* protein */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              목표 단백질
              <span className="ml-2 text-xs font-medium text-slate-400">(g)</span>
            </label>

            <input
              type="number"
              inputMode="numeric"
              value={targetProtein}
              onChange={(e) => setTargetProtein(e.target.value)}
              placeholder="예: 150"
              className={[
                "h-11 w-full rounded-2xl px-4 text-sm outline-none tabular-nums",
                "border border-white/10 bg-white/5 text-slate-100",
                "placeholder:text-slate-400",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                "focus:border-sky-300/60 focus:ring-4 focus:ring-sky-400/15",
              ].join(" ")}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            취소
          </button>

          <button
            type="button"
            onClick={onSave}
            className={[
              "h-11 rounded-2xl px-5 text-sm font-semibold text-white transition",
              "bg-gradient-to-r from-sky-500 to-violet-500 hover:opacity-95 active:opacity-90",
              "shadow-[0_12px_40px_-20px_rgba(56,189,248,0.7)]",
            ].join(" ")}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
