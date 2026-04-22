import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface City {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
}

interface Route {
  id: string;
  from: string;
  to: string;
  baseDemand: number;
}

interface Bot {
  id: string;
  name: string;
  color: string;
  strategy: "aggressive" | "premium" | "follower";
  prices: Record<string, number>;
  balance: number;
  revenue: number;
}

interface LogEntry {
  time: string;
  msg: string;
  type: "info" | "warn" | "good";
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CITIES: City[] = [
  { id: "mow", name: "Москва",          code: "SVO", x: 55, y: 22 },
  { id: "led", name: "Питер",           code: "LED", x: 43, y: 12 },
  { id: "ekb", name: "Екатеринбург",    code: "SVX", x: 72, y: 28 },
  { id: "nsk", name: "Новосибирск",     code: "OVB", x: 80, y: 38 },
  { id: "kzn", name: "Казань",          code: "KZN", x: 63, y: 31 },
  { id: "aer", name: "Сочи",            code: "AER", x: 50, y: 60 },
  { id: "krr", name: "Краснодар",       code: "KRR", x: 44, y: 54 },
  { id: "ufa", name: "Уфа",             code: "UFA", x: 67, y: 37 },
];

const ROUTES: Route[] = [
  { id: "mow-led", from: "mow", to: "led", baseDemand: 900 },
  { id: "mow-ekb", from: "mow", to: "ekb", baseDemand: 600 },
  { id: "mow-aer", from: "mow", to: "aer", baseDemand: 700 },
  { id: "mow-nsk", from: "mow", to: "nsk", baseDemand: 400 },
  { id: "mow-kzn", from: "mow", to: "kzn", baseDemand: 350 },
  { id: "led-aer", from: "led", to: "aer", baseDemand: 500 },
  { id: "ekb-nsk", from: "ekb", to: "nsk", baseDemand: 300 },
];

const INIT_BOTS: Bot[] = [
  {
    id: "bot1", name: "АэроВест", color: "#ff3b3b", strategy: "aggressive",
    prices: { "mow-led": 3200, "mow-ekb": 5800, "mow-aer": 4900, "mow-nsk": 9200, "mow-kzn": 2900, "led-aer": 6100, "ekb-nsk": 4200 },
    balance: 8_000_000, revenue: 0,
  },
  {
    id: "bot2", name: "СибАйр", color: "#00b4ff", strategy: "premium",
    prices: { "mow-led": 4800, "mow-ekb": 7200, "mow-aer": 6500, "mow-nsk": 11000, "mow-kzn": 4100, "led-aer": 7800, "ekb-nsk": 5800 },
    balance: 12_000_000, revenue: 0,
  },
  {
    id: "bot3", name: "ЮгТрэвел", color: "#a855f7", strategy: "follower",
    prices: { "mow-led": 3900, "mow-ekb": 6400, "mow-aer": 5500, "mow-nsk": 9800, "mow-kzn": 3400, "led-aer": 6700, "ekb-nsk": 4800 },
    balance: 9_500_000, revenue: 0,
  },
];

const PLAYER_INIT: Record<string, number> = {
  "mow-led": 3900, "mow-ekb": 6500, "mow-aer": 5800,
  "mow-nsk": 10000, "mow-kzn": 3500, "led-aer": 6900, "ekb-nsk": 5000,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcShares(routeId: string, playerPrice: number, bots: Bot[]) {
  const entries = [
    { id: "player", price: playerPrice },
    ...bots.map((b) => ({ id: b.id, price: b.prices[routeId] ?? 99999 })),
  ];
  const cheapest = Math.min(...entries.map((e) => e.price));
  const weights = entries.map((e) => ({ id: e.id, w: Math.exp(-((e.price - cheapest) / cheapest) * 5) }));
  const total = weights.reduce((s, w) => s + w.w, 0);
  const result: Record<string, number> = {};
  weights.forEach((w) => { result[w.id] = w.w / total; });
  return result;
}

function fmt(n: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

function nowTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [playerPrices, setPlayerPrices] = useState<Record<string, number>>(PLAYER_INIT);
  const [bots, setBots] = useState<Bot[]>(INIT_BOTS.map((b) => ({ ...b })));
  const [playerBalance, setPlayerBalance] = useState(10_000_000);
  const [playerRevenue, setPlayerRevenue] = useState(0);
  const [tick, setTick] = useState(0);
  const [day, setDay] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState("mow-led");
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: "00:00:00", msg: "Симуляция запущена. Добро пожаловать в AirMarket!", type: "good" },
  ]);
  const [flash, setFlash] = useState<Record<string, "up" | "down" | null>>({});
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev.slice(-49), { time: nowTime(), msg, type }]);
  }, []);

  // Tick timer
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, [paused]);

  // Simulation step
  useEffect(() => {
    if (tick === 0) return;
    setDay(Math.floor(tick / 6) + 1);

    setBots((prev) => {
      const updated = prev.map((bot) => {
        const newPrices = { ...bot.prices };
        let logged = false;

        ROUTES.forEach((route) => {
          const pP = playerPrices[route.id] ?? 5000;
          const bP = newPrices[route.id] ?? 5000;
          let target = bP;

          if (bot.strategy === "aggressive") {
            if (bP >= pP * 0.93) target = pP * (0.88 + Math.random() * 0.06);
            target = Math.max(target, 1500);
          } else if (bot.strategy === "premium") {
            const shares = calcShares(route.id, pP, prev);
            if ((shares[bot.id] ?? 0) < 0.08 && bP > 3000) target = bP * 0.94;
          } else {
            target = pP * (0.95 + Math.random() * 0.13);
            target = Math.max(target, 2000);
          }

          const next = Math.round(target * (1 + (Math.random() - 0.5) * 0.03));
          if (Math.abs(next - bP) > 60) {
            newPrices[route.id] = next;
            if (!logged && Math.random() < 0.35) {
              const dir = next < bP ? "снизил" : "поднял";
              addLog(`${bot.name} ${dir} цену ${route.id.toUpperCase()} → ${fmt(next)} ₽`, next < bP ? "warn" : "info");
              logged = true;
            }
          }
        });

        // Revenue for this bot
        let rev = 0;
        ROUTES.forEach((route) => {
          const shares = calcShares(route.id, playerPrices[route.id], prev);
          rev += (shares[bot.id] ?? 0) * route.baseDemand * (newPrices[route.id] ?? 0) / 180;
        });

        return { ...bot, prices: newPrices, revenue: bot.revenue + Math.round(rev), balance: bot.balance + Math.round(rev) };
      });
      return updated;
    });

    // Player revenue
    let rev = 0;
    ROUTES.forEach((route) => {
      const shares = calcShares(route.id, playerPrices[route.id], bots);
      rev += (shares["player"] ?? 0) * route.baseDemand * playerPrices[route.id] / 180;
    });
    const r = Math.round(rev);
    setPlayerRevenue((x) => x + r);
    setPlayerBalance((x) => x + r);
  }, [tick]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // Price controls
  const changePrice = (routeId: string, delta: number) => {
    setPlayerPrices((prev) => {
      const cur = prev[routeId] ?? 5000;
      const next = Math.max(1000, cur + delta);
      const dir: "up" | "down" = next > cur ? "up" : "down";
      setFlash((f) => ({ ...f, [routeId]: dir }));
      setTimeout(() => setFlash((f) => ({ ...f, [routeId]: null })), 800);
      addLog(
        `Вы ${delta > 0 ? "повысили" : "снизили"} цену ${routeId.toUpperCase()} → ${fmt(next)} ₽`,
        delta > 0 ? "info" : "good",
      );
      return { ...prev, [routeId]: next };
    });
  };

  // Derived
  const cityMap = Object.fromEntries(CITIES.map((c) => [c.id, c]));
  const selRoute = ROUTES.find((r) => r.id === selectedRoute)!;
  const selShares = calcShares(selectedRoute, playerPrices[selectedRoute], bots);
  const fromCity = cityMap[selRoute.from];
  const toCity = cityMap[selRoute.to];

  const competitors = [
    { id: "player", name: "Ваша авиакомпания", color: "#00ffc8", price: playerPrices[selectedRoute], share: selShares["player"] ?? 0 },
    ...bots.map((b) => ({ id: b.id, name: b.name, color: b.color, price: b.prices[selectedRoute] ?? 0, share: selShares[b.id] ?? 0 })),
  ].sort((a, b) => a.price - b.price);

  const allBalances = [playerBalance, ...bots.map((b) => b.balance)];
  const maxBalance = Math.max(...allBalances);

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden">

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-5 py-2.5 border-b border-[rgba(0,255,200,0.12)] bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-[var(--neon-green)] flex items-center justify-center">
            <Icon name="Plane" size={14} className="neon-text" />
          </div>
          <span className="font-mono-display text-base neon-text tracking-widest">AIRMARKET</span>
          <span className="font-mono-display text-[10px] text-muted-foreground ml-2 hidden sm:inline">СИМУЛЯТОР АВИАРЫНКА</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="font-mono-display text-[9px] text-muted-foreground">ДЕНЬ</div>
            <div className="font-mono-display text-sm neon-text">{String(day).padStart(3, "0")}</div>
          </div>
          <div className="text-right">
            <div className="font-mono-display text-[9px] text-muted-foreground">БАЛАНС</div>
            <div className="font-mono-display text-sm text-[var(--neon-amber)]">{fmt(playerBalance)} ₽</div>
          </div>
          <div className="text-right">
            <div className="font-mono-display text-[9px] text-muted-foreground">ВЫРУЧКА</div>
            <div className="font-mono-display text-sm neon-text">+{fmt(playerRevenue)} ₽</div>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className={`px-3 py-1 border font-mono-display text-xs tracking-widest transition-all ${
              paused
                ? "border-[var(--neon-amber)] text-[var(--neon-amber)] hover:bg-[rgba(255,179,0,0.1)]"
                : "border-[var(--neon-green)] neon-text hover:bg-[rgba(0,255,200,0.08)]"
            }`}
          >
            {paused ? "▶ ПУСК" : "⏸ ПАУЗА"}
          </button>
        </div>
      </header>

      {/* Ticker */}
      <div className="relative z-10 overflow-hidden border-b border-[rgba(0,255,200,0.07)] bg-[rgba(0,0,0,0.25)] py-1">
        <div className="ticker-track font-mono-display text-[10px] text-muted-foreground">
          {[...ROUTES, ...ROUTES].map((r, i) => (
            <span key={i} className="px-6">
              <span className="text-[var(--neon-green)]">{r.id.toUpperCase()}</span>
              {" · ВЫ: "}
              <span className="text-[var(--neon-amber)]">{fmt(playerPrices[r.id])} ₽</span>
              {" · MIN БОТ: "}
              <span className="text-muted-foreground">{fmt(Math.min(...bots.map((b) => b.prices[r.id] ?? 999999)))} ₽</span>
              <span className="mx-3 opacity-30">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="grid grid-cols-[1fr_300px] h-[calc(100vh-84px)]">

        {/* LEFT */}
        <div className="flex flex-col border-r border-[rgba(0,255,200,0.1)]">

          {/* Map */}
          <div className="relative flex-1 scanlines overflow-hidden">
            <svg viewBox="0 0 100 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* Route lines */}
              {ROUTES.map((route) => {
                const fc = cityMap[route.from];
                const tc = cityMap[route.to];
                const isSel = route.id === selectedRoute;
                return (
                  <g key={route.id} onClick={() => setSelectedRoute(route.id)} className="cursor-pointer">
                    <line x1={fc.x} y1={fc.y} x2={tc.x} y2={tc.y}
                      stroke={isSel ? "var(--neon-green)" : "rgba(0,255,200,0.12)"}
                      strokeWidth={isSel ? 0.5 : 0.2}
                      strokeDasharray={isSel ? "2 1" : "1 2"}
                      className={isSel ? "route-active" : ""}
                    />
                    <line x1={fc.x} y1={fc.y} x2={tc.x} y2={tc.y} stroke="transparent" strokeWidth={3} />
                  </g>
                );
              })}

              {/* Cities */}
              {CITIES.map((city) => {
                const isEnd = city.id === selRoute.from || city.id === selRoute.to;
                return (
                  <g key={city.id}>
                    {isEnd && (
                      <circle cx={city.x} cy={city.y} r={1.5}
                        fill="none" stroke="var(--neon-green)" strokeWidth={0.25}
                        opacity={0.5} className="ping-neon"
                      />
                    )}
                    <circle cx={city.x} cy={city.y} r={0.7}
                      fill={isEnd ? "var(--neon-green)" : "rgba(0,255,200,0.35)"}
                    />
                    <text x={city.x + 1.2} y={city.y - 0.5}
                      fill={isEnd ? "var(--neon-green)" : "rgba(0,255,200,0.45)"}
                      fontSize={isEnd ? 2.4 : 1.8}
                      fontFamily="Share Tech Mono, monospace"
                    >{city.code}</text>
                    <text x={city.x + 1.2} y={city.y + 1.8}
                      fill="rgba(0,255,200,0.25)" fontSize={1.4}
                      fontFamily="Share Tech Mono, monospace"
                    >{city.name}</text>
                  </g>
                );
              })}
            </svg>

            {/* Route buttons overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {ROUTES.map((r) => {
                const sh = calcShares(r.id, playerPrices[r.id], bots);
                const winning = playerPrices[r.id] <= Math.min(...bots.map((b) => b.prices[r.id] ?? 999999));
                return (
                  <button key={r.id} onClick={() => setSelectedRoute(r.id)}
                    className={`font-mono-display text-[10px] px-2 py-0.5 border transition-all text-left flex items-center gap-2 ${
                      r.id === selectedRoute
                        ? "border-[var(--neon-green)] neon-text bg-[rgba(0,255,200,0.08)]"
                        : "border-[rgba(0,255,200,0.12)] text-muted-foreground hover:border-[rgba(0,255,200,0.3)]"
                    }`}
                  >
                    <span>{r.id.toUpperCase()}</span>
                    <span className={winning ? "neon-text" : "neon-red"}>
                      {((sh["player"] ?? 0) * 100).toFixed(0)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route detail panel */}
          <div className="panel border-t border-[rgba(0,255,200,0.12)] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="Plane" size={12} className="neon-text" />
                <span className="font-mono-display text-sm neon-text">
                  {fromCity.name} ({fromCity.code}) → {toCity.name} ({toCity.code})
                </span>
              </div>
              <span className="font-mono-display text-[10px] text-muted-foreground">
                ~{fmt(selRoute.baseDemand)} пас/день
              </span>
            </div>

            {/* Share bars */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {competitors.map((c) => {
                const f = c.id === "player" ? flash[selectedRoute] : null;
                return (
                  <div key={c.id}
                    className={`p-2 border rounded-sm transition-all ${
                      c.id === "player"
                        ? "border-[rgba(0,255,200,0.25)] bg-[rgba(0,255,200,0.04)]"
                        : "border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]"
                    } ${f === "up" ? "flash-up" : f === "down" ? "flash-down" : ""}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="font-mono-display text-[9px] text-muted-foreground truncate">{c.name}</span>
                    </div>
                    <div className="font-mono-display text-sm" style={{ color: c.color }}>{fmt(c.price)} ₽</div>
                    <div className="font-mono-display text-[9px] text-muted-foreground mt-0.5">
                      {(c.share * 100).toFixed(0)}% рынка
                    </div>
                    <div className="mt-1 h-0.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.share * 100}%`, background: c.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price controls */}
            <div className="flex items-center gap-2">
              <span className="font-mono-display text-[10px] text-muted-foreground">ЦЕНА:</span>
              {[-500, -100].map((d) => (
                <button key={d} onClick={() => changePrice(selectedRoute, d)}
                  className="px-2 py-1 border border-[rgba(255,59,59,0.35)] neon-red font-mono-display text-xs hover:bg-[rgba(255,59,59,0.08)] transition-all">
                  {d}
                </button>
              ))}
              <div className={`font-mono-display text-lg neon-text px-4 py-1 border border-[rgba(0,255,200,0.2)] min-w-[130px] text-center ${
                flash[selectedRoute] === "up" ? "flash-up" : flash[selectedRoute] === "down" ? "flash-down" : ""
              }`}>
                {fmt(playerPrices[selectedRoute])} ₽
              </div>
              {[100, 500].map((d) => (
                <button key={d} onClick={() => changePrice(selectedRoute, d)}
                  className="px-2 py-1 border border-[rgba(0,255,200,0.35)] neon-text font-mono-display text-xs hover:bg-[rgba(0,255,200,0.08)] transition-all">
                  +{d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col overflow-hidden">

          {/* Leaderboard */}
          <div className="panel border-b border-[rgba(0,255,200,0.1)] p-3">
            <div className="font-mono-display text-[9px] text-muted-foreground tracking-widest mb-2">РЕЙТИНГ</div>

            {/* Player row */}
            <div className="mb-2 p-2 border border-[rgba(0,255,200,0.18)] bg-[rgba(0,255,200,0.04)] rounded-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)]" />
                  <span className="font-mono-display text-[10px] neon-text">Ваша авиакомпания</span>
                </div>
                <span className="font-mono-display text-[10px] text-[var(--neon-amber)]">{fmt(playerBalance)} ₽</span>
              </div>
              <div className="mt-1 h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--neon-green)] rounded-full transition-all duration-700"
                  style={{ width: `${(playerBalance / maxBalance) * 100}%` }} />
              </div>
            </div>

            {/* Bot rows */}
            {[...bots].sort((a, b) => b.balance - a.balance).map((bot) => (
              <div key={bot.id} className="mb-1.5 p-2 border border-[rgba(255,255,255,0.05)] rounded-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: bot.color }} />
                    <span className="font-mono-display text-[10px]" style={{ color: bot.color }}>{bot.name}</span>
                    <span className="font-mono-display text-[8px] text-muted-foreground border border-[rgba(255,255,255,0.08)] px-0.5">
                      {bot.strategy === "aggressive" ? "AGR" : bot.strategy === "premium" ? "PRM" : "FOL"}
                    </span>
                  </div>
                  <span className="font-mono-display text-[10px] text-muted-foreground">{fmt(bot.balance)} ₽</span>
                </div>
                <div className="mt-1 h-0.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(bot.balance / maxBalance) * 100}%`, background: bot.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Routes overview */}
          <div className="panel border-b border-[rgba(0,255,200,0.1)] p-3">
            <div className="font-mono-display text-[9px] text-muted-foreground tracking-widest mb-2">ВСЕ МАРШРУТЫ</div>
            <div className="space-y-0.5">
              {ROUTES.map((r) => {
                const sh = calcShares(r.id, playerPrices[r.id], bots);
                const minBot = Math.min(...bots.map((b) => b.prices[r.id] ?? 99999));
                const winning = playerPrices[r.id] <= minBot;
                return (
                  <div key={r.id} onClick={() => setSelectedRoute(r.id)}
                    className={`flex items-center justify-between cursor-pointer px-1.5 py-1 rounded-sm transition-all hover:bg-[rgba(0,255,200,0.03)] ${
                      r.id === selectedRoute ? "bg-[rgba(0,255,200,0.05)]" : ""
                    }`}
                  >
                    <span className="font-mono-display text-[10px] text-muted-foreground">{r.id.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono-display text-[10px] ${winning ? "neon-text" : "text-muted-foreground"}`}>
                        {fmt(playerPrices[r.id])} ₽
                      </span>
                      <span className={`font-mono-display text-[9px] w-8 text-right ${winning ? "neon-text" : "neon-red"}`}>
                        {((sh["player"] ?? 0) * 100).toFixed(0)}%
                      </span>
                      <Icon name={winning ? "TrendingDown" : "TrendingUp"} size={10}
                        className={winning ? "neon-text" : "neon-red"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event log */}
          <div className="panel flex-1 p-3 overflow-hidden flex flex-col">
            <div className="font-mono-display text-[9px] text-muted-foreground tracking-widest mb-2">ЖУРНАЛ</div>
            <div ref={logRef} className="flex-1 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "none" }}>
              {logs.map((entry, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="font-mono-display text-[8px] text-muted-foreground flex-shrink-0 mt-0.5 opacity-50">{entry.time}</span>
                  <span className={`font-mono-display text-[9px] leading-relaxed ${
                    entry.type === "good" ? "neon-text" : entry.type === "warn" ? "neon-red" : "text-muted-foreground"
                  }`}>{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
