import { useState } from "react";
import { COUNTRIES } from "@/data/gameData";

interface Props {
  onStart: (companyName: string, countryCode: string) => void;
}

export default function RegisterScreen({ onStart }: Props) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"name" | "country">("name");

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.flag.includes(search)
  );

  const handleNext = () => {
    if (name.trim().length >= 2) setStep("country");
  };

  const handleStart = () => {
    if (country) onStart(name.trim(), country);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["🚌","✈️","🚂","🚍","🛫","🚎"].map((e, i) => (
          <div key={i} className="absolute text-4xl opacity-10 animate-bounce"
            style={{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 25}%`, animationDelay: `${i * 0.4}s` }}>
            {e}
          </div>
        ))}
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Логотип */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🚌</div>
          <h1 className="text-3xl font-black text-gray-800" style={{ fontFamily: "Golos Text, sans-serif" }}>
            TransportTycoon
          </h1>
          <p className="text-gray-500 text-sm mt-1">Построй транспортную империю!</p>
        </div>

        {/* Шаг 1: Название */}
        {step === "name" && (
          <div>
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">1</div>
                <span className="font-bold text-gray-700">Придумай название компании</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                placeholder="Например: СупербусТранс"
                maxLength={30}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-blue-400 transition-colors"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/30</p>
            </div>

            {/* Примеры */}
            <div className="flex flex-wrap gap-2 mt-3 mb-6">
              {["РусТранс", "ЭкспрессАвто", "СитиБас", "СпидГо", "МегаРейс"].map((ex) => (
                <button key={ex} onClick={() => setName(ex)}
                  className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 px-3 py-1 rounded-full border border-sky-200 transition-colors">
                  {ex}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={name.trim().length < 2}
              className={`w-full py-3 rounded-2xl text-white font-black text-lg transition-all ${
                name.trim().length >= 2
                  ? "bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Далее →
            </button>
          </div>
        )}

        {/* Шаг 2: Страна */}
        {step === "country" && (
          <div>
            <button onClick={() => setStep("name")}
              className="text-sm text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1">
              ← Назад
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">2</div>
              <span className="font-bold text-gray-700">Выбери страну старта</span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 mb-3">
              <div className="text-sm text-gray-500">Компания:</div>
              <div className="font-black text-gray-800 text-lg">🚌 {name}</div>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Поиск страны..."
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm outline-none focus:border-blue-400 mb-3 transition-colors"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
              {filtered.map((c) => (
                <button key={c.code}
                  onClick={() => setCountry(c.code)}
                  className={`flex items-center gap-2 p-2 rounded-xl border-2 text-left transition-all hover:scale-105 active:scale-95 ${
                    country === c.code
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-xs font-bold text-gray-700 leading-tight">{c.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              disabled={!country}
              className={`w-full py-3 rounded-2xl text-white font-black text-lg mt-4 transition-all ${
                country
                  ? "bg-green-500 hover:bg-green-600 active:scale-95 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              🚀 Начать игру!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
