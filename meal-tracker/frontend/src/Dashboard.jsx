import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; //날짜 포맷
import EditItemModal from "./components/EditItemModal";
import GoalSettingModal from "./components/GoalSettingModal";
import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import Composer from "./components/Composer";
import FavoriteBottomSheet from "./components/FavoriteBottomSheet";
import Swal from "sweetalert2";
import DatePopover from "./components/DatePopover";
import { apiFetch, setAccessToken } from "./lib/apiFetch";


function Dashboard() {

const navigate = useNavigate();

// data
const [user, setUser] = useState(null);
const [summary, setSummary] = useState(null);
const [items, setItems] = useState([]);

// chat/ui
const [input, setInput] = useState("");
const [logs, setLogs] = useState([]);
const [loading, setLoading] = useState(false);
const [deletingItemId, setDeletingItemId] = useState(null);
const deletingItemRef  = useRef(null);

//editModal
const [editOpen, setEditOpen] = useState(false);
const [editItem, setEditItem] = useState(null);

const [goalOpen, setGoalOpen] = useState(false);
const [targetCalories, setTargetCalories] = useState(2000);
const [targetProtein, setTargetProtein] = useState(150);

//toast알림
const [toast, setToast] = useState(null);
const [inputError, setInputError] = useState("");

//datepicker
const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

const [favSheetOpen, setFavSheetOpen] = useState(false);

const [favorites, setFavorites] = useState([]);

const loadFavorites = async () => {
  const res = await apiFetch("/api/meal/favorite", {
    method: "GET",
    credentials: "include"
  });

  if (res.status === 401){
    navigate("/login");
    throw new Error("Unauthorized");    
  }

  if (!res.ok) {
    throw new Error("즐겨찾기 목록 조회 실패");
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : data?.items;

  if (!Array.isArray(list)) {
    throw new Error("즐겨찾기 목록 형식 오류");
  }

  setFavorites(list);

};

const recentItems = (items ?? [])
  .slice()
  .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
  .filter((item) => item.name)
  .filter((item, index, arr) =>
    arr.findIndex((other) => other.name === item.name) === index
  )
  .slice(0, 8)
  .map((item) => {
    const count = Number(item.count) || 1;

    return {
      id: `recent-${item.id}`,
      name: item.name,
      calories: Number(item.calories) / count,
      protein: Number(item.protein) / count,
    };
  });



//=======================useEffect=======================
useEffect(() => {
  (async () => {
    const user = await apiFetch("/api/auth/me", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type" : "application/json" }
    });

    if (user.status === 401) {
      navigate("/login");
      return;
    }
    
    const data = await user.json();
    setUser(data);
    
  })();
}, []);

useEffect(() => {
  if (!user) return;
  setTargetCalories(user.targetCalories ?? 2000);
  setTargetProtein(user.targetProtein ?? 150);

  loadFavorites().catch((error) => {
    console.error("즐겨찾기 목록 조회 실패:", error);
    showToast("error", "즐겨찾기 목록 조회에 실패했어요, 새로고침 후 다시 시도해주세요.");
  });
}, [user]);

useEffect(() => {
  loadDashBoard(selectedDate);
}, [selectedDate]);

//=======================useEffect=======================

const showToast = (type, message) => {
    setToast({type, message});
    setTimeout(() => setToast(null), 2500)
}

const loadDashBoard = async (date) => {
  if (!date) date = dayjs().format("YYYY-MM-DD");
    const res = await apiFetch(`/api/meal/today?date=${date}`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if(res.status === 401) {
      navigate("/login");
      return;
    }

    const data = await res.json();

    handleServerResponse(data);
};

  const sendText = async (text) => {
    const trimmed = (text ?? "").trim();
    if (!trimmed || loading) return false;

   setLoading(true);

    const userMsgId = crypto.randomUUID();
    const gptMsgId = crypto.randomUUID();
    const now = new Date().toISOString();

    setLogs(prev => [      
      { id: userMsgId, role: "USER", log: trimmed, createdAt: now, pending: false},
      ...prev
    ]);

    setLogs(prev => [
      {id: gptMsgId, role: "GPT", log: "", createdAt: now, pending: true},
      ...prev
    ])
  
    try {
    const res = await apiFetch("/api/meal/item", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         message: trimmed,
         date: selectedDate
         }),
    });

    if (res.status === 429) {
      const message = "요청이 너무 많아요, 잠시 후 다시 시도해주세요.";

      setInputError(message);

      setLogs((prev) => 
        prev.map((log) =>
          log.id === gptMsgId ? {...log, log:message, pending:false} : log
        )
      );
      return false;
    }

    if (res.status === 504) {
      const message = "AI 응답이 지연되고 있어요, 잠시 후 다시 시도해주세요.";

      setInputError(message);

      setLogs((prev) => 
        prev.map((log) => 
          log.id === gptMsgId ? {...log, log:message, pending:false} : log
        )
      );
      return false;
    }

    if (!res.ok) throw new Error("서버 응답 오류");   

    const data = await res.json();

    handleServerResponse(data);

    const gptText = data.assistantText ?? "기록 완료";
    const gptAt = data.createdAt ?? new Date().toISOString();

    setLogs((prev) =>
      prev.map((log) =>
        log.id === gptMsgId
          ? { ...log, log: gptText, createdAt: gptAt, pending: false }
          : log
      )
    );
    return true;
    } catch (e) {
      console.error(e);
      setLogs((prev) =>
      prev.map((log) =>
        log.id === gptMsgId
          ? { ...log, log: "오류가 발생했어요. 다시 시도해주세요.", pending: false }
          : log
      )
    );
      showToast("error", "메시지 전송에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  

  };
  
 const send = async(textArg) => {
  const text = (textArg ?? input).trim();

  if (!text || loading) return false;

  if (text.length > 200) {
    setInputError("식단 입력은 200자 이내로 작성해주세요.");
    return false;
  }

  setInputError("");
  return await sendText(text);  
};

  //아이템 삭제
  const onDelete = async (item) => {
    if (deletingItemRef.current) return; // 이미 삭제 중이면 무시

    deletingItemRef.current = true;

    try{
      const result = await Swal.fire({
        title: '정말로 삭제하시겠어요?',
        text: "이 작업은 되돌릴 수 없어요.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgb(250, 102, 102)',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    });
  

    if(!result.isConfirmed) return;
    setDeletingItemId(item.id);

    let res;
    
    try{
      res = await apiFetch(`/api/meal/item/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("삭제 요청 실패:", error);
      showToast("error", "삭제 실패했습니다.");
      return;
    }

    if (res.status === 401) {
      navigate("/login");
      return;
    }  

    if (!res.ok) {
      showToast("error", "삭제에 실패했습니다.");
      return;
    }

    // 삭제 성공 시
    try {
      await loadDashBoard(selectedDate);
      showToast("success", "삭제되었어요.");
    } catch (error) {
      console.error("삭제 후 대시보드 로드 실패:", error);
      showToast("error", "삭제 후 데이터 로드에 실패했습니다.");
    }
  } finally {
    setDeletingItemId(null);
    deletingItemRef.current = false;
    }
  };

  const saveGoal = async() => {
    const cal = Number(targetCalories);
    const protein = Number(targetProtein);

    if(!Number.isFinite(cal) || cal <= 0) {
      showToast("error", "칼로리를 입력해주세요.");
      return;
    }
    if(!Number.isFinite(protein) || protein <= 0) {
      showToast("error", "단백질을 입력해주세요.");
      return;
    }

      const res = await apiFetch("/api/auth/target", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetCalories: cal, targetProtein: protein }),
  });

  if (!res.ok) {
    showToast("error", "저장에 실패했습니다.");
    return;
  }

    const updated = await res.json().catch(() => null);

  if(updated) {
     setUser(updated);     
  }
  else {
    setUser((prev) => (prev ? { ...prev, targetCalories: cal, targetProtein: protein } : prev));
  }

  showToast("success", "목표가 설정되었어요");
  setGoalOpen(false);
  }


  function handleServerResponse(res) {    
    setSummary(res.todaySummary);
    setItems(res.items ?? []);
    setLogs(res.chatLog ?? []);
  }

  const submitEdit = async() => {
    if (!editItem) return;

    const id = editItem.id;
    const name = (editItem.name ?? "").trim();
    const count = Number(editItem.count);
    const calories = Number(editItem.calories);
    const protein = Number(editItem.protein);

    if (!name) {
      showToast("error", "음식명을 입력해주세요.");
      return;
    }
    if (!Number.isFinite(count) || count <= 0) {
      showToast("error", "수량을 올바르게 입력해주세요.");
      return;
    }
    if (!Number.isFinite(calories) || calories < 0) {
      showToast("error", "칼로리를 올바르게 입력해주세요.");
      return;
    }
    if (!Number.isFinite(protein) || protein < 0) {
      showToast("error", "단백질을 올바르게 입력해주세요.");
      return;
    }

    const res = await apiFetch(`/api/meal/item/${editItem.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name, count, calories, protein}),
    });

    if (!res.ok) {
      showToast("error", "변경에 실패했습니다.");
      return;
    }

    const data = await res.json().catch(() => null);

    if(data) handleServerResponse(data);
    else loadDashBoard(selectedDate);

    showToast("success", "변경사항이 변경되었어요.");
    setEditOpen(false);
    setEditItem(null);
  }

  return (
  <div className="min-h-dvh bg-slate-950 text-slate-100">

    {/* toast */}
              {toast && (
                <div
                  className="fixed bottom-6 left-1/2 z-50 w-max max-w-[calc(100%-2rem)] -translate-x-1/2"
                  role="status"
                >
                  <div
                    className={[
                      "rounded-2xl border px-4 py-3 text-sm font-semibold backdrop-blur",
                      toast.type === "success"
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                        : "border-rose-400/20 bg-rose-500/10 text-rose-100",
                    ].join(" ")}
                  >
                    {toast.message}
                  </div>
                </div>
      )}

    {/* background */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-400/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
    </div>

    <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <EditItemModal
        open={editOpen}
        item={editItem}
        setItem={setEditItem}
        onClose={() => {
          setEditOpen(false);
          setEditItem(null);
        }}
        onSubmit={submitEdit}
      />

      <GoalSettingModal
        open={goalOpen}
        targetCalories={targetCalories}
        setTargetCalories={setTargetCalories}
        targetProtein={targetProtein}
        setTargetProtein={setTargetProtein}
        onClose={() => setGoalOpen(false)}
        onSave={saveGoal}
      />

        <FavoriteBottomSheet
  open={favSheetOpen}
  onClose={() => setFavSheetOpen(false)}
  favorites={favorites}
  setFavorites={setFavorites}
  reloadFavorites={loadFavorites}
/>    

      {/* header */}
      <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-6">
        <DashboardHeader
          user={user}
          onOpenGoal={() => setGoalOpen(true)}
          onLogout={async () => {
            await apiFetch("/api/auth/logout", {
              method: "POST",
              credentials: "include",
            }).catch(() => {});
            setAccessToken(null);
            navigate("/login");
          }}
        />
      </div>

      {/* stats */}
      <div className="mt-5">
        <StatsCards summary={summary} user={user} itemsCount={items?.length ?? 0} />
      </div>

      {/* items + composer */}
      <section className="mt-6 rounded-3xl border border-white/15 bg-white/10 shadow-[0_20px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-100">오늘 먹은 것</h2>

          <div className="text-slate-200">
            <DatePopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>
        </div>

        <div className="border-t border-white/10" />

        {items.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-300 sm:px-6">
            아직 기록이 없어요
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="px-5 py-4 sm:hidden">
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-100">
                          {it.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {it.createdAt ? dayjs(it.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => {
                            setEditItem({
                              id: it.id,
                              name: it.name,
                              count: it.count,
                              calories: it.calories,
                              protein: it.protein,
                            });
                            setEditOpen(true);
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-white/10"
                          title="수정"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => onDelete(it)}
                          disabled={deletingItemId !== null}
                          className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                          title="삭제"
                        >
                          {deletingItemId === it.id ? "삭제 중..." : "🗑️"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-slate-400">수량</div>
                        <div className="font-semibold text-slate-100">x{it.count}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-slate-400">칼로리</div>
                        <div className="font-semibold text-slate-100">
                          {Math.round(it.calories)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-slate-400">단백질</div>
                        <div className="font-semibold text-slate-100">
                          {Math.round(it.protein)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-white/10 text-xs text-slate-300">
                  <tr>
                    <th className="px-6 py-3">음식</th>
                    <th className="px-6 py-3">수량</th>
                    <th className="px-6 py-3">칼로리</th>
                    <th className="px-6 py-3">단백질</th>
                    <th className="px-6 py-3">시간</th>
                    <th className="px-6 py-3 text-right"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-white/5">
                      <td className="px-6 py-3 font-semibold text-slate-100">{it.name}</td>
                      <td className="px-6 py-3 text-slate-200">x{it.count}</td>
                      <td className="px-6 py-3 text-slate-200">{Math.round(it.calories)}</td>
                      <td className="px-6 py-3 text-slate-200">{Math.round(it.protein)}</td>
                      <td className="px-6 py-3 text-slate-400">
                        {it.createdAt ? dayjs(it.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditItem({
                                id: it.id,
                                name: it.name,
                                count: it.count,
                                calories: it.calories,
                                protein: it.protein,
                              });
                              setEditOpen(true);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-white/10"
                            title="수정"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => onDelete(it)}
                            disabled={deletingItemId !== null}
                            className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                            title="삭제"
                          >
                            {deletingItemId === it.id ? "삭제 중..." : "🗑️"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="border-t border-white/10" />

        <div className="p-4 sm:p-5">          

          <Composer
              input={input}
              setInput={setInput}
              onSend={send}
              loading={loading}
              recentItems={recentItems}
              favorites={favorites}
              onOpenFavoritesSheet={() => setFavSheetOpen(true)}
          />

        {inputError && (
          <p className="mt-2 text-sm text-rose-400" role="alert">
            {inputError}
          </p>
        )}

          
        </div>
      </section>

      {/* chat logs */}
      <section className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-6">
        <h3 className="text-base font-semibold text-slate-100">대화 로그</h3>

        <div className="mt-3 space-y-3">
          {logs.map((log, idx) => {
            const isUser = log.role === "USER";
            const time = log.createdAt ? dayjs(log.createdAt).format("HH:mm:ss") : null;

            return (
              <div
                key={idx}
                className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}
              >
                <div
                  className={[
                    "max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed",
                    isUser
                      ? "border-white/10 bg-slate-950/60 text-slate-100"
                      : "border-white/10 bg-white/5 text-slate-100",
                  ].join(" ")}
                >
                  <div className="mb-1 text-xs text-slate-300">
                    {isUser ? "나" : "GPT"}
                  </div>

                  <div className="whitespace-pre-line text-slate-100">
                    {log.pending ? <span className="animate-pulse">{log.log}</span> : log.log}
                  </div>

                  {time && (
                    <div
                      className={[
                        "mt-1 text-[11px] text-slate-400",
                        isUser ? "text-right" : "text-left",
                      ].join(" ")}
                    >
                      {time}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 text-center text-[11px] text-slate-500">
        © Meal Tracker
      </div>
    </div>
  </div>



);


}


export default Dashboard;
