import { useState, useEffect, useRef, useCallback } from "react";

// ─── Данные ──────────────────────────────────────────────────────────────────

interface Route {
  id: string;
  from: string;
  to: string;
  emoji: string;
  label: string;
  distance: "short" | "medium" | "long";
  basePax: number; // пассажиров в день
  cost: number;    // стоимость открытия маршрута (0 = бесплатно)
}

interface Bot {
  id: string;
  name: string;
  emoji: string;
  color: string;
  price: number;
  mood: "happy" | "angry" | "smug" | "sad";
  strategy: "cheap" | "copycat" | "stubborn";
}

interface RouteState {
  routeId: string;
  playerPrice: number;
  unlocked: boolean;
  transport: "bus" | "plane";
}

// Маршруты (короткий — автобус бесплатно, остальные — самолёты за деньги)
const ROUTES: Route[] = [
  { id: "city-beach",    from: "🏙️ Город",      to: "🏖️ Пляж",       emoji: "🌊", label: "Город → Пляж",       distance: "short",  basePax: 200, cost: 0 },
  { id: "city-mountain", from: "🏙️ Город",      to: "⛰️ Горы",        emoji: "❄️", label: "Город → Горы",       distance: "medium", basePax: 150, cost: 500 },
  { id: "beach-island",  from: "🏖️ Пляж",       to: "🏝️ Остров",     emoji: "🐚", label: "Пляж → Остров",      distance: "medium", basePax: 120, cost: 700 },
  { id: "city-castle",   from: "🏙️ Город",      to: "🏰 Замок",       emoji: "👑", label: "Город → Замок",      distance: "long",   basePax: 100, cost: 1200 },
  { id: "mountain-snow", from: "⛰️ Горы",        to: "🌨️ Снежный пик", emoji: "🎿", label: "Горы → Снежный пик", distance: "long",   basePax: 80,  cost: 1500 },
];

const INIT_BOTS: Bot[] = [
  { id: "b1", name: "Гусь Борис",  emoji: "🦢", color: "#f97316", price: 60,  mood: "smug",   strategy: "stubborn" },
  { id: "b2", name: "Кот Степан",  emoji: "🐱", color: "#8b5cf6", price: 40,  mood: "happy",  strategy: "cheap" },
  { id: "b3", name: "Медведь Олег",emoji: "🐻", color: "#06b6d4", price: 55,  mood: "happy",  strategy: "copycat" },
];

const PLAYER_START_MONEY = 120; // хватит ровно на 1 маршрут в первый день

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcShares(playerPrice: number, bots: Bot[]): { player: number; bots: Record<string, number> } {
  const all = [{ id: "player", price: playerPrice }, ...bots.map((b) => ({ id: b.id, price: b.price }))];
  const min = Math.min(...all.map((a) => a.price));
  const weights = all.map((a) => ({ id: a.id, w: Math.exp(-((a.price - min) / Math.max(min, 1)) * 3) }));
  const total = weights.reduce((s, w) => s + w.w, 0);
  const result: Record<string, number> = {};
  weights.forEach((w) => { result[w.id] = w.w / total; });
  return { player: result["player"] ?? 0, bots: Object.fromEntries(bots.map((b) => [b.id, result[b.id] ?? 0])) };
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ru-RU");
}

function moodFor(share: number, prevShare: number): Bot["mood"] {
  if (share > 0.4) return "smug";
  if (share > 0.25) return "happy";
  if (share < prevShare - 0.05) return "angry";
  return "sad";
}

// ─── Компонент ───────────────────────────────────────────────────────────────

export default function Index() {
  const [money, setMoney] = useState(PLAYER_START_MONEY);
  const [day, setDay] = useState(1);
  const [totalEarned, setTotalEarned] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState("city-beach");
  const [routeStates, setRouteStates] = useState<RouteState[]>([
    { routeId: "city-beach",    playerPrice: 30, unlocked: true,  transport: "bus" },
    { routeId: "city-mountain", playerPrice: 80, unlocked: false, transport: "plane" },
    { routeId: "beach-island",  playerPrice: 90, unlocked: false, transport: "plane" },
    { routeId: "city-castle",   playerPrice: 110, unlocked: false, transport: "plane" },
    { routeId: "mountain-snow", playerPrice: 130, unlocked: false, transport: "plane" },
  ]);
  const [bots, setBots] = useState<Bot[]>(INIT_BOTS);
  const [prevShares, setPrevShares] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<string[]>(["🎉 Поехали! У тебя есть автобус на маршруте Город → Пляж!"]);
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const coinId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);

  const selRouteData = ROUTES.find((r) => r.id === selectedRoute)!;
  const selState = routeStates.find((s) => s.routeId === selectedRoute)!;
  const unlockedRoutes = routeStates.filter((s) => s.unlocked);

  const addMsg = useCallback((msg: string) => {
    setMessages((prev) => [...prev.slice(-6), msg]);
  }, []);

  // Тик
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, [paused]);

  // Симуляция
  useEffect(() => {
    if (tick === 0) return;
    if (tick % 4 === 0) setDay((d) => d + 1);

    // Считаем выручку только по разблокированным маршрутам
    let earned = 0;
    const newSharesMap: Record<string, number> = {};

    const newBots = bots.map((bot) => {
      let newPrice = bot.price;
      // Найдём первый разблокированный маршрут и его цену (упрощённо — берём первый)
      const unlockedState = routeStates.find((s) => s.unlocked);
      const playerP = unlockedState?.playerPrice ?? 40;

      if (bot.strategy === "cheap") {
        newPrice = Math.max(10, playerP - 5 - Math.floor(Math.random() * 8));
        if (newPrice !== bot.price && Math.random() < 0.4) addMsg(`${bot.emoji} ${bot.name} снизил цену до ${newPrice}₽!`);
      } else if (bot.strategy === "copycat") {
        newPrice = playerP + Math.floor((Math.random() - 0.5) * 10);
        newPrice = Math.max(10, newPrice);
      } else {
        // stubborn — почти не меняет
        newPrice = bot.price + Math.floor((Math.random() - 0.5) * 6);
        newPrice = Math.max(15, newPrice);
      }

      const { player: ps, bots: bs } = calcShares(playerP, bots);
      const myShare = bs[bot.id] ?? 0;
      const prevShare = prevShares[bot.id] ?? 0.25;
      newSharesMap[bot.id] = myShare;

      return { ...bot, price: newPrice, mood: moodFor(myShare, prevShare) };
    });

    routeStates.filter((s) => s.unlocked).forEach((state) => {
      const route = ROUTES.find((r) => r.id === state.routeId)!;
      const { player: share } = calcShares(state.playerPrice, bots);
      const pax = Math.round(share * route.basePax);
      const rev = pax * state.playerPrice / 30; // за один тик
      earned += rev;
    });

    const roundEarned = Math.round(earned);
    if (roundEarned > 0) {
      setMoney((m) => m + roundEarned);
      setTotalEarned((t) => t + roundEarned);
      // Монетки
      const newCoins = Array.from({ length: Math.min(roundEarned, 3) }, (_, i) => ({
        id: coinId.current++,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
      }));
      setCoins((c) => [...c, ...newCoins]);
      setTimeout(() => setCoins((c) => c.filter((coin) => !newCoins.find((n) => n.id === coin.id))), 1200);
    }

    setPrevShares(newSharesMap);
    setBots(newBots);
  }, [tick]);

  // Scroll messages
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  // Изменить цену
  const changePrice = (delta: number) => {
    setRouteStates((prev) =>
      prev.map((s) =>
        s.routeId === selectedRoute
          ? { ...s, playerPrice: Math.max(5, s.playerPrice + delta) }
          : s
      )
    );
  };

  // Разблокировать маршрут
  const unlockRoute = (routeId: string) => {
    const route = ROUTES.find((r) => r.id === routeId)!;
    if (money < route.cost) return;
    setMoney((m) => m - route.cost);
    setRouteStates((prev) =>
      prev.map((s) => s.routeId === routeId ? { ...s, unlocked: true } : s)
    );
    addMsg(`✈️ Маршрут "${route.label}" открыт! Лети!`);
  };

  const selShares = calcShares(selState.playerPrice, bots);
  const myShare = Math.round((selShares.player ?? 0) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 font-sans overflow-hidden relative">

      {/* Облака */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: 5,  y: 8,  s: 1.2, op: 0.7 },
          { x: 25, y: 4,  s: 0.8, op: 0.5 },
          { x: 55, y: 6,  s: 1.5, op: 0.6 },
          { x: 75, y: 3,  s: 1.0, op: 0.8 },
          { x: 88, y: 10, s: 0.7, op: 0.5 },
        ].map((c, i) => (
          <div key={i} className="absolute text-white"
            style={{ left: `${c.x}%`, top: `${c.y}%`, fontSize: `${c.s * 48}px`, opacity: c.op }}>
            ☁️
          </div>
        ))}
      </div>

      {/* Монетки-анимация */}
      {coins.map((coin) => (
        <div key={coin.id} className="absolute pointer-events-none text-2xl z-50"
          style={{ left: `${coin.x}%`, top: `${coin.y}%`, animation: "coinPop 1.2s ease-out forwards" }}>
          🪙
        </div>
      ))}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow-md" style={{ fontFamily: "Golos Text, sans-serif" }}>
            🚌 ПоехалиЭйр!
          </h1>
          <p className="text-sky-700 text-sm font-semibold">День {day} · Зарабатывай больше всех!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/80 rounded-2xl px-4 py-2 text-center shadow-md">
            <div className="text-xs text-gray-500">Денежки</div>
            <div className="text-xl font-black text-green-600">💰 {fmt(money)}₽</div>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="bg-white/80 rounded-2xl px-3 py-2 text-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            {paused ? "▶️" : "⏸️"}
          </button>
        </div>
      </div>

      {/* Маршруты — карточки */}
      <div className="relative z-10 px-4 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROUTES.map((route) => {
            const state = routeStates.find((s) => s.routeId === route.id)!;
            const isSel = selectedRoute === route.id;
            const isLocked = !state.unlocked;
            return (
              <button
                key={route.id}
                onClick={() => { if (!isLocked) setSelectedRoute(route.id); }}
                className={`flex-shrink-0 rounded-2xl px-3 py-2 text-center transition-all shadow-md ${
                  isLocked
                    ? "bg-white/40 opacity-60 cursor-not-allowed"
                    : isSel
                    ? "bg-white scale-105 shadow-lg ring-2 ring-sky-400"
                    : "bg-white/70 hover:scale-105 active:scale-95"
                }`}
              >
                <div className="text-2xl">{route.emoji}</div>
                <div className="text-[10px] font-bold text-gray-700 mt-0.5 whitespace-nowrap max-w-[70px] leading-tight">
                  {isLocked ? `🔒 ${fmt(route.cost)}₽` : route.label}
                </div>
                {isLocked && (
                  <button
                    onClick={(e) => { e.stopPropagation(); unlockRoute(route.id); }}
                    disabled={money < route.cost}
                    className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                      money >= route.cost
                        ? "bg-green-400 text-white hover:bg-green-500 active:scale-95"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Купить
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Основная панель */}
      <div className="relative z-10 px-4 mt-3 grid grid-cols-[1fr_180px] gap-3">

        {/* Левая — текущий маршрут */}
        <div className="bg-white/85 rounded-3xl shadow-xl p-4">

          {/* Маршрут */}
          <div className="text-center mb-3">
            <div className="text-3xl">{selRouteData.emoji}</div>
            <div className="font-black text-gray-800 text-lg leading-tight mt-1">
              {selRouteData.from} → {selRouteData.to}
            </div>
            <div className="text-3xl mt-1">{selState.transport === "bus" ? "🚌" : "✈️"}</div>
          </div>

          {/* Цена игрока */}
          <div className="bg-sky-50 rounded-2xl p-3 mb-3">
            <div className="text-center text-xs text-gray-500 font-semibold mb-2">ТВОЯ ЦЕНА БИЛЕТА</div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => changePrice(-5)}
                className="w-10 h-10 bg-red-400 text-white rounded-full text-xl font-bold hover:bg-red-500 active:scale-90 transition-all shadow-md">
                −
              </button>
              <div className="text-3xl font-black text-sky-600 min-w-[100px] text-center">
                {selState.playerPrice}₽
              </div>
              <button onClick={() => changePrice(5)}
                className="w-10 h-10 bg-green-400 text-white rounded-full text-xl font-bold hover:bg-green-500 active:scale-90 transition-all shadow-md">
                +
              </button>
            </div>
            <div className="text-center text-sm font-bold mt-2">
              <span className={myShare >= 33 ? "text-green-600" : myShare >= 20 ? "text-yellow-600" : "text-red-500"}>
                {myShare >= 33 ? "😄" : myShare >= 20 ? "😐" : "😬"} Твоя доля: {myShare}%
              </span>
            </div>
          </div>

          {/* Конкуренты */}
          <div className="text-xs text-gray-500 font-bold mb-2 text-center">КОНКУРЕНТЫ НА МАРШРУТЕ</div>
          <div className="flex gap-2 justify-center">
            {bots.map((bot) => {
              const share = Math.round((selShares.bots[bot.id] ?? 0) * 100);
              return (
                <div key={bot.id} className="flex-1 rounded-2xl p-2 text-center"
                  style={{ background: bot.color + "22", border: `2px solid ${bot.color}55` }}>
                  <div className="text-2xl">
                    {bot.mood === "happy" ? bot.emoji : bot.mood === "angry" ? "😡" : bot.mood === "smug" ? "😏" : "😢"}
                  </div>
                  <div className="text-[10px] font-bold text-gray-700 leading-tight">{bot.name}</div>
                  <div className="text-sm font-black mt-0.5" style={{ color: bot.color }}>{bot.price}₽</div>
                  <div className="text-[10px] text-gray-500">{share}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая — статы и лог */}
        <div className="flex flex-col gap-3">

          {/* Итого */}
          <div className="bg-white/85 rounded-3xl shadow-xl p-3 text-center">
            <div className="text-xs text-gray-500 font-semibold">ВСЕГО ЗАРАБОТАНО</div>
            <div className="text-xl font-black text-green-600 mt-1">+{fmt(totalEarned)}₽</div>
            <div className="text-xs text-gray-400 mt-1">
              {unlockedRoutes.length} / {ROUTES.length} маршрутов
            </div>
            <div className="mt-2 text-lg">
              {"✈️".repeat(unlockedRoutes.length)}{"🔒".repeat(ROUTES.length - unlockedRoutes.length)}
            </div>
          </div>

          {/* Сообщения */}
          <div className="bg-white/85 rounded-3xl shadow-xl p-3 flex-1 overflow-hidden">
            <div className="text-xs text-gray-500 font-bold mb-1 text-center">📢 НОВОСТИ</div>
            <div ref={logRef} className="overflow-y-auto space-y-1" style={{ maxHeight: "180px", scrollbarWidth: "none" }}>
              {messages.map((msg, i) => (
                <div key={i} className="text-[11px] text-gray-700 leading-snug bg-sky-50 rounded-xl px-2 py-1">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Подсказка снизу */}
      <div className="relative z-10 text-center mt-4 pb-4">
        <p className="text-sky-700 text-sm font-semibold">
          💡 Ставь цену дешевле конкурентов — забирай пассажиров и копи на новые маршруты!
        </p>
      </div>

      <style>{`
        @keyframes coinPop {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          60%  { transform: translateY(-60px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-90px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
