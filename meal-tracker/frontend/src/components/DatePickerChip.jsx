import dayjs from "dayjs"

export default function DatePickerChip({ value, onChange }) {
    const isToday = value === dayjs().format("YYYY-MM-DD");
    
    const prevDay = () => onChange(dayjs(value).subtract(1, "day").format("YYYY-MM-DD"));
    const nextDay = () => onChange(dayjs(value).add(1, "day").format("YYYY-MM-DD"));
    const goToday = () => onChange(dayjs().format("YYYY-MM-DD"));

    return (
       <div className="flex items-center gap-2">
        <button 
            type="button" 
            onClick={prevDay} 
            className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 active:bg-gray-200"
            title="이전날"
        >
            ←
        </button>

        <label
        className={[
          "group inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium shadow-sm transition",
          isToday
            ? "border-emerald-200 bg-emerald-200 text-emerald-800"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
        ].join(" ")}
        title="날짜 선택"
        >

        <span className={["text-gray-400", "group-hover:text-gray-500"].join(" ")}>
          📅
        </span>
        <span className="tabular-nums">{value}</span>

        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="hidden"
        />
        </label>

     <button
        type="button"
        onClick={nextDay}
        className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 active:bg-gray-200"
        title="다음날"
      >
        →
      </button>

        <button
        type="button"
        onClick={goToday}
        className={[
          "rounded-lg px-2 py-1 text-sm transition",
          isToday ? "text-emerald-700 border-emerald-200 bg-emerald-200" : "text-gray-600 hover:bg-gray-200",
        ].join(" ")}
      >
        오늘
      </button>

        </div>
    );
}