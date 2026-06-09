import { useState, useEffect } from "react";

const CASINO_URL = "https://stake.com/?c=Veinker1";
const KICK_URL = "https://kick.com/veinker";
const REFERRAL_CODE = "Veinker1";
const RACE_END_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

interface Player {
  id: number;
  maskedName: string;
  baseWager: number;
  hourlyGain: number;
  prize: string;
}

const PLAYERS: Player[] = [
  { id: 1,  maskedName: "S*****",  baseWager: 250000, hourlyGain: 500, prize: "$5,000" },
  { id: 2,  maskedName: "M*****",  baseWager: 151000, hourlyGain: 500, prize: "$2,500" },
  { id: 3,  maskedName: "R*****",  baseWager: 98500,  hourlyGain: 500, prize: "$1,000" },
  { id: 4,  maskedName: "D*****",  baseWager: 74200,  hourlyGain: 75,  prize: "$500" },
  { id: 5,  maskedName: "J*****",  baseWager: 58900,  hourlyGain: 60,  prize: "$300" },
  { id: 6,  maskedName: "A*****",  baseWager: 41300,  hourlyGain: 50,  prize: "$200" },
  { id: 7,  maskedName: "K*****",  baseWager: 29700,  hourlyGain: 45,  prize: "$150" },
  { id: 8,  maskedName: "T*****",  baseWager: 18600,  hourlyGain: 40,  prize: "$100" },
  { id: 9,  maskedName: "C*****",  baseWager: 11200,  hourlyGain: 35,  prize: "$75" },
  { id: 10, maskedName: "L*****",  baseWager: 5800,   hourlyGain: 30,  prize: "$50" },
];

const START_TIME = Date.now();

function computeWager(player: Player, now: number): number {
  const hoursElapsed = Math.floor((now - START_TIME) / (1000 * 60 * 60));
  return player.baseWager + player.hourlyGain * hoursElapsed;
}

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useCountdown(endDate: Date) {
  const [t, setT] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    function tick() {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) return;
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return t;
}

function AvatarIcon({ rank }: { rank: number }) {
  const colors = { 1: "#f59e0b", 2: "#94a3b8", 3: "#f97316" } as Record<number, string>;
  const color = colors[rank] || "#6366f1";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="26" fill={`${color}22`} />
      <circle cx="26" cy="20" r="10" fill={color} opacity="0.85" />
      <ellipse cx="26" cy="42" rx="15" ry="9" fill={color} opacity="0.65" />
    </svg>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const cfg = {
    1: { bg: "#f59e0b", label: "1ST PLACE" },
    2: { bg: "#94a3b8", label: "2ND PLACE" },
    3: { bg: "#f97316", label: "3RD PLACE" },
  } as Record<number, { bg: string; label: string }>;
  const c = cfg[rank];
  return (
    <span
      className="rank-badge"
      style={{ background: c.bg }}
    >
      {c.label}
    </span>
  );
}

export default function WagerRace() {
  const [now, setNow] = useState(Date.now());
  const [search, setSearch] = useState("");
  const [navActive, setNavActive] = useState("leaderboard");
  const countdown = useCountdown(RACE_END_DATE);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const players = PLAYERS.map((p) => ({ ...p, wager: computeWager(p, now) }))
    .sort((a, b) => b.wager - a.wager);

  const filtered = players.filter((p) =>
    p.maskedName.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = players.slice(0, 3);
  const rest = filtered.filter((p) => p.id !== top3[0].id && p.id !== top3[1].id && p.id !== top3[2].id);

  const podium = [top3[1], top3[0], top3[2]];
  const podiumRanks = [2, 1, 3];

  const totalPrize = "$10,000";

  return (
    <div className="wr-root">
      <div className="wr-particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="wr-particle" style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            animationDelay: `${(i * 0.7) % 4}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }} />
        ))}
      </div>

      <aside className="wr-sidebar">
        <div className="wr-profile">
          <div className="wr-avatar-wrap">
            <img src="/veinker-avatar.png" alt="Veinker" className="wr-avatar" />
            <span className="wr-avatar-dot" />
          </div>
          <div className="wr-profile-name">Veinker</div>
          <div className="wr-profile-sub">● ONLINE</div>
        </div>

        <nav className="wr-nav">
          <button
            className={`wr-nav-item ${navActive === "leaderboard" ? "active" : ""}`}
            onClick={() => setNavActive("leaderboard")}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8 6H21M8 12H21M8 18H21M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
            Leaderboard
          </button>
          <a
            href={KICK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`wr-nav-item ${navActive === "kick" ? "active" : ""}`}
            onClick={() => setNavActive("kick")}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 5v10h2v-4l4 4h3l-5-5 5-5h-3l-4 4V7H6z"/>
            </svg>
            Kick Channel
          </a>
          <a
            href={CASINO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="wr-nav-item"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            Stake.com
          </a>
        </nav>

        <div className="wr-sidebar-footer">
          <a href={KICK_URL} target="_blank" rel="noopener noreferrer" className="wr-sidebar-link">
            kick.com/veinker
          </a>
        </div>
      </aside>

      <main className="wr-main">
        <div className="wr-hero">
          <div className="wr-hero-prize">{totalPrize}</div>
          <h1 className="wr-hero-title">LEADERBOARD</h1>
          <p className="wr-hero-sub">
            MAKE SURE YOU'RE USING CODE{" "}
            <a href={CASINO_URL} target="_blank" rel="noopener noreferrer" className="wr-code">
              "{REFERRAL_CODE}"
            </a>
          </p>
        </div>

        <div className="wr-podium-section">
          <div className="wr-podium">
            {podium.map((player, i) => {
              const rank = podiumRanks[i];
              const isFirst = rank === 1;
              return (
                <div key={player.id} className={`wr-podium-card ${isFirst ? "first" : ""} rank-${rank}`}>
                  <RankBadge rank={rank} />
                  <div className="wr-podium-avatar">
                    <AvatarIcon rank={rank} />
                  </div>
                  <div className="wr-podium-name">{player.maskedName}</div>
                  <div className="wr-podium-label">TOTAL WAGERED</div>
                  <div className="wr-podium-wager">{formatUSD(player.wager)}</div>
                  <div className="wr-podium-diamond">♦</div>
                  <div className="wr-podium-prize">{player.prize}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="wr-countdown-wrap">
          <div className="wr-countdown-icon">♦</div>
          <h2 className="wr-month-title">WAGER RACE — 30 DAYS</h2>
          <p className="wr-month-sub">The leaderboard resets at the end of the period. Check back regularly to see your placement.</p>
          <div className="wr-countdown-row">
            {[
              { val: countdown.days,  label: "DAYS" },
              { val: countdown.hours, label: "HRS" },
              { val: countdown.mins,  label: "MINS" },
              { val: countdown.secs,  label: "SECS" },
            ].map(({ val, label }, i) => (
              <div key={label} className="wr-cd-item">
                <span className="wr-cd-val">{String(val).padStart(2, "0")}</span>
                <span className="wr-cd-label">{label}</span>
                {i < 3 && <span className="wr-cd-sep">:</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="wr-table-section">
          <div className="wr-search-wrap">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="wr-search-icon">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="wr-search"
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className="wr-table">
            <thead>
              <tr>
                <th>PLACE</th>
                <th>USERNAME</th>
                <th>WAGERED</th>
                <th>PRIZE</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((player) => {
                const rank = players.findIndex((p) => p.id === player.id) + 1;
                return (
                  <tr key={player.id} className="wr-row">
                    <td className="wr-td-place">#{rank}</td>
                    <td className="wr-td-name">{player.maskedName}</td>
                    <td className="wr-td-wager">{formatUSD(player.wager)}</td>
                    <td className="wr-td-prize">{player.prize}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="wr-footer">
          <span>© 2025 Veinker · Gamble responsibly · +18</span>
          <a href={CASINO_URL} target="_blank" rel="noopener noreferrer">
            stake.com/?c=Veinker1
          </a>
        </footer>
      </main>
    </div>
  );
}
