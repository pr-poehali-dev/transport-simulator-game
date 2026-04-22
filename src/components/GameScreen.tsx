import { useState, useEffect, useRef } from "react";
import {
  CITIES_BY_COUNTRY, COUNTRIES, BUS_MODELS, TRAIN_MODELS, PLANE_MODELS,
  City, VehicleModel,
  cityDistance, routeOpenCost, tripDurationMs, tripEarnings,
  UNLOCK_RAIL_COST, UNLOCK_AIR_COST,
} from "@/data/gameData";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "bus" | "train" | "plane";

interface Route {
  id: string;
  fromId: string;
  toId: string;
  phase: Phase;
  vehicleId: string;
  distance: number;
  active: boolean; // рейс в пути прямо сейчас
  progress: number; // 0–1
  lastEarned: number;
  totalEarned: number;
  startedAt: number;
  duration: number; // мс
}

interface CityDemand {
  cityId: string;
  targets: { cityId: string; demand: number }[];
}

interface Props {
  companyName: string;
  countryCode: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function GameScreen({ companyName, countryCode }: Props) {
  const country = COUNTRIES.find((c) => c.code === countryCode)!;
  const busCities = CITIES_BY_COUNTRY[countryCode] ?? [];

  // ── State ──
  const SAVE_KEY = `tt_save_${countryCode}`;

  const loadSave = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  };

  const saved = loadSave();

  const [money, setMoney] = useState<number>(saved?.money ?? 500);
  const [totalEver, setTotalEver] = useState<number>(saved?.totalEver ?? 0);
  const [phase, setPhase] = useState<Phase>(saved?.phase ?? "bus");
  const [routes, setRoutes] = useState<Route[]>(
    (saved?.routes ?? []).map((r: Route) => ({ ...r, active: true, progress: 0, startedAt: Date.now(), duration: 5000 }))
  );
  const [currentVehicle, setCurrentVehicle] = useState<VehicleModel>(
    [...BUS_MODELS, ...TRAIN_MODELS, ...PLANE_MODELS].find((v) => v.id === saved?.vehicleId) ?? BUS_MODELS[0]
  );
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [routeFrom, setRouteFrom] = useState<City | null>(null);
  const [panel, setPanel] = useState<"map" | "shop" | "routes">("map");
  const [demands, setDemands] = useState<CityDemand[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [trainUnlocked, setTrainUnlocked] = useState<boolean>(saved?.trainUnlocked ?? false);
  const [planeUnlocked, setPlaneUnlocked] = useState<boolean>(saved?.planeUnlocked ?? false);
  const [animFrame, setAnimFrame] = useState(0);
  const notifId = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  // Города текущей фазы
  const cities = busCities;

  // ── Автосохранение ──
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        money, totalEver, phase,
        routes: routes.map((r) => ({ ...r, active: false, progress: 0 })),
        vehicleId: currentVehicle.id,
        trainUnlocked, planeUnlocked,
      }));
    } catch (e) { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [money, totalEver, phase, routes.length, currentVehicle.id, trainUnlocked, planeUnlocked]);

  // ── Генерация спроса ──
  useEffect(() => {
    const gen = cities.map((city) => ({
      cityId: city.id,
      targets: cities
        .filter((c) => c.id !== city.id)
        .map((c) => ({ cityId: c.id, demand: Math.floor(20 + Math.random() * 180) }))
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 5),
    }));
    setDemands(gen);

    // Обновляем спрос каждые 8 секунд
    const interval = setInterval(() => {
      setDemands((prev) =>
        prev.map((d) => ({
          ...d,
          targets: d.targets.map((t) => ({
            ...t,
            demand: Math.max(5, t.demand + Math.floor((Math.random() - 0.5) * 40)),
          })),
        }))
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [countryCode]);

  // ── Анимация рейсов (RAF) ──
  useEffect(() => {
    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      setRoutes((prev) => {
        let changed = false;
        const next = prev.map((route) => {
          if (!route.active) return route;
          const elapsed = now - route.startedAt;
          const progress = Math.min(1, elapsed / route.duration);
          if (progress >= 1) {
            // Рейс завершён
            changed = true;
            const vehicle = [...BUS_MODELS, ...TRAIN_MODELS, ...PLANE_MODELS].find(
              (v) => v.id === route.vehicleId
            )!;
            const earned = tripEarnings(vehicle.seats, vehicle.ticketPrice, route.distance);
            // Уведомление
            const from = cities.find((c) => c.id === route.fromId);
            if (from) {
              const notif = { id: notifId.current++, text: `+${earned}₽`, x: from.x, y: from.y };
              setNotifications((ns) => [...ns.slice(-5), notif]);
              setTimeout(() => setNotifications((ns) => ns.filter((n) => n.id !== notif.id)), 2000);
            }
            setMoney((m) => m + earned);
            setTotalEver((t) => t + earned);

            // Запускаем следующий рейс автоматически
            return {
              ...route,
              progress: 0,
              active: true,
              startedAt: now,
              lastEarned: earned,
              totalEarned: route.totalEarned + earned,
            };
          }
          if (Math.abs(progress - route.progress) > 0.005) changed = true;
          return { ...route, progress };
        });
        return changed ? next : prev;
      });

      setAnimFrame((f) => f + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cities]);

  // ── Проверка разблокировок ──
  useEffect(() => {
    if (totalEver >= UNLOCK_RAIL_COST && !trainUnlocked) {
      setTrainUnlocked(true);
      pushNotifCenter("🎉 Открыта железная дорога! Вкладка «Поезда»");
    }
    if (totalEver >= UNLOCK_AIR_COST && !planeUnlocked) {
      setPlaneUnlocked(true);
      pushNotifCenter("🎉 Открыта авиакомпания! Вкладка «Самолёты»");
    }
  }, [totalEver]);

  const pushNotifCenter = (text: string) => {
    const n = { id: notifId.current++, text, x: 50, y: 10 };
    setNotifications((ns) => [...ns.slice(-5), n]);
    setTimeout(() => setNotifications((ns) => ns.filter((nn) => nn.id !== n.id)), 3500);
  };

  // ── Создать маршрут ──
  const createRoute = (fromCity: City, toCity: City) => {
    const dist = cityDistance(fromCity, toCity);
    const cost = routeOpenCost(dist, phase);
    if (money < cost) {
      pushNotifCenter(`❌ Не хватает ${Math.round(cost - money)}₽`);
      return;
    }
    const vehicle = currentVehicle;
    const duration = tripDurationMs(dist, vehicle.speed);
    const newRoute: Route = {
      id: `${fromCity.id}-${toCity.id}-${Date.now()}`,
      fromId: fromCity.id,
      toId: toCity.id,
      phase,
      vehicleId: vehicle.id,
      distance: dist,
      active: true,
      progress: 0,
      lastEarned: 0,
      totalEarned: 0,
      startedAt: Date.now(),
      duration,
    };
    setMoney((m) => m - Math.round(cost));
    setRoutes((prev) => [...prev, newRoute]);
    setRouteFrom(null);
    setSelectedCity(null);
    pushNotifCenter(`✅ Маршрут открыт! Стоимость: ${Math.round(cost)}₽`);
  };

  // ── Купить транспорт ──
  const buyVehicle = (vehicle: VehicleModel) => {
    if (money < vehicle.cost) return;
    setMoney((m) => m - vehicle.cost);
    setCurrentVehicle(vehicle);
    pushNotifCenter(`✅ Куплен ${vehicle.emoji} ${vehicle.name}!`);
  };

  // ── Клик по городу ──
  const handleCityClick = (city: City) => {
    if (routeFrom) {
      if (routeFrom.id === city.id) { setRouteFrom(null); return; }
      createRoute(routeFrom, city);
    } else {
      setSelectedCity(city === selectedCity ? null : city);
    }
  };

  // ── Helpers ──
  const cityById = (id: string) => cities.find((c) => c.id === id);
  const vehicleModels = phase === "bus" ? BUS_MODELS : phase === "train" ? TRAIN_MODELS : PLANE_MODELS;
  const phaseRoutes = routes.filter((r) => r.phase === phase);
  const cityDemand = selectedCity ? demands.find((d) => d.cityId === selectedCity.id) : null;

  const progressColor = (p: number) => {
    if (p < 0.5) return "#60a5fa";
    if (p < 0.8) return "#34d399";
    return "#f59e0b";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-50 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white shadow-sm px-4 py-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {phase === "bus" ? "🚌" : phase === "train" ? "🚂" : "✈️"}
          </span>
          <div>
            <div className="font-black text-gray-800 text-sm leading-tight">{companyName}</div>
            <div className="text-xs text-gray-400">{country.flag} {country.name}</div>
          </div>
        </div>

        {/* Фаза */}
        <div className="flex gap-1">
          {(["bus", "train", "plane"] as Phase[]).map((p) => {
            const locked = (p === "train" && !trainUnlocked) || (p === "plane" && !planeUnlocked);
            const emoji = p === "bus" ? "🚌" : p === "train" ? "🚂" : "✈️";
            const need = p === "train" ? UNLOCK_RAIL_COST : UNLOCK_AIR_COST;
            return (
              <button key={p}
                onClick={() => !locked && setPhase(p)}
                title={locked ? `Нужно заработать ${need.toLocaleString()}₽` : ""}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                  locked ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400" :
                  phase === p ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {locked ? "🔒" : emoji}
              </button>
            );
          })}
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400">Деньги</div>
          <div className="font-black text-green-600 text-lg">💰 {money.toLocaleString()}₽</div>
        </div>
      </div>

      {/* ── Прогресс разблокировок ── */}
      {!trainUnlocked && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center gap-3">
          <span className="text-xs text-amber-700 font-semibold">🚂 До железной дороги:</span>
          <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalEver / UNLOCK_RAIL_COST) * 100)}%` }} />
          </div>
          <span className="text-xs text-amber-600 font-bold">{totalEver.toLocaleString()} / {UNLOCK_RAIL_COST.toLocaleString()}₽</span>
        </div>
      )}
      {trainUnlocked && !planeUnlocked && (
        <div className="bg-sky-50 border-b border-sky-100 px-4 py-1.5 flex items-center gap-3">
          <span className="text-xs text-sky-700 font-semibold">✈️ До авиакомпании:</span>
          <div className="flex-1 h-2 bg-sky-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalEver / UNLOCK_AIR_COST) * 100)}%` }} />
          </div>
          <span className="text-xs text-sky-600 font-bold">{totalEver.toLocaleString()} / {UNLOCK_AIR_COST.toLocaleString()}₽</span>
        </div>
      )}

      {/* ── Вкладки ── */}
      <div className="flex gap-0 border-b border-gray-200 bg-white z-20">
        {(["map", "shop", "routes"] as const).map((tab) => (
          <button key={tab}
            onClick={() => setPanel(tab)}
            className={`flex-1 py-2 text-xs font-bold transition-all ${
              panel === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
          >
            {tab === "map" ? "🗺️ Карта" : tab === "shop" ? "🏪 Магазин" : "📋 Маршруты"}
          </button>
        ))}
      </div>

      {/* ── Уведомления ── */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {notifications.map((n) => (
          <div key={n.id}
            className="absolute font-black text-green-600 bg-white rounded-2xl px-3 py-1 shadow-lg text-sm"
            style={{
              left: `${n.x}%`, top: `${n.y}%`,
              transform: "translate(-50%, -50%)",
              animation: "coinPop 2s ease-out forwards",
            }}>
            {n.text}
          </div>
        ))}
      </div>

      {/* ═══ КАРТА ═══ */}
      {panel === "map" && (
        <div className="flex-1 relative overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
            style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #dcfce7 100%)" }}>

            {/* Маршруты — линии */}
            {phaseRoutes.map((route) => {
              const from = cityById(route.fromId);
              const to = cityById(route.toId);
              if (!from || !to) return null;
              const px = from.x + (to.x - from.x) * route.progress;
              const py = from.y + (to.y - from.y) * route.progress;
              const vehicle = [...BUS_MODELS, ...TRAIN_MODELS, ...PLANE_MODELS].find(
                (v) => v.id === route.vehicleId
              );
              return (
                <g key={route.id}>
                  {/* Линия маршрута */}
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#93c5fd" strokeWidth={0.8} strokeDasharray="2 1" opacity={0.6} />
                  {/* Транспорт */}
                  <text x={px} y={py} textAnchor="middle" dominantBaseline="middle"
                    fontSize={4} style={{ userSelect: "none" }}>
                    {vehicle?.emoji ?? "🚌"}
                  </text>
                  {/* Прогресс дуга */}
                  <circle cx={from.x} cy={from.y} r={2.5}
                    fill="none" stroke={progressColor(route.progress)}
                    strokeWidth={0.6} opacity={0.8}
                    strokeDasharray={`${route.progress * 2 * Math.PI * 2.5} ${2 * Math.PI * 2.5}`}
                    transform={`rotate(-90 ${from.x} ${from.y})`}
                  />
                </g>
              );
            })}

            {/* Выбор «откуда» — стрелки */}
            {routeFrom && cities
              .filter((c) => c.id !== routeFrom.id && !phaseRoutes.find((r) => r.fromId === routeFrom.id && r.toId === c.id))
              .map((c) => {
                const dist = cityDistance(routeFrom, c);
                const cost = routeOpenCost(dist, phase);
                const canAfford = money >= cost;
                return (
                  <g key={c.id}>
                    <line x1={routeFrom.x} y1={routeFrom.y} x2={c.x} y2={c.y}
                      stroke={canAfford ? "#22c55e" : "#ef4444"}
                      strokeWidth={0.5} strokeDasharray="1.5 1" opacity={0.7}
                    />
                    <text x={(routeFrom.x + c.x) / 2} y={(routeFrom.y + c.y) / 2 - 1.5}
                      textAnchor="middle" fontSize={2.2}
                      fill={canAfford ? "#15803d" : "#b91c1c"} fontWeight="bold">
                      {Math.round(cost)}₽
                    </text>
                  </g>
                );
              })}

            {/* Города */}
            {cities.map((city) => {
              const isSelected = selectedCity?.id === city.id;
              const isFrom = routeFrom?.id === city.id;
              const hasRoute = phaseRoutes.some((r) => r.fromId === city.id || r.toId === city.id);
              const dot = isFrom ? "#f59e0b" : isSelected ? "#3b82f6" : hasRoute ? "#22c55e" : "#6b7280";
              return (
                <g key={city.id} className="cursor-pointer" onClick={() => handleCityClick(city)}>
                  {(isSelected || isFrom) && (
                    <circle cx={city.x} cy={city.y} r={4} fill={dot} opacity={0.2} />
                  )}
                  <circle cx={city.x} cy={city.y} r={2.2}
                    fill={dot} stroke="white" strokeWidth={0.6} />
                  <text x={city.x} y={city.y - 3.5}
                    textAnchor="middle" fontSize={2.2}
                    fill="#1f2937" fontWeight="bold" style={{ userSelect: "none" }}>
                    {city.name}
                  </text>
                  <text x={city.x} y={city.y + 5}
                    textAnchor="middle" fontSize={1.8} fill="#6b7280" style={{ userSelect: "none" }}>
                    {city.population}млн
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Панель выбранного города */}
          {selectedCity && !routeFrom && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-black text-gray-800 text-base">{selectedCity.name}</div>
                  <div className="text-xs text-gray-500">{country.flag} {country.name} · {selectedCity.population} млн чел.</div>
                </div>
                <button onClick={() => setSelectedCity(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              {/* Спрос */}
              {cityDemand && (
                <div className="mb-3">
                  <div className="text-xs font-bold text-gray-500 mb-1">🧭 Куда хотят поехать:</div>
                  <div className="flex flex-wrap gap-1">
                    {cityDemand.targets.map((t) => {
                      const tc = cityById(t.cityId);
                      if (!tc) return null;
                      return (
                        <div key={t.cityId}
                          className="flex items-center gap-1 bg-sky-50 rounded-xl px-2 py-0.5 text-xs">
                          <span className="font-bold text-gray-700">{tc.name}</span>
                          <span className="text-sky-600 font-black">{t.demand}</span>
                          <span className="text-gray-400">пас</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setRouteFrom(selectedCity); setSelectedCity(null); }}
                className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold rounded-xl py-2 text-sm transition-all">
                ➕ Создать маршрут из этого города
              </button>
            </div>
          )}

          {/* Режим выбора маршрута */}
          {routeFrom && (
            <div className="absolute top-4 left-4 right-4 bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 z-20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-800">Откуда: {routeFrom.name}</div>
                <div className="text-xs text-amber-600">Нажми на город назначения</div>
              </div>
              <button onClick={() => setRouteFrom(null)}
                className="bg-amber-200 hover:bg-amber-300 rounded-xl px-3 py-1 text-xs font-bold text-amber-800">
                Отмена
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ МАГАЗИН ═══ */}
      {panel === "shop" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Текущий транспорт</div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 mb-4 flex items-center gap-3">
            <span className="text-3xl">{currentVehicle.emoji}</span>
            <div>
              <div className="font-black text-gray-800">{currentVehicle.name}</div>
              <div className="text-xs text-gray-500">{currentVehicle.seats} мест · {currentVehicle.ticketPrice}₽/билет</div>
            </div>
          </div>

          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
            {phase === "bus" ? "🚌 Автобусы" : phase === "train" ? "🚂 Поезда" : "✈️ Самолёты"}
          </div>
          <div className="space-y-3">
            {vehicleModels.map((v) => {
              const owned = currentVehicle.id === v.id;
              const canBuy = money >= v.cost && !owned;
              return (
                <div key={v.id}
                  className={`rounded-2xl p-4 border-2 transition-all ${
                    owned ? "border-blue-400 bg-blue-50" :
                    canBuy ? "border-green-200 bg-white hover:border-green-400" :
                    "border-gray-100 bg-gray-50 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{v.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-800">{v.name}</span>
                        {owned && <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">Текущий</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{v.description}</div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-600">
                        <span>👥 {v.seats} мест</span>
                        <span>🎫 {v.ticketPrice}₽</span>
                        <span>⚡ ×{v.speed} скорость</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {v.cost === 0 ? (
                        <span className="text-green-600 font-bold text-sm">Бесплатно</span>
                      ) : (
                        <div className="font-black text-gray-800">{v.cost.toLocaleString()}₽</div>
                      )}
                      {!owned && v.cost > 0 && (
                        <button
                          onClick={() => buyVehicle(v)}
                          disabled={!canBuy}
                          className={`mt-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            canBuy
                              ? "bg-green-500 text-white hover:bg-green-600 active:scale-95"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {canBuy ? "Купить" : `−${(v.cost - money).toLocaleString()}₽`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ МАРШРУТЫ ═══ */}
      {panel === "routes" && (
        <div className="flex-1 overflow-y-auto p-4">
          {phaseRoutes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="font-bold">Нет маршрутов</div>
              <div className="text-sm mt-1">Зайди на карту и нажми на город!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {phaseRoutes.map((route) => {
                const from = cityById(route.fromId);
                const to = cityById(route.toId);
                const vehicle = [...BUS_MODELS, ...TRAIN_MODELS, ...PLANE_MODELS].find(
                  (v) => v.id === route.vehicleId
                );
                if (!from || !to) return null;
                return (
                  <div key={route.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Иконка едет/мигает */}
                        <span className="text-2xl" style={{
                          display: "inline-block",
                          animation: "vehicleBob 0.8s ease-in-out infinite alternate",
                        }}>{vehicle?.emoji}</span>
                        <div>
                          <div className="font-bold text-sm text-gray-800">
                            {from.name} → {to.name}
                          </div>
                          <div className="text-xs text-gray-400">{vehicle?.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {route.lastEarned > 0 && (
                          <div className="font-black text-green-500 text-base">+{route.lastEarned}₽</div>
                        )}
                        <div className="text-xs text-gray-400">
                          всего: {route.totalEarned.toLocaleString()}₽
                        </div>
                      </div>
                    </div>
                    {/* Простой бегущий индикатор */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-none"
                        style={{ width: `${route.progress * 100}%`, background: "#60a5fa" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>{from.name}</span>
                      <span>⏱ {Math.ceil((1 - route.progress) * route.duration / 1000)}с</span>
                      <span>{to.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes coinPop {
          0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          50%  { transform: translate(-50%, calc(-50% - 30px)) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, calc(-50% - 60px)) scale(0.8); opacity: 0; }
        }
        @keyframes vehicleBob {
          from { transform: translateY(0px); }
          to   { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}