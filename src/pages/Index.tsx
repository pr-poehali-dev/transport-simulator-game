import { useState } from "react";
import RegisterScreen from "@/components/RegisterScreen";
import GameScreen from "@/components/GameScreen";

export default function Index() {
  const [game, setGame] = useState<{ companyName: string; countryCode: string } | null>(null);

  if (!game) {
    return <RegisterScreen onStart={(name, code) => setGame({ companyName: name, countryCode: code })} />;
  }

  return <GameScreen companyName={game.companyName} countryCode={game.countryCode} />;
}
