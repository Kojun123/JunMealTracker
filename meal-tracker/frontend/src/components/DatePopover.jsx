import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function DatePopover({ selectedDate, setSelectedDate }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const selected = useMemo(() => dayjs(selectedDate).toDate(), [selectedDate]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const popover = open
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999]"
          onMouseDown={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30" />

          <div
            className="absolute left-1/2 top-[120px] w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-3xl border border-white/12 bg-slate-950/80 p-3 text-slate-100 shadow-[0_24px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                if (!d) return;
                setSelectedDate(dayjs(d).format("YYYY-MM-DD"));
                setOpen(false);
              }}
              classNames={{
                months: "flex flex-col gap-3",
                caption: "flex items-center justify-between px-2",
                caption_label: "text-sm font-semibold text-slate-100",
                nav: "flex items-center gap-2",
                nav_button:
                  "h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition",
                head_cell: "text-[11px] font-semibold text-slate-400 py-2",
                cell: "p-1",
                day: "h-10 w-10 rounded-xl text-sm text-slate-200 hover:bg-white/10 transition",
                day_selected:
                  "bg-gradient-to-r from-sky-500 to-violet-500 text-white hover:opacity-95",
                day_today: "border border-sky-400/40",
                day_outside: "text-slate-600 hover:bg-white/5",
              }}
            />
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition",
          "border border-white/10 bg-white/5 text-slate-100",
          "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)] backdrop-blur",
          "hover:bg-white/10 active:bg-white/10",
        ].join(" ")}
      >
        <span className="text-slate-300">📅</span>
        <span className="tabular-nums">{dayjs(selectedDate).format("YYYY.MM.DD")}</span>
        <span className="text-xs font-medium text-slate-400">
          ({dayjs(selectedDate).format("dd")})
        </span>
      </button>

      {popover}
    </>
  );
}
