export default function StatsCards({ summary, user, itemsCount }) {
  const totalCalories = summary ? Math.round(summary.totalCalories) : 0;
  const totalProtein = summary ? Math.round(summary.totalProtein) : 0;

  const targetCalories = user ? Math.round(user.targetCalories ?? 0) : 0;
  const targetProtein = user ? Math.round(user.targetProtein ?? 0) : 0;

  const cardClass =
    "rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur transition";

  const labelClass = "text-sm text-slate-300";
  const valueClass =
    "mt-1 text-base font-semibold text-slate-100 sm:text-3xl whitespace-nowrap tabular-nums";
  const unitClass =
    "ml-1 text-xs font-medium text-slate-400 sm:ml-2 sm:text-base";

  return (
    <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {/* Calories */}
      <div className={cardClass}>
        <div className={labelClass}>칼로리</div>
        <div className={valueClass}>
          {totalCalories} / {targetCalories}
          <span className={unitClass}>kcal</span>
        </div>
      </div>

      {/* Protein */}
      <div className={cardClass}>
        <div className={labelClass}>단백질</div>
        <div className={valueClass}>
          {totalProtein} / {targetProtein}
          <span className={unitClass}>g</span>
        </div>
      </div>

      {/* Items */}
      <div className={cardClass}>
        <div className={labelClass}>기록</div>
        <div className="mt-1 text-xl font-semibold text-slate-100 sm:text-3xl whitespace-nowrap tabular-nums">
          {itemsCount}
          <span className={unitClass}>items</span>
        </div>
      </div>
    </section>
  );
}
