export default function Composer({ input, setInput, onSend, loading }) {
  return (
    <div className="border-t border-white/10 px-4 py-4 sm:px-5">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="ex) 계란 2개, 닭가슴살 1개"
          className={[
            "h-11 flex-1 rounded-2xl px-4 text-sm outline-none",
            "border border-white/10 bg-white/5 text-slate-100",
            "placeholder:text-slate-400",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
            "focus:border-sky-300/60 focus:ring-4 focus:ring-sky-400/15",
          ].join(" ")}
        />

        <button
          onClick={onSend}
          disabled={loading}
          type="button"
          className={[
            "h-11 shrink-0 rounded-2xl px-4 text-sm font-semibold transition",
            "border border-white/10",
            loading
              ? "cursor-not-allowed bg-white/10 text-slate-400"
              : "bg-white/5 text-slate-100 hover:bg-white/10",
          ].join(" ")}
        >
          {loading ? "전송 중..." : "전송"}
        </button>
      </div>
    </div>
  );
}