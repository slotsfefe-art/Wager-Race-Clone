import { useState, useEffect, useRef } from "react";

const CASINO_URL = "https://stake.com/?c=Veinker1";
const CASINO_NAME = "Stake.com";

const RACE_END_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

interface Player {
  id: number;
  maskedName: string;
  baseWager: number;
  hourlyGain: number;
  startTime: number;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1,  maskedName: "S*****",   baseWager: 250000, hourlyGain: 1800, startTime: Date.now() },
  { id: 2,  maskedName: "M*****",   baseWager: 151000, hourlyGain: 1400, startTime: Date.now() },
  { id: 3,  maskedName: "R*****",   baseWager: 98500,  hourlyGain: 1100, startTime: Date.now() },
  { id: 4,  maskedName: "D*****",   baseWager: 74200,  hourlyGain: 180,  startTime: Date.now() },
  { id: 5,  maskedName: "J*****",   baseWager: 58900,  hourlyGain: 160,  startTime: Date.now() },
  { id: 6,  maskedName: "A*****",   baseWager: 41300,  hourlyGain: 140,  startTime: Date.now() },
  { id: 7,  maskedName: "K*****",   baseWager: 29700,  hourlyGain: 130,  startTime: Date.now() },
  { id: 8,  maskedName: "T*****",   baseWager: 18600,  hourlyGain: 120,  startTime: Date.now() },
  { id: 9,  maskedName: "C*****",   baseWager: 11200,  hourlyGain: 110,  startTime: Date.now() },
  { id: 10, maskedName: "L*****",   baseWager: 5800,   hourlyGain: 100,  startTime: Date.now() },
];

const PRIZES = [
  { place: 1, amount: "$5,000" },
  { place: 2, amount: "$2,500" },
  { place: 3, amount: "$1,000" },
  { place: 4, amount: "$500" },
  { place: 5, amount: "$250" },
];

function useCountdown(endDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function tick() {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return timeLeft;
}

function computeWager(player: Player, now: number): number {
  const hoursElapsed = (now - player.startTime) / (1000 * 60 * 60);
  const increment = player.hourlyGain * hoursElapsed;
  const jitter = Math.sin(player.id * 137.5 + hoursElapsed * 0.3) * player.hourlyGain * 0.15;
  return Math.round(player.baseWager + increment + jitter);
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toLocaleString();
}

function PlaceIcon({ place }: { place: number }) {
  if (place === 1) return <span className="trophy gold">🥇</span>;
  if (place === 2) return <span className="trophy silver">🥈</span>;
  if (place === 3) return <span className="trophy bronze">🥉</span>;
  return <span className="place-number">#{place}</span>;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-box">
      <span className="countdown-value">{String(value).padStart(2, "0")}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

export default function WagerRace() {
  const [now, setNow] = useState(Date.now());
  const [prevWagers, setPrevWagers] = useState<Record<number, number>>({});
  const [flashUp, setFlashUp] = useState<Record<number, boolean>>({});
  const countdownTime = useCountdown(RACE_END_DATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const players = INITIAL_PLAYERS.map((p) => ({
    ...p,
    wager: computeWager(p, now),
  })).sort((a, b) => b.wager - a.wager);

  useEffect(() => {
    const newFlash: Record<number, boolean> = {};
    players.forEach((p) => {
      if (prevWagers[p.id] !== undefined && p.wager > prevWagers[p.id]) {
        newFlash[p.id] = true;
      }
    });
    if (Object.keys(newFlash).length > 0) {
      setFlashUp(newFlash);
      setTimeout(() => setFlashUp({}), 800);
    }
    const newPrev: Record<number, number> = {};
    players.forEach((p) => { newPrev[p.id] = p.wager; });
    setPrevWagers(newPrev);
  }, [now]);

  const maxWager = players[0]?.wager ?? 1;

  return (
    <div className="race-root">
      <div className="stars-bg" aria-hidden />

      <header className="race-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">⚡</div>
            <div>
              <h1 className="brand-title">WAGER RACE</h1>
              <p className="brand-sub">Powered by {CASINO_NAME}</p>
            </div>
          </div>
          <a href={CASINO_URL} target="_blank" rel="noopener noreferrer" className="join-btn">
            <span>Jugar en {CASINO_NAME}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
        </div>
      </header>

      <main className="race-main">
        <section className="countdown-section">
          <p className="countdown-title">TIEMPO RESTANTE</p>
          <div className="countdown-row">
            <CountdownBox value={countdownTime.days} label="DÍAS" />
            <span className="countdown-sep">:</span>
            <CountdownBox value={countdownTime.hours} label="HORAS" />
            <span className="countdown-sep">:</span>
            <CountdownBox value={countdownTime.minutes} label="MIN" />
            <span className="countdown-sep">:</span>
            <CountdownBox value={countdownTime.seconds} label="SEG" />
          </div>
        </section>

        <div className="race-grid">
          <section className="leaderboard-section">
            <div className="section-head">
              <h2 className="section-title">TABLA DE LÍDERES</h2>
              <span className="live-badge">● LIVE</span>
            </div>

            <div className="leaderboard-list">
              {players.map((player, idx) => {
                const rank = idx + 1;
                const pct = Math.max(4, (player.wager / maxWager) * 100);
                const isTop3 = rank <= 3;
                const isFlashing = flashUp[player.id];
                return (
                  <div
                    key={player.id}
                    className={`leaderboard-row ${isTop3 ? "top3" : ""} ${isFlashing ? "flash-up" : ""} rank-${rank}`}
                  >
                    <div className="row-left">
                      <div className="row-place">
                        <PlaceIcon place={rank} />
                      </div>
                      <div className="row-info">
                        <span className="row-name">{player.maskedName}</span>
                        <div className="progress-bar-wrap">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row-right">
                      <span className={`row-wager ${isFlashing ? "wager-flash" : ""}`}>
                        {formatUSD(player.wager)}
                      </span>
                      {isFlashing && <span className="tick-up">▲</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="prizes-section">
            <div className="section-head">
              <h2 className="section-title">PREMIOS</h2>
            </div>
            <div className="prizes-list">
              {PRIZES.map((prize) => (
                <div key={prize.place} className={`prize-row prize-${prize.place}`}>
                  <div className="prize-left">
                    <PlaceIcon place={prize.place} />
                    <span className="prize-place-text">Lugar #{prize.place}</span>
                  </div>
                  <span className="prize-amount">{prize.amount}</span>
                </div>
              ))}
            </div>

            <div className="casino-card">
              <div className="casino-card-inner">
                <div className="casino-card-icon">🎰</div>
                <div className="casino-card-text">
                  <p className="casino-card-title">¡Únete a la carrera!</p>
                  <p className="casino-card-sub">Regístrate con nuestro código y compite por los premios</p>
                </div>
              </div>
              <a href={CASINO_URL} target="_blank" rel="noopener noreferrer" className="casino-cta-btn">
                Ir a {CASINO_NAME}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
              </a>
            </div>

            <div className="rules-card">
              <h3 className="rules-title">Reglas de la Carrera</h3>
              <ul className="rules-list">
                <li>El wager se actualiza en tiempo real</li>
                <li>Solo cuentan apuestas en slots y casino</li>
                <li>Los premios se entregan al finalizar la carrera</li>
                <li>Usa el código <strong>Veinker1</strong> al registrarte</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <footer className="race-footer">
        <p>Juega responsablemente · +18 · {CASINO_NAME}</p>
        <a href={CASINO_URL} target="_blank" rel="noopener noreferrer">
          stake.com/?c=Veinker1
        </a>
      </footer>
    </div>
  );
}
