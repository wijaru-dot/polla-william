import { useState, useEffect, useCallback } from "react";
import { db, auth } from "./firebase";
import { TEAM_FLAGS, WC2026_MATCHES } from "./worldcupData";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref as dbRef, onValue, set as fbSet, update, remove } from "firebase/database";

// ── LIVE SCORES API ────────────────────────────────────────────────────────────
const APIFOOTBALL_KEY = "bfc394917e14e28073b971110edeece5";
const APIFOOTBALL_BASE = "https://v3.football.api-sports.io";
// -- AVATARES
const AVATARES = [
  { id: "Alexia", nombre: "Alexia Putellas", archivo: "Alexia.png" },
  { id: "Alex_Morgan", nombre: "Alex Morgan", archivo: "Alex_Morgan.png" },
  { id: "Beckand", nombre: "Beckham", archivo: "Beckand.jpeg" },
  { id: "Cristiano", nombre: "Cristiano", archivo: "Cristiano.jpeg" },
  { id: "Cruyff", nombre: "Cruyff", archivo: "Cruyff.png" },
  { id: "Edgar_Davids", nombre: "Edgar Davids", archivo: "Edgar Davids.jpeg" },
  { id: "Falcao", nombre: "Falcao", archivo: "Falcao.jpeg" },
  { id: "Figo", nombre: "Figo", archivo: "Figo.png" },
  { id: "Gullit", nombre: "Gullit", archivo: "Gullit.png" },
  { id: "Higuita", nombre: "Higuita", archivo: "Higuita.jpeg" },
  { id: "Iniesta", nombre: "Iniesta", archivo: "Iniesta.jpeg" },
  { id: "James", nombre: "James", archivo: "James.png" },
  { id: "Linda", nombre: "Linda Caicedo", archivo: "Linda.png" },
  { id: "Lucho", nombre: "Lucho Diaz", archivo: "Lucho.jpeg" },
  { id: "Luis_Suarez", nombre: "Luis Suarez", archivo: "Luis Suarez.jpeg" },
  { id: "Marta", nombre: "Marta", archivo: "Marta.png" },
  { id: "Messi", nombre: "Messi", archivo: "Messi.jpeg" },
  { id: "Neymar", nombre: "Neymar", archivo: "Neymar.jpeg" },
  { id: "Pele", nombre: "Pele", archivo: "Pele.jpeg" },
  { id: "Pibe", nombre: "El Pibe", archivo: "Pibe.jpeg" },
  { id: "Puyol", nombre: "Puyol", archivo: "Puyol.jpeg" },
  { id: "Richard", nombre: "Richard Rios", archivo: "Richard.png" },
  { id: "Rivaldo", nombre: "Rivaldo", archivo: "Rivaldo.png" },
  { id: "Roberto_Carlos", nombre: "Roberto Carlos", archivo: "Roberto_Carlos.png" },
  { id: "Ronaldinho", nombre: "Ronaldinho", archivo: "Ronaldinho.png" },
  { id: "Ronaldo", nombre: "Ronaldo", archivo: "Ronaldo.png" },
  { id: "Thierry", nombre: "Thierry Henry", archivo: "Thierrry.jpeg" },
  { id: "Tino", nombre: "Tino Asprilla", archivo: "Tino.jpeg" },
  { id: "Zidane", nombre: "Zidane", archivo: "Zidane.jpeg" },
];
function getAvatarUrl(avatarId) {
  const av = AVATARES.find(a => a.id === avatarId);
  return av ? "/avatars/" + av.archivo : null;
}

function useLiveScore(match) {
  const [liveData, setLiveData] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!match?.datetime || match.status === "finished") return;
    const matchTime = new Date(match.datetime);
    const now = new Date();
    const diffMs = now - matchTime;
    const diffMins = diffMs / 60000;
    if (diffMins < 0 || diffMins > 120) return;

    setIsLive(true);

    async function fetchScore() {
      try {
        const res = await fetch(`${APIFOOTBALL_BASE}/fixtures?league=2&season=2025&live=all`, {
          headers: { "x-apisports-key": APIFOOTBALL_KEY }
        });
        if (!res.ok) return;
        const data = await res.json();
        const fixtures = data.response || [];
        const found = fixtures.find(f => {
          const home = f.teams.home.name.toLowerCase();
          const away = f.teams.away.name.toLowerCase();
          const ourHome = match.homeTeam.toLowerCase();
          const ourAway = match.awayTeam.toLowerCase();
          return (home.includes(ourHome.split(" ")[0]) || ourHome.includes(home.split(" ")[0])) &&
                 (away.includes(ourAway.split(" ")[0]) || ourAway.includes(away.split(" ")[0]));
        });
        if (found) {
          setLiveData({
            home: found.goals.home ?? 0,
            away: found.goals.away ?? 0,
            minute: found.fixture.status.elapsed || null,
            status: found.fixture.status.short,
          });
        }
      } catch(e) {
        console.log("Live score fetch error:", e);
      }
    }

    fetchScore();
    const interval = setInterval(fetchScore, 60000);
    return () => clearInterval(interval);
  }, [match?.id, match?.datetime, match?.status, match?.homeTeam, match?.awayTeam]);

  return { liveData, isLive };
}

// ── UTILS ──────────────────────────────────────────────────────────────────────
function genId() { return Math.random().toString(36).slice(2, 9); }
function genCode() {
  const words = ["GALLO", "POLLA", "GOL", "CRACK", "ONCE", "BALON", "PIBE", "CAFETERO"];
  const nums = Math.floor(Math.random() * 90 + 10);
  return words[Math.floor(Math.random() * words.length)] + nums;
}
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function isPastDeadline(match) {
  if (!match?.datetime) return false;
  return new Date() > new Date(match.datetime);
}
function getPhaseLabel(phase) {
  const map = { groups: "Fase de Grupos", r16: "Octavos de Final", qf: "Cuartos de Final", sf: "Semifinal", final: "Gran Final", test: "🧪 Prueba" };
  return map[phase] || phase;
}

// Tournament type labels
const TOURNAMENT_TYPES = {
  worldcup: { label: "Copa del Mundo", icon: "🌍" },
  champions: { label: "Champions League", icon: "⭐" },
  copa_america: { label: "Copa América", icon: "🌎" },
  euro: { label: "Eurocopa", icon: "🇪🇺" },
  libertadores: { label: "Copa Libertadores", icon: "🏆" },
  custom: { label: "Personalizado", icon: "⚽" },
};

// ── SCORING ────────────────────────────────────────────────────────────────────
function calcPoints(pred, result, scoring) {
  if (!pred || !result || result.status !== "finished") return null;
  const s = scoring || { winner: 2, exact: 3, penalty: 3, wrongPenalty: 1 };
  let pts = 0;
  const pHome = parseInt(pred.home) || 0, pAway = parseInt(pred.away) || 0;
  const rHome = parseInt(result.home), rAway = parseInt(result.away);
  const predWinner = pHome > pAway ? "home" : pHome < pAway ? "away" : "draw";
  const realWinner = rHome > rAway ? "home" : rHome < rAway ? "away" : "draw";
  const isKnockout = result.phase !== "groups" && result.phase !== "test";

  if (isKnockout && realWinner === "draw") {
    if (result.penalties) {
      const realPensWinner = parseInt(result.pensHome) > parseInt(result.pensAway) ? "home" : "away";
      if (predWinner === "draw") {
        pts += s.winner;
        if (pHome === rHome && pAway === rAway) pts += s.exact;
        if (pred.pensHome !== undefined && pred.pensAway !== undefined) {
          if (parseInt(pred.pensHome) === parseInt(result.pensHome) && parseInt(pred.pensAway) === parseInt(result.pensAway)) pts += s.penalty;
        }
      } else {
        if (predWinner === realPensWinner) pts += s.wrongPenalty;
      }
    } else {
      const realET_Home = parseInt(result.etHome ?? result.home);
      const realET_Away = parseInt(result.etAway ?? result.away);
      const realETWinner = realET_Home > realET_Away ? "home" : realET_Home < realET_Away ? "away" : "draw";
      if (predWinner === "draw" && realETWinner === "draw") pts += s.winner;
      if (predWinner !== "draw" && predWinner === realETWinner) pts += s.winner;
      if (pHome === realET_Home && pAway === realET_Away) pts += s.exact;
    }
  } else {
    if (predWinner === realWinner) pts += s.winner;
    if (pHome === rHome && pAway === rAway) pts += s.exact;
  }
  return pts;
}

function calcChampPoints(pred, winner, champPoints) {
  if (!pred || !winner) return 0;
  return pred === winner ? (champPoints || 10) : 0;
}

function computeStats(participantId, matches, predictions, champPredictions, tournamentWinner, scoring) {
  let total = 0, exact = 0, wins = 0, maxStreak = 0, tempStreak = 0;
  let groupsPts = 0, elimPts = 0, played = 0, noPred = 0;
  const champPts = calcChampPoints(champPredictions?.[participantId]?.team, tournamentWinner, scoring?.champion);
  const finishedMatches = Object.values(matches || {}).filter(m => m.status === "finished").sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const totalMatches = finishedMatches.length;

  finishedMatches.forEach(m => {
    const pred = predictions?.[m.id]?.[participantId];
    const pts = calcPoints(pred, m.result, scoring) ?? 0;
    if (pred) played++;
    else noPred++;
    total += pts;
    if (pts >= (scoring?.exact || 3) + (scoring?.winner || 2)) exact++;
    if (pts >= (scoring?.winner || 2)) { wins++; tempStreak++; maxStreak = Math.max(maxStreak, tempStreak); }
    else tempStreak = 0;
    if (m.phase === "groups" || m.phase === "test") groupsPts += pts;
    else elimPts += pts;
  });

  total += champPts;
  const pct = played > 0 ? Math.round((wins / played) * 100) : 0;
  return { total, exact, wins, groupsPts, elimPts, champPts, streak: maxStreak, pct, played, noPred, totalMatches };
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --green: #00C853; --green-dark: #007B33; --green-deep: #004D20;
    --gold: #FFD700; --gold-dark: #B8860B; --red: #FF1744;
    --bg: #0a0f0a; --bg2: #111811; --bg3: #182018;
    --card: #1a221a; --card2: #212b21; --border: #2a3a2a;
    --text: #e8f5e8; --text2: #8faa8f; --text3: #5a705a;
    --radius: 12px;
  }
  .light {
    --bg: #f0f7f0; --bg2: #e8f5e8; --bg3: #dceadc;
    --card: #ffffff; --card2: #f5faf5; --border: #c8ddc8;
    --text: #0d1f0d; --text2: #3a5a3a; --text3: #7a9a7a;
  }
  body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

  /* HEADER */
  .header { background: linear-gradient(135deg, var(--green-deep), var(--green-dark)); padding: 14px 16px 10px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; border-bottom: 2px solid var(--gold); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  .header-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--gold); letter-spacing: 2px; line-height: 1; }
  .header-sub { font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 1px; margin-top: 1px; }
  .header-right { display: flex; align-items: center; gap: 8px; }
  .dark-toggle { background: none; border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 8px; padding: 4px 8px; font-size: 13px; cursor: pointer; }

  /* TOURNAMENT SELECTOR */
  .tournament-bar { background: var(--bg2); border-bottom: 1px solid var(--border); padding: 8px 14px; display: flex; align-items: center; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .tournament-bar::-webkit-scrollbar { display: none; }
  .tournament-chip { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; border: 1.5px solid var(--border); background: none; color: var(--text2); font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
  .tournament-chip.active { background: var(--green-dark); border-color: var(--green); color: white; }
  .tournament-chip .t-icon { font-size: 14px; }

  /* AVATAR */
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gold); color: var(--green-deep); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); overflow: hidden; flex-shrink: 0; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-lg { width: 56px; height: 56px; border-radius: 50%; background: var(--gold); color: var(--green-deep); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; border: 3px solid var(--green); overflow: hidden; flex-shrink: 0; }
  .avatar-lg img { width: 100%; height: 100%; object-fit: cover; }

  /* NAV */
  .nav { display: flex; background: var(--card); border-top: 1px solid var(--border); position: sticky; bottom: 0; z-index: 100; }
  .nav-btn { flex: 1; padding: 10px 4px 8px; background: none; border: none; color: var(--text3); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; font-family: 'Outfit', sans-serif; transition: color 0.2s; }
  .nav-btn.active { color: var(--green); }
  .nav-btn .icon { font-size: 19px; }

  /* CONTENT */
  .content { flex: 1; overflow-y: auto; padding: 14px; padding-bottom: 80px; }

  /* CARDS */
  .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; margin-bottom: 12px; }
  .card-title { font-weight: 700; font-size: 12px; color: var(--text2); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }

  /* MATCH CARD */
  .match-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; margin-bottom: 10px; transition: border-color 0.2s; }
  .match-card:hover { border-color: var(--green-dark); }
  .match-teams { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .team-name { font-weight: 700; font-size: 14px; flex: 1; color: var(--text); }
  .team-name.away { text-align: right; }
  .vs { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: var(--text3); margin: 0 8px; }
  .match-meta { font-size: 11px; color: var(--text3); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
  .phase-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .phase-test { background: rgba(255,193,7,0.15); color: #FFB300; border: 1px solid rgba(255,193,7,0.3); }
  .phase-groups { background: rgba(0,200,83,0.1); color: var(--green); border: 1px solid rgba(0,200,83,0.2); }
  .phase-knockout { background: rgba(255,23,68,0.1); color: var(--red); border: 1px solid rgba(255,23,68,0.2); }

  /* STEPPER */
  .stepper { display: flex; align-items: center; }
  .step-btn { width: 32px; height: 42px; background: var(--bg3); border: 1.5px solid var(--border); color: var(--text); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .step-btn:first-child { border-radius: 8px 0 0 8px; border-right: none; }
  .step-btn:last-child { border-radius: 0 8px 8px 0; border-left: none; }
  .step-btn:hover:not(:disabled) { background: var(--green-dark); color: white; }
  .step-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .step-val { width: 42px; height: 42px; background: var(--bg2); border: 1.5px solid var(--border); color: var(--text); font-family: 'Bebas Neue', sans-serif; font-size: 22px; text-align: center; display: flex; align-items: center; justify-content: center; }
  .score-input-row { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .score-dash { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: var(--text3); }

  /* RESULT */
  .result-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
  .result-score { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: var(--gold); letter-spacing: 3px; }
  .pts-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .pts-badge.good { background: rgba(0,200,83,0.15); color: var(--green); border: 1px solid rgba(0,200,83,0.3); }
  .pts-badge.ok { background: rgba(255,215,0,0.15); color: var(--gold); border: 1px solid rgba(255,215,0,0.3); }
  .pts-badge.zero { background: rgba(255,255,255,0.05); color: var(--text3); border: 1px solid var(--border); }

  /* REVEAL GRID */
  .reveal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; }
  .reveal-item { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
  .reveal-name { font-size: 11px; color: var(--text3); margin-bottom: 3px; }
  .reveal-score { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: var(--text); display: flex; align-items: center; justify-content: space-between; }

  /* STANDINGS */
  .standings-row { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; margin-bottom: 6px; background: var(--card); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
  .standings-row:hover { border-color: var(--green-dark); }
  .standings-row.top1 { border-color: rgba(255,215,0,0.3); border-left: 4px solid var(--gold); }
  .standings-row.top2 { border-color: rgba(192,192,192,0.3); border-left: 4px solid #C0C0C0; }
  .rank { font-family: 'Bebas Neue', sans-serif; font-size: 22px; width: 26px; color: var(--text3); text-align: center; }
  .rank.gold { color: var(--gold); }
  .rank.silver { color: #C0C0C0; }
  .rank.bronze { color: #CD7F32; }
  .standing-name { font-weight: 700; font-size: 14px; color: var(--text); }
  .standing-stats { font-size: 10px; color: var(--text2); margin-top: 2px; }
  .standing-pts { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--green); }
  .unpaid-badge { font-size: 10px; background: rgba(255,23,68,0.15); color: var(--red); border: 1px solid rgba(255,23,68,0.3); border-radius: 4px; padding: 2px 5px; }

  /* STATS MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.2s; }
  .modal { background: var(--card); border-radius: 20px 20px 0 0; padding: 20px; width: 100%; max-width: 480px; max-height: 80vh; overflow-y: auto; animation: slideUp 0.3s; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .stat-box { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 12px; text-align: center; }
  .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--green); }
  .stat-lbl { font-size: 10px; color: var(--text3); margin-top: 2px; letter-spacing: 0.5px; }

  /* BUTTONS */
  .btn { padding: 11px 18px; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
  .btn-primary { background: linear-gradient(135deg, var(--green), var(--green-dark)); color: white; box-shadow: 0 4px 15px rgba(0,200,83,0.3); }
  .btn-primary:hover { transform: translateY(-1px); }
  .btn-secondary { background: var(--card2); color: var(--text); border: 1px solid var(--border); }
  .btn-danger { background: rgba(255,23,68,0.12); color: var(--red); border: 1px solid rgba(255,23,68,0.3); }
  .btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--green-deep); font-weight: 700; }
  .btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 7px; }
  .btn-full { width: 100%; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  /* INPUTS */
  .input { width: 100%; padding: 11px 13px; background: var(--bg2); border: 1.5px solid var(--border); border-radius: 10px; color: var(--text); font-family: 'Outfit', sans-serif; font-size: 14px; transition: border-color 0.2s; }
  .input:focus { outline: none; border-color: var(--green); }
  .input-label { font-size: 12px; font-weight: 600; color: var(--text2); margin-bottom: 5px; display: block; letter-spacing: 0.5px; }
  .input-group { margin-bottom: 12px; }
  .input-row { display: flex; gap: 8px; }
  select.input { appearance: none; cursor: pointer; }

  /* TABS */
  .tabs { display: flex; background: var(--bg2); border-radius: 10px; padding: 3px; margin-bottom: 14px; }
  .tab { flex: 1; padding: 7px; border-radius: 7px; border: none; background: none; color: var(--text3); font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .tab.active { background: var(--green-dark); color: white; }

  /* LOGIN */
  .login-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; background: radial-gradient(ellipse at center top, #004D20 0%, #0a0f0a 65%); }
  .login-logo { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: var(--gold); letter-spacing: 3px; text-align: center; line-height: 1; text-shadow: 0 0 40px rgba(255,215,0,0.3); }
  .login-chicken { font-size: 64px; margin-bottom: 8px; animation: bounce 2s infinite; }
  @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  .login-slogan { font-size: 13px; color: rgba(255,255,255,0.45); letter-spacing: 1.5px; text-align: center; margin-bottom: 32px; }
  .login-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; width: 100%; max-width: 360px; }
  .login-tabs { display: flex; gap: 8px; margin-bottom: 18px; }
  .login-tab { flex: 1; padding: 9px; border-radius: 8px; border: 1.5px solid var(--border); background: none; color: var(--text2); font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .login-tab.active { border-color: var(--green); color: var(--green); background: rgba(0,200,83,0.08); }

  /* NOTIFICATION */
  .notif { position: fixed; top: 68px; left: 50%; transform: translateX(-50%); background: var(--green-dark); color: white; padding: 10px 20px; border-radius: 30px; font-size: 13px; font-weight: 500; z-index: 999; box-shadow: 0 4px 20px rgba(0,0,0,0.4); animation: slideDown 0.3s ease; max-width: 90%; text-align: center; }
  @keyframes slideDown { from { transform: translateX(-50%) translateY(-16px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

  /* PAYMENT */
  .payment-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: var(--card2); border: 1px solid var(--border); margin-bottom: 6px; }

  /* POOL */
  .pool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .pool-card { background: var(--card2); border: 1px solid var(--border); border-radius: 10px; padding: 12px; text-align: center; }
  .pool-label { font-size: 10px; color: var(--text3); margin-bottom: 4px; letter-spacing: 0.5px; }
  .pool-amount { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--gold); }

  /* CHAMPION */
  .champ-card { background: linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,200,83,0.04)); border: 1px solid rgba(255,215,0,0.25); border-radius: var(--radius); padding: 14px; margin-bottom: 12px; }

  /* SCORING CONFIG */
  .scoring-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .scoring-item { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 10px; }
  .scoring-label { font-size: 11px; color: var(--text3); margin-bottom: 6px; }
  .scoring-val { display: flex; align-items: center; gap: 6px; }
  .scoring-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg3); color: var(--text); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .scoring-num { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--green); width: 32px; text-align: center; }

  /* RULES BOX */
  .rules-box { background: linear-gradient(135deg, rgba(0,200,83,0.06), rgba(255,215,0,0.04)); border: 1px solid rgba(0,200,83,0.2); border-radius: var(--radius); padding: 14px; margin-bottom: 12px; }
  .rules-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: var(--gold); letter-spacing: 1px; margin-bottom: 10px; }
  .rules-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
  .rules-row:last-child { border-bottom: none; }
  .rules-pts { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--green); }

  /* GROUP TABLE */
  .group-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 14px; overflow: hidden; }
  .group-header { background: linear-gradient(135deg, var(--green-deep), var(--green-dark)); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; }
  .group-header-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: var(--gold); letter-spacing: 2px; }
  .group-table { width: 100%; border-collapse: collapse; }
  .group-table th { font-size: 10px; color: var(--text3); font-weight: 600; padding: 6px 8px; text-align: center; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
  .group-table th:first-child { text-align: left; padding-left: 12px; }
  .group-table td { font-size: 12px; padding: 8px 8px; text-align: center; border-bottom: 1px solid var(--border); color: var(--text); }
  .group-table td:first-child { text-align: left; padding-left: 12px; font-weight: 600; }
  .group-table tr:last-child td { border-bottom: none; }
  .group-table tr.qualified { background: rgba(0,200,83,0.06); }
  .group-table tr.qualified-3rd { background: rgba(255,215,0,0.05); }
  .qualify-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 4px; }
  .qualify-1st { background: var(--green); box-shadow: 0 0 4px var(--green); }
  .qualify-2nd { background: #4CAF50; }
  .qualify-3rd { background: var(--gold); }

  /* MISC */
  .sep { height: 1px; background: var(--border); margin: 14px 0; }
  .empty { text-align: center; padding: 36px 20px; color: var(--text3); }
  .empty-icon { font-size: 44px; margin-bottom: 10px; }
  .empty-text { font-size: 13px; }
  .info-box { background: rgba(0,200,83,0.06); border: 1px solid rgba(0,200,83,0.18); border-radius: 10px; padding: 11px 13px; margin-bottom: 10px; font-size: 13px; color: var(--text2); line-height: 1.6; }
  .warning-box { background: rgba(255,215,0,0.06); border: 1px solid rgba(255,215,0,0.2); border-radius: 10px; padding: 11px 13px; margin-bottom: 10px; font-size: 13px; color: #c8a400; line-height: 1.6; }
  .section-hero { background: linear-gradient(135deg, var(--green-deep), var(--bg2)); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 14px; text-align: center; }
  .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--gold); letter-spacing: 2px; }
  .hero-sub { font-size: 12px; color: var(--text2); margin-top: 3px; }
  .code-display { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--gold); letter-spacing: 5px; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .admin-section-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--gold); letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
  .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; background: var(--bg); }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* LIVE SCORE */
  .live-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: rgba(255,23,68,0.15); color: var(--red); border: 1px solid rgba(255,23,68,0.3); border-radius: 20px; font-size: 10px; font-weight: 700; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  .live-score { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: var(--red); letter-spacing: 4px; text-align: center; }
  .live-score-card { background: rgba(255,23,68,0.05); border: 1px solid rgba(255,23,68,0.2); border-radius: 10px; padding: 10px; margin: 8px 0; text-align: center; }
  .live-minute { font-size: 11px; color: var(--red); margin-top: 2px; }

  /* COUNTDOWN BANNER */
  .countdown-banner { background: linear-gradient(135deg, #004D20, #1B5E20); border-bottom: 2px solid var(--gold); padding: 8px 16px; display: flex; align-items: center; justify-content: center; gap: 10px; position: sticky; top: 64px; z-index: 99; }
  .countdown-banner.match-day { background: linear-gradient(135deg, #B8860B, #FFD700); }
  .countdown-days { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--gold); letter-spacing: 2px; line-height: 1; }
  .countdown-banner.match-day .countdown-days { color: var(--green-deep); }
  .countdown-label { font-size: 11px; color: rgba(255,255,255,0.8); letter-spacing: 1px; text-align: center; line-height: 1.3; }
  .countdown-banner.match-day .countdown-label { color: var(--green-deep); font-weight: 700; }
  .countdown-icon { font-size: 20px; }

  /* TOURNAMENT CARD */
  .tournament-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; margin-bottom: 10px; }
  .tournament-card.active-tournament { border-color: var(--green); border-left: 4px solid var(--green); }
  .tournament-name { font-weight: 700; font-size: 15px; color: var(--text); }
  .tournament-meta { font-size: 11px; color: var(--text3); margin-top: 3px; }
  .active-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: rgba(0,200,83,0.15); color: var(--green); border: 1px solid rgba(0,200,83,0.3); border-radius: 20px; font-size: 10px; font-weight: 700; }
`;

function SelectorAvatar({ avatarActual, onSeleccionar, onCerrar }) {
  const [seleccionado, setSeleccionado] = useState(avatarActual || null);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onCerrar}>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, padding:20, width:"100%", maxWidth:420, maxHeight:"85vh", display:"flex", flexDirection:"column", gap:14 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:18, fontWeight:700, color:"var(--gold)" }}>Elige tu jugador</div>
          <button onClick={onCerrar} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:20, cursor:"pointer" }}>X</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, overflowY:"auto" }}>
          {AVATARES.map(av => (
            <div key={av.id} onClick={() => setSeleccionado(av.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", padding:"8px 4px", borderRadius:10, border: seleccionado===av.id ? "2px solid var(--gold)" : "2px solid transparent", background: seleccionado===av.id ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)" }}>
              <img src={"/avatars/"+av.archivo} alt={av.nombre} style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", background:"rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize:9, color:"var(--text2)", textAlign:"center" }}>{av.nombre}</span>
            </div>
          ))}
        </div>
        <button disabled={!seleccionado} onClick={() => seleccionado && onSeleccionar(seleccionado)} style={{ padding:12, borderRadius:10, border:"none", fontWeight:700, fontSize:14, cursor: seleccionado?"pointer":"not-allowed", background: seleccionado?"var(--gold)":"var(--card2)", color: seleccionado?"var(--green-deep)":"var(--text3)", width:"100%" }}>
          {seleccionado ? "Confirmar - "+AVATARES.find(a=>a.id===seleccionado)?.nombre : "Selecciona un jugador"}
        </button>
      </div>
    </div>
  );
}
// ── COUNTDOWN BANNER ──────────────────────────────────────────────────────────
function CountdownBanner() {
  const WC_START = new Date("2026-06-11T00:00:00");
  const now = new Date();
  const diffMs = WC_START - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null; // After World Cup started, hide banner

  if (diffDays === 0) {
    return (
      <div className="countdown-banner match-day">
        <span className="countdown-icon">🌍</span>
        <div style={{ textAlign: "center" }}>
          <div className="countdown-days">¡HOY ES EL DÍA!</div>
          <div className="countdown-label">¡EL MUNDIAL 2026 COMIENZA AHORA! ⚽🏆</div>
        </div>
        <span className="countdown-icon">🏆</span>
      </div>
    );
  }

  return (
    <div className="countdown-banner">
      <span className="countdown-icon">⚽</span>
      <div style={{ textAlign: "center" }}>
        <div className="countdown-days">{diffDays} DÍAS</div>
        <div className="countdown-label">PARA EL MUNDIAL 2026 🌍</div>
      </div>
      <span className="countdown-icon">🌍</span>
    </div>
  );
}

// ── STEPPER ────────────────────────────────────────────────────────────────────
function Stepper({ value, onChange, disabled }) {
  const v = parseInt(value) || 0;
  return (
    <div className="stepper">
      <button className="step-btn" onClick={() => onChange(Math.max(0, v - 1))} disabled={disabled}>−</button>
      <div className="step-val">{v}</div>
      <button className="step-btn" onClick={() => onChange(v + 1)} disabled={disabled}>+</button>
    </div>
  );
}

// ── SCORING CONFIG COMPONENT ───────────────────────────────────────────────────
function ScoringConfig({ scoring, onChange }) {
  const s = scoring || { winner: 2, exact: 3, penalty: 3, wrongPenalty: 1, champion: 10 };
  const fields = [
    { key: "winner", label: "Acertar ganador/empate" },
    { key: "exact", label: "Bonus marcador exacto" },
    { key: "penalty", label: "Bonus penales exactos" },
    { key: "wrongPenalty", label: "Ganador fue a penales" },
    { key: "champion", label: "Polla del campeón" },
  ];
  return (
    <div className="scoring-grid">
      {fields.map(f => (
        <div key={f.key} className="scoring-item">
          <div className="scoring-label">{f.label}</div>
          <div className="scoring-val">
            <button className="scoring-btn" onClick={() => onChange({ ...s, [f.key]: Math.max(0, (s[f.key] || 0) - 1) })}>−</button>
            <div className="scoring-num">{s[f.key] ?? 0}</div>
            <button className="scoring-btn" onClick={() => onChange({ ...s, [f.key]: (s[f.key] || 0) + 1 })}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── RULES BOX ─────────────────────────────────────────────────────────────────
function RulesBox({ scoring, tournamentName }) {
  const s = scoring || { winner: 2, exact: 3, penalty: 3, wrongPenalty: 1, champion: 10 };
  return (
    <div className="rules-box">
      <div className="rules-title">📋 Reglas de Puntuación{tournamentName ? ` — ${tournamentName}` : ""}</div>
      <div className="rules-row"><span>✅ Acertar ganador o empate (90 min)</span><span className="rules-pts">{s.winner} pts</span></div>
      <div className="rules-row"><span>🎯 Bonus: marcador exacto</span><span className="rules-pts">+{s.exact} pts</span></div>
      <div className="rules-row"><span>⚽ Bonus: penales exactos</span><span className="rules-pts">+{s.penalty} pts</span></div>
      <div className="rules-row"><span>🔄 Ganador acertado pero fue a penales</span><span className="rules-pts">{s.wrongPenalty} pt</span></div>
      <div className="rules-row"><span>🏆 Polla del campeón</span><span className="rules-pts">+{s.champion} pts</span></div>
      <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)" }}>
        Máx partido normal: <strong>{s.winner + s.exact} pts</strong> · Con penales: <strong>{s.winner + s.exact + s.penalty} pts</strong>
      </div>
    </div>
  );
}

// ── STATS MODAL ────────────────────────────────────────────────────────────────
function StatsModal({ participant, stats, onClose, matches, predictions, scoring }) {
  const matchHistory = Object.values(matches || {})
    .filter(m => m.status === "finished")
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, 10);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="avatar-lg">
            {participant.photoURL ? <img src={participant.photoURL} alt="" /> : participant.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{participant.name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>Estadísticas del torneo</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }} onClick={onClose}>✕</button>
        </div>
        <div className="stat-grid">
          <div className="stat-box"><div className="stat-val">{stats.total}</div><div className="stat-lbl">PUNTOS</div></div>
          <div className="stat-box"><div className="stat-val">{stats.exact}</div><div className="stat-lbl">EXACTOS</div></div>
          <div className="stat-box"><div className="stat-val">{stats.pct}%</div><div className="stat-lbl">ACIERTOS</div></div>
          <div className="stat-box"><div className="stat-val">{stats.streak}</div><div className="stat-lbl">MEJOR RACHA</div></div>
          <div className="stat-box"><div className="stat-val">{stats.groupsPts}</div><div className="stat-lbl">PTS GRUPOS</div></div>
          <div className="stat-box"><div className="stat-val">{stats.elimPts}</div><div className="stat-lbl">PTS ELIM.</div></div>
        </div>
        {stats.champPts > 0 && <div className="info-box">🏆 +{stats.champPts} puntos por acertar el campeón</div>}
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 8 }}>ÚLTIMOS PARTIDOS</div>
        {matchHistory.map(m => {
          const pred = predictions?.[m.id]?.[participant.id];
          const pts = calcPoints(pred, m.result, scoring);
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 500 }}>{m.homeTeam} vs {m.awayTeam}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>
                  Real: {m.result.home}-{m.result.away} · Mi pred: {pred ? `${pred.home}-${pred.away}` : "Sin pred."}
                </div>
              </div>
              {pts !== null && <span className={`pts-badge ${pts >= 4 ? "good" : pts > 0 ? "ok" : "zero"}`}>{pts}p</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MATCH CARD ─────────────────────────────────────────────────────────────────
function MatchCard({ match, myPred, onSave, isAdmin, onSetResult, allPreds, participants, scoring }) {
  const [pred, setPred] = useState(myPred || { home: 0, away: 0 });
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(!myPred);
  const locked = isPastDeadline(match);
  const finished = match.status === "finished";
  const isKnockout = match.phase !== "groups" && match.phase !== "test";
  const predDraw = parseInt(pred.home) === parseInt(pred.away);
  const myPts = finished ? calcPoints(myPred, match.result, scoring) : null;
  const phaseClass = match.phase === "test" ? "phase-test" : match.phase === "groups" ? "phase-groups" : "phase-knockout";
  const { liveData, isLive } = useLiveScore(match);

  useEffect(() => { setPred(myPred || { home: 0, away: 0 }); setEditing(!myPred); }, [myPred]);

  return (
    <div className="match-card">
      <div className="match-meta">
        <span>{fmtDate(match.datetime)}{match.stadium ? ` · ${match.stadium}` : ""}</span>
        <span className={`phase-badge ${phaseClass}`}>{match.group ? `Grupo ${match.group}` : getPhaseLabel(match.phase)}</span>
      </div>
      <div className="match-teams">
        <span className="team-name">{TEAM_FLAGS[match.homeTeam] || "🏳️"} {match.homeTeam}</span>
        <span className="vs">VS</span>
        <span className="team-name away">{match.awayTeam} {TEAM_FLAGS[match.awayTeam] || "🏳️"}</span>
      </div>

      {/* LIVE SCORE */}
      {isLive && liveData && !finished && (
        <div className="live-score-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <span className="live-badge">● EN VIVO</span>
            {liveData.minute && <span className="live-minute">⏱ {liveData.minute}'</span>}
          </div>
          <div className="live-score">{liveData.home} – {liveData.away}</div>
          {liveData.status === "PAUSED" && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>Medio tiempo</div>}
        </div>
      )}

      {!finished && (
        <div>
          {(editing || !myPred) && (
            <div className="score-input-row">
              <Stepper value={pred.home} onChange={v => setPred(p => ({ ...p, home: v }))} disabled={locked} />
              <span className="score-dash">:</span>
              <Stepper value={pred.away} onChange={v => setPred(p => ({ ...p, away: v }))} disabled={locked} />
            </div>
          )}
          {!editing && myPred && !locked && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "var(--green)", letterSpacing: 4 }}>{pred.home} – {pred.away}</span>
            </div>
          )}
          {isKnockout && predDraw && !locked && (
            <div style={{ marginTop: 8, padding: 10, background: "rgba(255,23,68,0.05)", borderRadius: 8, border: "1px solid rgba(255,23,68,0.12)" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>⚠️ Predices empate → marcador de penales:</div>
              <div className="score-input-row">
                <Stepper value={pred.pensHome || 0} onChange={v => setPred(p => ({ ...p, pensHome: v }))} />
                <span style={{ fontSize: 11, color: "var(--text3)" }}>PEN</span>
                <Stepper value={pred.pensAway || 0} onChange={v => setPred(p => ({ ...p, pensAway: v }))} />
              </div>
            </div>
          )}
          {!locked && (
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              {myPred && !editing ? (
                <>
                  <button className="btn btn-full" style={{ background: "rgba(0,200,83,0.12)", color: "var(--green)", border: "1.5px solid rgba(0,200,83,0.3)", borderRadius: 10, padding: "11px 18px", fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 600, cursor: "default" }}>
                    ✅ Predicción guardada
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }} onClick={() => setEditing(true)}>✏️</button>
                </>
              ) : (
                <button className="btn btn-primary btn-full btn-sm" onClick={() => { onSave(match.id, pred); setEditing(false); }}>
                  💾 Guardar predicción
                </button>
              )}
            </div>
          )}
          {locked && !myPred && <div className="warning-box" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>⏰ Sin predicción — 0 puntos</div>}
          {locked && myPred && <div className="info-box" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>🔒 Predicción guardada · {myPred.home}-{myPred.away}</div>}
          {isAdmin && locked && <AdminSetResult match={match} onSetResult={onSetResult} />}
        </div>
      )}

      {finished && (
        <div>
          <div className="result-row">
            <div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 2 }}>Resultado oficial</div>
              <div className="result-score">{match.result.home} – {match.result.away}</div>
              {match.result.penalties && <div style={{ fontSize: 10, color: "var(--text3)" }}>Penales: {match.result.pensHome}-{match.result.pensAway}</div>}
            </div>
            {myPts !== null && (
              <span className={`pts-badge ${myPts >= 4 ? "good" : myPts > 0 ? "ok" : "zero"}`}>
                {myPts >= 4 ? "🎯" : myPts > 0 ? "✅" : "❌"} {myPts} pts
              </span>
            )}
          </div>
          <button className="btn btn-secondary btn-sm btn-full" style={{ marginTop: 10 }} onClick={() => setExpanded(e => !e)}>
            {expanded ? "▲ Ocultar" : "👁 Ver predicciones"}
          </button>
          {expanded && (
            <div className="reveal-grid" style={{ marginTop: 8 }}>
              {Object.entries(allPreds || {}).map(([uid, p]) => {
                const pts = calcPoints(p, match.result, scoring);
                return (
                  <div key={uid} className="reveal-item">
                    <div className="reveal-name">{p.userName}</div>
                    <div className="reveal-score">
                      <span>{p.home}-{p.away}</span>
                      <span className={`pts-badge ${pts >= 4 ? "good" : pts > 0 ? "ok" : "zero"}`} style={{ fontSize: 10, padding: "1px 6px" }}>{pts}p</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ADMIN SET RESULT ───────────────────────────────────────────────────────────
function AdminSetResult({ match, onSetResult }) {
  const [res, setRes] = useState({ home: 0, away: 0, penalties: false, pensHome: 0, pensAway: 0 });
  const [open, setOpen] = useState(false);
  const isKnockout = match.phase !== "groups" && match.phase !== "test";

  if (!open) return <button className="btn btn-gold btn-sm btn-full" style={{ marginTop: 8 }} onClick={() => setOpen(true)}>⚽ Ingresar resultado</button>;
  return (
    <div style={{ marginTop: 8, background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: "var(--gold)", marginBottom: 8, fontWeight: 600 }}>Resultado oficial (90 min)</div>
      <div className="score-input-row">
        <Stepper value={res.home} onChange={v => setRes(r => ({ ...r, home: v }))} />
        <span className="score-dash">:</span>
        <Stepper value={res.away} onChange={v => setRes(r => ({ ...r, away: v }))} />
      </div>
      {isKnockout && res.home === res.away && (
        <div style={{ marginTop: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)", marginBottom: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={res.penalties} onChange={e => setRes(r => ({ ...r, penalties: e.target.checked }))} />
            ¿Hubo penales?
          </label>
          {res.penalties && (
            <div className="score-input-row">
              <Stepper value={res.pensHome} onChange={v => setRes(r => ({ ...r, pensHome: v }))} />
              <span style={{ fontSize: 11, color: "var(--text3)" }}>PEN</span>
              <Stepper value={res.pensAway} onChange={v => setRes(r => ({ ...r, pensAway: v }))} />
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => { onSetResult(match.id, { ...res, status: "finished", phase: match.phase }); setOpen(false); }}>✅ Confirmar</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>✕</button>
      </div>
    </div>
  );
}

// ── EDIT MATCH ─────────────────────────────────────────────────────────────────
function EditMatch({ match, onEdit, onCorrectResult }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ homeTeam: match.homeTeam, awayTeam: match.awayTeam, datetime: match.datetime, phase: match.phase });
  const [resForm, setResForm] = useState({ home: match.result?.home || 0, away: match.result?.away || 0, penalties: match.result?.penalties || false, pensHome: match.result?.pensHome || 0, pensAway: match.result?.pensAway || 0 });
  const [tab, setTab] = useState("info");
  const isKnockout = match.phase !== "groups" && match.phase !== "test";

  if (!open) return <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>✏️ Editar</button>;
  return (
    <div style={{ marginTop: 8, background: "rgba(0,200,83,0.05)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button className={"btn btn-sm " + (tab === "info" ? "btn-primary" : "btn-secondary")} onClick={() => setTab("info")}>📋 Datos</button>
        <button className={"btn btn-sm " + (tab === "result" ? "btn-primary" : "btn-secondary")} onClick={() => setTab("result")}>⚽ Resultado</button>
        <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }} onClick={() => setOpen(false)}>✕</button>
      </div>
      {tab === "info" && (
        <div>
          <div className="input-row">
            <div className="input-group" style={{ flex: 1 }}><label className="input-label">Local</label><input className="input" value={form.homeTeam} onChange={e => setForm(f => ({ ...f, homeTeam: e.target.value }))} /></div>
            <div className="input-group" style={{ flex: 1 }}><label className="input-label">Visitante</label><input className="input" value={form.awayTeam} onChange={e => setForm(f => ({ ...f, awayTeam: e.target.value }))} /></div>
          </div>
          <div className="input-row">
            <div className="input-group" style={{ flex: 1 }}><label className="input-label">Fecha y hora</label><input className="input" type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} /></div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Fase</label>
              <select className="input" value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}>
                <option value="test">🧪 Prueba</option><option value="groups">Fase Grupos</option><option value="r16">Octavos</option><option value="qf">Cuartos</option><option value="sf">Semifinal</option><option value="final">Final</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-sm" onClick={() => { 
            const utcForm = { ...form, datetime: new Date(form.datetime).toISOString() };
            onEdit(match.id, utcForm); setOpen(false); 
          }}>✅ Guardar cambios</button>
        </div>
      )}
      {tab === "result" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--gold)", marginBottom: 8, fontWeight: 600 }}>Corregir resultado</div>
          <div className="score-input-row">
            <Stepper value={resForm.home} onChange={v => setResForm(r => ({ ...r, home: v }))} />
            <span className="score-dash">:</span>
            <Stepper value={resForm.away} onChange={v => setResForm(r => ({ ...r, away: v }))} />
          </div>
          {isKnockout && resForm.home === resForm.away && (
            <div style={{ marginTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)", marginBottom: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={resForm.penalties} onChange={e => setResForm(r => ({ ...r, penalties: e.target.checked }))} />
                ¿Hubo penales?
              </label>
              {resForm.penalties && (
                <div className="score-input-row">
                  <Stepper value={resForm.pensHome} onChange={v => setResForm(r => ({ ...r, pensHome: v }))} />
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>PEN</span>
                  <Stepper value={resForm.pensAway} onChange={v => setResForm(r => ({ ...r, pensAway: v }))} />
                </div>
              )}
            </div>
          )}
          <button className="btn btn-gold btn-full btn-sm" style={{ marginTop: 10 }} onClick={() => { onCorrectResult(match.id, { ...resForm, status: "finished", phase: match.phase }); setOpen(false); }}>✅ Corregir resultado</button>
        </div>
      )}
    </div>
  );
}

// ── GROUP STANDINGS ────────────────────────────────────────────────────────────
function calcGroupStandings(groupLetter, matches) {
  const groupMatches = Object.values(matches).filter(m => m.group === groupLetter && m.phase === "groups");
  const teams = {};
  groupMatches.forEach(m => {
    if (!teams[m.homeTeam]) teams[m.homeTeam] = { name: m.homeTeam, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    if (!teams[m.awayTeam]) teams[m.awayTeam] = { name: m.awayTeam, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    if (m.status === "finished" && m.result) {
      const h = parseInt(m.result.home), a = parseInt(m.result.away);
      teams[m.homeTeam].pj++; teams[m.awayTeam].pj++;
      teams[m.homeTeam].gf += h; teams[m.homeTeam].gc += a;
      teams[m.awayTeam].gf += a; teams[m.awayTeam].gc += h;
      if (h > a) { teams[m.homeTeam].pg++; teams[m.homeTeam].pts += 3; teams[m.awayTeam].pp++; }
      else if (h < a) { teams[m.awayTeam].pg++; teams[m.awayTeam].pts += 3; teams[m.homeTeam].pp++; }
      else { teams[m.homeTeam].pe++; teams[m.homeTeam].pts++; teams[m.awayTeam].pe++; teams[m.awayTeam].pts++; }
    }
  });
  return Object.values(teams).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);
}

function GroupCard({ groupLetter, matches }) {
  const [showResults, setShowResults] = useState(false);
  const table = calcGroupStandings(groupLetter, matches);
  const groupMatches = Object.values(matches).filter(m => m.group === groupLetter && m.phase === "groups" && m.status === "finished").sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  return (
    <div className="group-card">
      <div className="group-header">
        <div className="group-header-title">Grupo {groupLetter}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{table[0]?.pts || 0} pts líder</div>
      </div>
      <table className="group-table">
        <thead><tr><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>
          {table.map((team, idx) => (
            <tr key={team.name} className={idx < 2 ? "qualified" : idx === 2 ? "qualified-3rd" : ""}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {idx === 0 ? <span className="qualify-dot qualify-1st" /> : idx === 1 ? <span className="qualify-dot qualify-2nd" /> : idx === 2 ? <span className="qualify-dot qualify-3rd" /> : null}
                  <span>{TEAM_FLAGS[team.name] || "🏳️"}</span>
                  <span style={{ fontSize: 11 }}>{team.name}</span>
                </div>
              </td>
              <td>{team.pj}</td><td>{team.pg}</td><td>{team.pe}</td><td>{team.pp}</td>
              <td style={{ color: team.gf - team.gc > 0 ? "var(--green)" : team.gf - team.gc < 0 ? "var(--red)" : "var(--text3)" }}>{team.gf - team.gc > 0 ? "+" : ""}{team.gf - team.gc}</td>
              <td style={{ fontWeight: 700 }}>{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {groupMatches.length > 0 && (
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-secondary btn-sm btn-full" style={{ marginBottom: 8 }} onClick={() => setShowResults(r => !r)}>
            {showResults ? "▲ Ocultar" : `▼ Ver ${groupMatches.length} resultado${groupMatches.length > 1 ? "s" : ""}`}
          </button>
          {showResults && groupMatches.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
              <span>{TEAM_FLAGS[m.homeTeam] || "🏳️"} {m.homeTeam}</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "var(--gold)", padding: "0 10px" }}>{m.result.home} - {m.result.away}</span>
              <span>{m.awayTeam} {TEAM_FLAGS[m.awayTeam] || "🏳️"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PROFILE MENU ───────────────────────────────────────────────────────────────
function ProfileMenu({ user, onLogout, onClose, onChangeAvatar }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300 }} onClick={onClose}>
      <div style={{ position: "absolute", top: 64, right: 12, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gold)", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, overflow: "hidden", cursor: "pointer" }} onClick={() => { onChangeAvatar(); onClose(); }}>
            {user.avatar ? <img src={getAvatarUrl(user.avatar)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : user.name[0].toUpperCase()}
          </div>
          </div>
          {user.role !== "admin" && (
              <button onClick={() => { onChangeAvatar(); onClose(); }} style={{ background:"none", border:"none", color:"var(--gold)", fontSize:11, cursor:"pointer", padding:0, marginTop:2 }}>✏️ Cambiar avatar</button>
            )}
        </div>
        {user.role !== "admin" && (
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontWeight: 600 }}>ESTADO DE PAGO</div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: "var(--bg2)", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 2 }}>⚽ Grupos</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: user.paidGroups ? "var(--green)" : "var(--red)" }}>{user.paidGroups ? "✅ Pagado" : "⏳ Pendiente"}</div>
              </div>
              <div style={{ flex: 1, background: "var(--bg2)", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 2 }}>🏆 Elim.</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: user.paidElim ? "var(--green)" : "var(--red)" }}>{user.paidElim ? "✅ Pagado" : "⏳ Pendiente"}</div>
              </div>
            </div>
          </div>
        )}
        <button className="btn btn-danger btn-full btn-sm" onClick={() => { onLogout(); onClose(); }}>🚪 Cerrar sesión</button>
      </div>
    </div>
  );
}

// ── CHAMPION PREDICTION ────────────────────────────────────────────────────────
function ChampPrediction({ userId, champPredictions, tournamentWinner, onSave, matches, scoring }) {
  const [team, setTeam] = useState(champPredictions?.[userId]?.team || "");
  const [editing, setEditing] = useState(false);
  const myPred = champPredictions?.[userId];
  const hasStarted = Object.values(matches || {}).some(m => m.phase !== "test" && isPastDeadline(m));
  const champPts = scoring?.champion || 10;

  return (
    <div className="champ-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)" }}>🏆 La Polla del Campeón</div>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>+{champPts} pts</span>
      </div>
      {myPred && !editing ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Tu predicción</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{hasStarted ? myPred.team : "🔒 Guardada"}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {!hasStarted && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️</button>}
            {tournamentWinner && myPred.team === tournamentWinner && <span className="pts-badge good">🏆 +{champPts} pts</span>}
          </div>
        </div>
      ) : (
        <div>
          <input className="input" placeholder="¿Quién ganará?" value={team} onChange={e => setTeam(e.target.value)} style={{ marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => { onSave(team); setEditing(false); }} disabled={!team.trim()}>🏆 Guardar</button>
            {editing && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancelar</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ mode: "register", name: "", email: "", code: "", password: "", adminEmail: "", error: "" });
  const [activeTab, setActiveTab] = useState("predictions");
  const [predTab, setPredTab] = useState("upcoming");
  const [adminTab, setAdminTab] = useState("matches");
  const [standTab, setStandTab] = useState("total");
  const [notif, setNotif] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [newMatch, setNewMatch] = useState({ homeTeam: "", awayTeam: "", datetime: "", phase: "test" });

  // Tournament state
  const [tournaments, setTournaments] = useState({});
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [newTournament, setNewTournament] = useState({ name: "", type: "champions", year: new Date().getFullYear() });

  // Per-tournament Firebase data
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState({});
  const [predictions, setPredictions] = useState({});
  const [champPredictions, setChampPredictions] = useState({});
  const [settings, setSettings] = useState({ quota: 50000, currency: "COP", groupCode: genCode(), tournamentWinner: "", scoring: { winner: 2, exact: 3, penalty: 3, wrongPenalty: 1, champion: 10 } });
  const [pools, setPools] = useState({ groups: 0, eliminations: 0 });

  const showNotif = useCallback((msg) => { setNotif({ msg }); setTimeout(() => setNotif(null), 3000); }, []);

  // ── Load tournaments list ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onValue(dbRef(db, "tournaments"), snap => {
      const data = snap.val() || {};
      setTournaments(data);
      // Auto-select active tournament
      const active = Object.values(data).find(t => t.isActive);
      if (active && !activeTournamentId) setActiveTournamentId(active.id);
      else if (!activeTournamentId && Object.keys(data).length > 0) setActiveTournamentId(Object.keys(data)[0]);
    });
    return () => unsub();
  }, [activeTournamentId]);

  // ── Load data for active tournament ───────────────────────────────────────
  useEffect(() => {
    if (!activeTournamentId) return;
    const path = `tournaments/${activeTournamentId}`;
    const unsubs = [];
    unsubs.push(onValue(dbRef(db, `${path}/participants`), snap => {
      const data = snap.val() || {};
      setParticipants(Object.values(data));
      setCurrentUser(prev => {
        if (!prev || prev.role === "admin") return prev;
        const fresh = data[prev.id];
        return fresh ? { ...prev, ...fresh } : prev;
      });
    }));
    unsubs.push(onValue(dbRef(db, `${path}/matches`), snap => setMatches(snap.val() || {})));
    unsubs.push(onValue(dbRef(db, `${path}/predictions`), snap => setPredictions(snap.val() || {})));
    unsubs.push(onValue(dbRef(db, `${path}/champPredictions`), snap => setChampPredictions(snap.val() || {})));
    unsubs.push(onValue(dbRef(db, `${path}/settings`), snap => {
      const s = snap.val();
      if (s) setSettings(s);
      else fbSet(dbRef(db, `${path}/settings`), { quotaGroups: 50000, quotaElim: 50000, currency: "COP", groupCode: genCode(), tournamentWinner: "", scoring: { winner: 2, exact: 3, penalty: 3, wrongPenalty: 1, champion: 10 }, prizeFirst: 70, prizeSecond: 30 });
    }));
    unsubs.push(onValue(dbRef(db, `${path}/pools`), snap => setPools(snap.val() || { groups: 0, eliminations: 0 })));
    return () => unsubs.forEach(u => u());
  }, [activeTournamentId]);

  // ── Back navigation ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleBack = (e) => {
      e.preventDefault();
      if (showProfileMenu) { setShowProfileMenu(false); return; }
      if (selectedParticipant) { setSelectedParticipant(null); return; }
      if (activeTab === "admin" && adminTab !== "matches") { setAdminTab("matches"); return; }
      if (activeTab !== "predictions") { setActiveTab("predictions"); return; }
    };
    window.addEventListener("popstate", handleBack);
    window.history.pushState({ page: activeTab }, "");
    return () => window.removeEventListener("popstate", handleBack);
  }, [activeTab, adminTab, showProfileMenu, selectedParticipant]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        onValue(dbRef(db, `admins/${firebaseUser.uid}`), snap => {
          if (snap.val()) {
            setCurrentUser({ id: firebaseUser.uid, name: "Admin", role: "admin", email: firebaseUser.email, active: true });
          } else if (activeTournamentId) {
            onValue(dbRef(db, `tournaments/${activeTournamentId}/participants/${firebaseUser.uid}`), pSnap => {
              if (pSnap.val()) setCurrentUser(pSnap.val());
            }, { onlyOnce: true });
          }
        }, { onlyOnce: true });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [activeTournamentId]);

  async function handleRegister() {
    const name = loginForm.name.trim(), email = loginForm.email.trim();
    if (!name) return setLoginForm(f => ({ ...f, error: "Ingresa tu nombre" }));
    if (!email) return setLoginForm(f => ({ ...f, error: "Ingresa tu correo" }));
    if (!activeTournamentId) return setLoginForm(f => ({ ...f, error: "No hay torneo activo" }));
    if (loginForm.code !== settings.groupCode) return setLoginForm(f => ({ ...f, error: "Código incorrecto" }));
    setAuthLoading(true);
    try {
      const snap = await new Promise(resolve => onValue(dbRef(db, `tournaments/${activeTournamentId}/participants`), s => resolve(s), { onlyOnce: true }));
      const allUsers = snap.val() || {};
      const existing = Object.values(allUsers).find(u => u.email === email);
      if (existing) {
        await signInWithEmailAndPassword(auth, email, existing.tempPassword);
        showNotif(`¡Bienvenido de nuevo, ${existing.name}!`);
        setAuthLoading(false); return;
      }
      const tempPassword = "Polla" + Math.random().toString(36).slice(2, 8) + "!";
      const cred = await createUserWithEmailAndPassword(auth, email, tempPassword);
      await updateProfile(cred.user, { displayName: name });
      const newUser = { id: cred.user.uid, name, email, role: "player", paidGroups: false, paidElim: false, active: false, tempPassword };
      await fbSet(dbRef(db, `tournaments/${activeTournamentId}/participants/${cred.user.uid}`), newUser);
      setCurrentUser(newUser);
      showNotif(`¡Bienvenido, ${name}! Espera confirmación de pago.`);
    } catch(e) {
      if (e.code === "auth/email-already-in-use") setLoginForm(f => ({ ...f, error: "Correo ya registrado. Toca 'Ya tengo cuenta'." }));
      else setLoginForm(f => ({ ...f, error: e.message }));
    }
    setAuthLoading(false);
  }

  async function handleLogin() {
    const email = loginForm.email.trim();
    if (!email) return setLoginForm(f => ({ ...f, error: "Ingresa tu correo" }));
    if (!activeTournamentId) return setLoginForm(f => ({ ...f, error: "No hay torneo activo" }));
    setAuthLoading(true);
    try {
      const snap = await new Promise(resolve => onValue(dbRef(db, `tournaments/${activeTournamentId}/participants`), s => resolve(s), { onlyOnce: true }));
      const userEntry = Object.values(snap.val() || {}).find(u => u.email === email);
      if (!userEntry) { setLoginForm(f => ({ ...f, error: "Correo no encontrado. ¿Ya te registraste?" })); setAuthLoading(false); return; }
      await signInWithEmailAndPassword(auth, email, userEntry.tempPassword);
      showNotif(`¡Bienvenido de nuevo, ${userEntry.name}!`);
    } catch(e) {
      setLoginForm(f => ({ ...f, error: "Error al entrar. Intenta registrarte de nuevo." }));
    }
    setAuthLoading(false);
  }

  async function handleAdminLogin() {
    const email = loginForm.adminEmail.trim(), password = loginForm.password;
    if (!email || !password) return setLoginForm(f => ({ ...f, error: "Completa los campos" }));
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showNotif("¡Bienvenido, Admin!");
    } catch(e) { setLoginForm(f => ({ ...f, error: "Credenciales incorrectas" })); }
    setAuthLoading(false);
  }
 async function guardarAvatar(avatarId) {
    if (!currentUser || !activeTournamentId) return;
    try {
      await update(dbRef(db, "tournaments/"+activeTournamentId+"/participants/"+currentUser.id), { avatar: avatarId });
      setCurrentUser(prev => ({ ...prev, avatar: avatarId }));
      setShowAvatarSelector(false);
      setShowProfileMenu(false);
      showNotif("Avatar actualizado");
    } catch(e) { showNotif("Error guardando avatar"); }
  }
  async function handleLogout() { await signOut(auth); setCurrentUser(null); setActiveTab("predictions"); }

  // ── Tournament management ──────────────────────────────────────────────────
  function createTournament() {
    if (!newTournament.name.trim()) return showNotif("Ingresa el nombre del torneo");
    const id = genId();
    const code = genCode();
    const typeInfo = TOURNAMENT_TYPES[newTournament.type] || TOURNAMENT_TYPES.custom;
    const tournament = {
      id, name: newTournament.name.trim(), type: newTournament.type,
      icon: typeInfo.icon, year: newTournament.year,
      isActive: Object.keys(tournaments).length === 0,
      createdAt: new Date().toISOString(),
    };
    fbSet(dbRef(db, `tournaments/${id}`), tournament);
    fbSet(dbRef(db, `tournaments/${id}/settings`), {
      quotaGroups: 50000, quotaElim: 50000, currency: "COP",
      groupCode: code, tournamentWinner: "",
      scoring: { winner: 2, exact: 3, penalty: 3, wrongPenalty: 1, champion: 10 },
      prizeFirst: 70, prizeSecond: 30
    });
    setNewTournament({ name: "", type: "champions", year: new Date().getFullYear() });
    setActiveTournamentId(id);
    showNotif(`✅ Torneo "${tournament.name}" creado`);
  }

  function setActiveTournament(id) {
    // Update isActive flag
    Object.keys(tournaments).forEach(tid => {
      update(dbRef(db, `tournaments/${tid}`), { isActive: tid === id });
    });
    setActiveTournamentId(id);
    showNotif("✅ Torneo activo actualizado");
  }

  function deleteTournament(id) {
    if (!window.confirm("¿Eliminar este torneo y todos sus datos?")) return;
    remove(dbRef(db, `tournaments/${id}`));
    if (activeTournamentId === id) {
      const remaining = Object.keys(tournaments).filter(t => t !== id);
      setActiveTournamentId(remaining[0] || null);
    }
    showNotif("Torneo eliminado");
  }

  // ── Predictions ────────────────────────────────────────────────────────────
  function savePrediction(matchId, pred) {
    if (!currentUser?.paidGroups && !currentUser?.paidElim && currentUser?.role !== "admin") return showNotif("⚠️ Pago pendiente");
    if (!activeTournamentId) return;
    fbSet(dbRef(db, `tournaments/${activeTournamentId}/predictions/${matchId}/${currentUser.id}`), { ...pred, userName: currentUser.name });
    showNotif("✅ Predicción guardada");
  }

  function saveChampPred(team) {
    if (!currentUser?.paidGroups && !currentUser?.paidElim && currentUser?.role !== "admin") return showNotif("⚠️ Pago pendiente");
    if (!activeTournamentId) return;
    fbSet(dbRef(db, `tournaments/${activeTournamentId}/champPredictions/${currentUser.id}`), { team, userName: currentUser.name });
    showNotif("🏆 Predicción de campeón guardada");
  }

  // ── Admin: Matches ─────────────────────────────────────────────────────────
  function tPath(sub) { return `tournaments/${activeTournamentId}/${sub}`; }

  function addMatch() {
    if (!newMatch.homeTeam || !newMatch.awayTeam || !newMatch.datetime) return showNotif("Completa todos los campos");
    const id = genId();
    // Convert local datetime to UTC ISO string
    const utcDatetime = new Date(newMatch.datetime).toISOString();
    fbSet(dbRef(db, `${tPath("matches")}/${id}`), { ...newMatch, datetime: utcDatetime, id, status: "upcoming", result: null });
    setNewMatch({ homeTeam: "", awayTeam: "", datetime: "", phase: "test" });
    showNotif("⚽ Partido agregado");
  }

  function loadWorldCupMatches() {
    const existing = Object.values(matches);
    let added = 0;
    WC2026_MATCHES.forEach(m => {
      if (!existing.find(e => e.id === m.id)) { fbSet(dbRef(db, `${tPath("matches")}/${m.id}`), m); added++; }
    });
    showNotif(`✅ ${added} partidos cargados`);
  }

  function deleteMatch(id) { remove(dbRef(db, `${tPath("matches")}/${id}`)); showNotif("Partido eliminado"); }
  function editMatch(id, changes) { update(dbRef(db, `${tPath("matches")}/${id}`), changes); showNotif("✅ Partido actualizado"); }
  function correctResult(matchId, res) { update(dbRef(db, `${tPath("matches")}/${matchId}`), { status: "finished", result: { ...res, status: "finished" } }); showNotif("✅ Resultado corregido"); }
  function setResult(matchId, res) { update(dbRef(db, `${tPath("matches")}/${matchId}`), { status: "finished", result: res }); showNotif("✅ Resultado ingresado"); }

  function toggleActive(p) { update(dbRef(db, `${tPath("participants")}/${p.id}`), { active: !p.active }); showNotif(p.active ? "⏸ Participante suspendido" : "▶️ Participante reactivado"); }

  function togglePaidGroups(p) {
    const newPaid = !p.paidGroups;
    update(dbRef(db, `${tPath("participants")}/${p.id}`), { paidGroups: newPaid, active: p.paidElim || newPaid });
    const pg = participants.filter(u => u.paidGroups && u.id !== p.id).length + (newPaid ? 1 : 0);
    const pe = participants.filter(u => u.paidElim).length;
    fbSet(dbRef(db, tPath("pools")), { groups: pg * (settings.quotaGroups || 50000), eliminations: pe * (settings.quotaElim || 50000) });
    showNotif(newPaid ? "✅ Pago Grupos confirmado" : "Pago Grupos revertido");
  }

  function togglePaidElim(p) {
    const newPaid = !p.paidElim;
    update(dbRef(db, `${tPath("participants")}/${p.id}`), { paidElim: newPaid, active: p.paidGroups || newPaid });
    const pg = participants.filter(u => u.paidGroups).length;
    const pe = participants.filter(u => u.paidElim && u.id !== p.id).length + (newPaid ? 1 : 0);
    fbSet(dbRef(db, tPath("pools")), { groups: pg * (settings.quotaGroups || 50000), eliminations: pe * (settings.quotaElim || 50000) });
    showNotif(newPaid ? "✅ Pago Eliminatorias confirmado" : "Pago Eliminatorias revertido");
  }

  function updateScoring(newScoring) {
    update(dbRef(db, tPath("settings")), { scoring: newScoring });
    showNotif("✅ Puntuación actualizada");
  }

  function clearTestMatches() {
    Object.values(matches).filter(m => m.phase === "test").forEach(m => {
      remove(dbRef(db, `${tPath("matches")}/${m.id}`));
      remove(dbRef(db, `${tPath("predictions")}/${m.id}`));
    });
    showNotif("🧹 Partidos de prueba eliminados");
  }

  function regenerateCode() {
    const code = genCode();
    update(dbRef(db, tPath("settings")), { groupCode: code });
    showNotif(`🔑 Nuevo código: ${code}`);
  }

  // ── Recalculate pools ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!participants.length || !activeTournamentId) return;
    const pg = participants.filter(u => u?.paidGroups).length;
    const pe = participants.filter(u => u?.paidElim).length;
    setPools({ groups: pg * (settings.quotaGroups || 50000), eliminations: pe * (settings.quotaElim || 50000) });
  }, [participants, settings.quotaGroups, settings.quotaElim, activeTournamentId]);

  // ── Standings with tiebreaker ──────────────────────────────────────────────
  const isAdmin = currentUser?.role === "admin";
  const activeTournament = tournaments[activeTournamentId];
  const scoring = settings.scoring || { winner: 2, exact: 3, penalty: 3, wrongPenalty: 1, champion: 10 };

  const standings = participants
    .filter(p => p.role !== "admin" && (p.active || p.paidGroups || p.paidElim))
    .map(p => ({ ...p, ...computeStats(p.id, matches, predictions, champPredictions, settings.tournamentWinner, scoring) }))
    .sort((a, b) =>
      b.total - a.total ||           // 1. Mayor puntaje
      b.exact - a.exact ||           // 2. Mayor exactos
      b.wins - a.wins ||             // 3. Mayor ganadores acertados
      a.noPred - b.noPred            // 4. Menor predicciones sin realizar
    );

  const isKnockoutPhase = (phase) => ["r16", "qf", "sf", "final"].includes(phase);
  const upcomingMatches = Object.values(matches).filter(m => m.status !== "finished" && (m.enabled || m.phase === "test" || isKnockoutPhase(m.phase) || isAdmin)).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const finishedMatches = Object.values(matches).filter(m => m.status === "finished" && (m.enabled || m.phase === "test" || isKnockoutPhase(m.phase) || isAdmin)).sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  const tournamentList = Object.values(tournaments).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading">
        <img src="/logo192.png" alt="Polla" style={{ width: 160, height: 160, borderRadius: "50%", border: "4px solid #FFD700", boxShadow: "0 0 40px rgba(255,215,0,0.4)", animation: "bounce 1.5s ease-in-out infinite" }} />
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#FFD700", letterSpacing: 3, marginTop: 12 }}>¡PÉGUELE A LA POLLA!</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Outfit, sans-serif", fontSize: 13, letterSpacing: 2, marginTop: 4 }}>CARGANDO TORNEO...</div>
        <div style={{ marginTop: 24, display: "flex", gap: 6 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#00C853", animation: `bounce ${0.4+i*0.15}s infinite alternate` }} />)}
        </div>
      </div>
    </>
  );

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!currentUser) return (
    <>
      <style>{css}</style>
      <div className={darkMode ? "" : "light"}>
        <div className="login-screen">
          <div className="login-chicken">🐔</div>
          <div className="login-logo">¡PÉGUELE<br />A LA POLLA!</div>
          {activeTournament && (
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: 20, padding: "4px 14px" }}>
              <span>{activeTournament.icon}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{activeTournament.name} {activeTournament.year}</span>
            </div>
          )}
          <div className="login-slogan">¡PÉGUELE A LA POLLA! — {activeTournament?.name?.toUpperCase() || "MUNDIAL 2026"}</div>
          <div className="login-card">
            <div className="login-tabs">
              <button className={`login-tab ${loginForm.mode === "register" ? "active" : ""}`} onClick={() => setLoginForm(f => ({ ...f, mode: "register" }))}>Registrarme</button>
              <button className={`login-tab ${loginForm.mode === "login" ? "active" : ""}`} onClick={() => setLoginForm(f => ({ ...f, mode: "login" }))}>Ya tengo cuenta</button>
            </div>
            {loginForm.mode === "register" && (
              <>
                <div className="input-group"><label className="input-label">Tu nombre</label><input className="input" placeholder="James Rodriguez" value={loginForm.name} onChange={e => setLoginForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="input-group"><label className="input-label">Tu correo</label><input className="input" type="email" placeholder="correo@ejemplo.com" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="input-group"><label className="input-label">Código del grupo</label><input className="input" placeholder="Pide el código a William" value={loginForm.code} onChange={e => setLoginForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} onKeyDown={e => e.key === "Enter" && handleRegister()} /></div>
                <button className="btn btn-primary btn-full" onClick={handleRegister} disabled={authLoading}>{authLoading ? "⏳ Registrando..." : "🚀 Unirme al grupo"}</button>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)", textAlign: "center" }}>Tu acceso se activa una vez confirmes el pago con William.</div>
              </>
            )}
            {loginForm.mode === "login" && (
              <>
                <div className="input-group"><label className="input-label">Tu correo</label><input className="input" type="email" placeholder="correo@ejemplo.com" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
                <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={authLoading}>{authLoading ? "⏳ Buscando..." : "🔑 Entrar"}</button>
              </>
            )}
            {loginForm.error && <div className="warning-box" style={{ marginTop: 10, marginBottom: 0 }}>{loginForm.error}</div>}
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 11, cursor: "pointer" }} onClick={() => setLoginForm(f => ({ ...f, mode: f.mode === "admin" ? "register" : "admin" }))}>
              {loginForm.mode === "admin" ? "← Volver" : "⚙"}
            </button>
          </div>
          {loginForm.mode === "admin" && (
            <div className="login-card" style={{ marginTop: 12, maxWidth: 360 }}>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, fontWeight: 600 }}>Acceso Administrador</div>
              <div className="input-group"><label className="input-label">Correo admin</label><input className="input" type="email" value={loginForm.adminEmail} onChange={e => setLoginForm(f => ({ ...f, adminEmail: e.target.value }))} /></div>
              <div className="input-group"><label className="input-label">Contraseña</label><input className="input" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleAdminLogin()} /></div>
              <button className="btn btn-gold btn-full" onClick={handleAdminLogin} disabled={authLoading}>{authLoading ? "⏳..." : "🔑 Entrar como Admin"}</button>
            </div>
          )}
        </div>
        {notif && <div className="notif">{notif.msg}</div>}
      </div>
    </>
  );

  // ── MAIN ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className={darkMode ? "" : "light"}>
        {notif && <div className="notif">{notif.msg}</div>}
        {showProfileMenu && <ProfileMenu user={currentUser} onLogout={handleLogout} onClose={() => setShowProfileMenu(false)} onChangeAvatar={() => { setShowAvatarSelector(true); setShowProfileMenu(false); }} />}
        {showAvatarSelector && currentUser?.role !== "admin" && (
          <SelectorAvatar avatarActual={currentUser?.avatar} onSeleccionar={guardarAvatar} onCerrar={() => setShowAvatarSelector(false)} />
        )}
        {selectedParticipant && (
          <StatsModal participant={selectedParticipant} stats={computeStats(selectedParticipant.id, matches, predictions, champPredictions, settings.tournamentWinner, scoring)} matches={matches} predictions={predictions} scoring={scoring} onClose={() => setSelectedParticipant(null)} />
        )}

        <div className="app">
          {/* HEADER */}
          <header className="header">
            <div>
              <div className="header-title">🐔 ¡Péguele a la Polla!</div>
              <div className="header-sub">{activeTournament ? `${activeTournament.icon} ${activeTournament.name.toUpperCase()} ${activeTournament.year}` : "MUNDIAL 2026"}</div>
            </div>
            <div className="header-right">
              <button className="dark-toggle" onClick={() => setDarkMode(d => !d)}>{darkMode ? "☀️" : "🌙"}</button>
              <div className="avatar" onClick={() => setShowProfileMenu(true)}>
                {currentUser.avatar ? <img src={getAvatarUrl(currentUser.avatar)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : currentUser.name[0].toUpperCase()}
              </div>
            </div>
          </header>

          {/* TOURNAMENT BAR — shown when multiple tournaments exist */}
          {tournamentList.length > 1 && (
            <div className="tournament-bar">
              {tournamentList.map(t => (
                <button key={t.id} className={`tournament-chip ${activeTournamentId === t.id ? "active" : ""}`} onClick={() => setActiveTournamentId(t.id)}>
                  <span className="t-icon">{t.icon}</span>
                  {t.name} {t.year}
                </button>
              ))}
            </div>
          )}

          {/* COUNTDOWN BANNER */}
          <CountdownBanner />

          <div className="content">

            {/* PREDICTIONS */}
            {activeTab === "predictions" && (
              <div>
                {!activeTournamentId && (
                  <div className="warning-box">⚠️ No hay torneos activos. El administrador debe crear uno primero.</div>
                )}
                {currentUser.role === "player" && !currentUser.paidGroups && !currentUser.paidElim && (
                  <div className="warning-box">⚠️ Tu pago está pendiente. Contacta a William para activar tu cuenta.</div>
                )}
                {currentUser.role === "player" && (
                  <ChampPrediction userId={currentUser.id} champPredictions={champPredictions} tournamentWinner={settings.tournamentWinner} onSave={saveChampPred} matches={matches} scoring={scoring} />
                )}
                <div className="tabs">
                  <button className={`tab ${predTab === "upcoming" ? "active" : ""}`} onClick={() => setPredTab("upcoming")}>Próximos ({upcomingMatches.length})</button>
                  <button className={`tab ${predTab === "finished" ? "active" : ""}`} onClick={() => setPredTab("finished")}>Terminados ({finishedMatches.length})</button>
                </div>
                {predTab === "upcoming" && (
                  upcomingMatches.length === 0
                    ? <div className="empty"><div className="empty-icon">⚽</div><div className="empty-text">No hay partidos próximos</div></div>
                    : upcomingMatches.map(m => <MatchCard key={m.id} match={m} myPred={predictions[m.id]?.[currentUser?.id]} allPreds={predictions[m.id] || {}} onSave={savePrediction} isAdmin={isAdmin} onSetResult={setResult} participants={participants} scoring={scoring} />)
                )}
                {predTab === "finished" && (
                  finishedMatches.length === 0
                    ? <div className="empty"><div className="empty-icon">🍃</div><div className="empty-text">Ningún partido finalizado aún</div></div>
                    : finishedMatches.map(m => <MatchCard key={m.id} match={m} myPred={predictions[m.id]?.[currentUser?.id]} allPreds={predictions[m.id] || {}} onSave={savePrediction} isAdmin={isAdmin} onSetResult={setResult} participants={participants} scoring={scoring} />)
                )}
              </div>
            )}

            {/* GROUPS */}
            {activeTab === "groups" && (
              <div>
                <div className="section-hero">
                  <div className="hero-title">📊 Fase de Grupos</div>
                  <div className="hero-sub">{activeTournament?.name} {activeTournament?.year} · Actualizado en tiempo real</div>
                </div>
                <div className="info-box" style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--green)" }}>●</span> Clasificado directo &nbsp;
                  <span style={{ color: "#4CAF50" }}>●</span> 2do clasificado &nbsp;
                  <span style={{ color: "var(--gold)" }}>●</span> Posible mejor 3ro
                </div>
                {["A","B","C","D","E","F","G","H","I","J","K","L"].map(g => <GroupCard key={g} groupLetter={g} matches={matches} />)}
              </div>
            )}

            {/* STANDINGS */}
            {activeTab === "standings" && (
              <div>
                <div className="section-hero">
                  <div className="hero-title">🏆 Escalafón</div>
                  <div className="hero-sub">{activeTournament?.icon} {activeTournament?.name} {activeTournament?.year} · Toca un nombre para ver estadísticas</div>
                </div>
                <div className="pool-grid">
                  {activeTournament?.type === "worldcup" ? (
                    <>
                      <div className="pool-card"><div className="pool-label">💰 POZO GRUPOS</div><div className="pool-amount">{"$" + pools.groups.toLocaleString()}</div><div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{settings.currency} · {settings.prizeFirst || 70}/{settings.prizeSecond || 30}</div></div>
                      <div className="pool-card"><div className="pool-label">🏆 POZO ELIM.</div><div className="pool-amount">{"$" + pools.eliminations.toLocaleString()}</div><div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{settings.currency} · {settings.prizeFirst || 70}/{settings.prizeSecond || 30}</div></div>
                    </>
                  ) : (
                    <div className="pool-card" style={{ gridColumn: "1 / -1" }}>
                      <div className="pool-label">💰 POZO {activeTournament?.name?.toUpperCase()}</div>
                      <div className="pool-amount">{"$" + (pools.groups + pools.eliminations).toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{settings.currency} · {settings.prizeFirst || 70}/{settings.prizeSecond ?? (100 - (settings.prizeFirst || 70))}</div>
                    </div>
                  )}
                </div>
                <div className="tabs">
                  <button className={`tab ${standTab === "total" ? "active" : ""}`} onClick={() => setStandTab("total")}>Total</button>
                  <button className={`tab ${standTab === "groups" ? "active" : ""}`} onClick={() => setStandTab("groups")}>Grupos</button>
                  <button className={`tab ${standTab === "elim" ? "active" : ""}`} onClick={() => setStandTab("elim")}>Eliminatorias</button>
                </div>
                {standings.length === 0
                  ? <div className="empty"><div className="empty-icon">👥</div><div className="empty-text">Sin participantes activos aún</div></div>
                  : standings.map((p, i) => {
                    const pts = standTab === "groups" ? p.groupsPts : standTab === "elim" ? p.elimPts : p.total;
                    return (
                      <div key={p.id} className={`standings-row ${i === 0 ? "top1" : i === 1 ? "top2" : ""}`} onClick={() => setSelectedParticipant(p)}>
                        <span className={`rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>{i + 1}</span>
                      <div className="avatar" style={{ width: 48, height: 48, fontSize: 16, flexShrink: 0 }}>
                        {p.avatar ? <img src={getAvatarUrl(p.avatar)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : p.name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="standing-name" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {p.name}
                            {!p.paidGroups && !p.paidElim && <span className="unpaid-badge">Sin pago</span>}
                          </div>
                          <div className="standing-stats">🎯 {p.exact} exactos · ✅ {p.pct}% · 🔥 {p.streak} racha</div>
                        </div>
                        <div className="standing-pts">{pts}</div>
                      </div>
                    );
                  })}
                <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
                <RulesBox scoring={scoring} tournamentName={activeTournament?.name} />
              </div>
            )}

            {/* PAYMENTS (ADMIN) */}
            {activeTab === "payments" && isAdmin && (
              <div>
                <div className="section-hero">
                  <div className="hero-title">💰 Pagos</div>
                  <div className="hero-sub">{activeTournament?.icon} {activeTournament?.name}</div>
                </div>
                <div className="card">
                  <div className="card-title">⚙️ Configuración</div>
                  <div className="input-row">
                    <div className="input-group" style={{ flex: 1 }}><label className="input-label">Cuota Grupos</label><input className="input" type="number" defaultValue={settings.quotaGroups || 50000} onBlur={e => { const v = parseInt(e.target.value); if(!isNaN(v)) update(dbRef(db, tPath("settings")), { quotaGroups: v }); }} /></div>
                    <div className="input-group" style={{ flex: 1 }}><label className="input-label">Cuota Eliminatorias</label><input className="input" type="number" defaultValue={settings.quotaElim || 50000} onBlur={e => { const v = parseInt(e.target.value); if(!isNaN(v)) update(dbRef(db, tPath("settings")), { quotaElim: v }); }} /></div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Moneda</label>
                    <select className="input" value={settings.currency} onChange={e => update(dbRef(db, tPath("settings")), { currency: e.target.value })}>
                      <option>COP</option><option>CAD</option><option>USD</option>
                    </select>
                  </div>
                </div>
                <div className="pool-grid">
                  {activeTournament?.type === "worldcup" ? (
                    <>
                      <div className="pool-card"><div className="pool-label">💰 POZO GRUPOS</div><div className="pool-amount">{"$" + pools.groups.toLocaleString()}</div></div>
                      <div className="pool-card"><div className="pool-label">🏆 POZO ELIM.</div><div className="pool-amount">{"$" + pools.eliminations.toLocaleString()}</div></div>
                    </>
                  ) : (
                    <div className="pool-card" style={{ gridColumn: "1 / -1" }}>
                      <div className="pool-label">💰 POZO {activeTournament?.name?.toUpperCase()}</div>
                      <div className="pool-amount">{"$" + (pools.groups + pools.eliminations).toLocaleString()}</div>
                    </div>
                  )}
                </div>
                <div className="card">
                  <div className="card-title">🏆 Distribución del premio</div>
                  <div className="input-row">
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">% 1er lugar</label>
                      <input className="input" type="number" min="0" max="100" defaultValue={settings.prizeFirst || 70} onBlur={e => { const v = parseInt(e.target.value); if(!isNaN(v)) update(dbRef(db, tPath("settings")), { prizeFirst: v, prizeSecond: 100 - v }); }} />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">% 2do lugar</label>
                      <input className="input" type="number" value={settings.prizeSecond ?? (100 - (settings.prizeFirst || 70))} readOnly style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>El % del 2do lugar se calcula automáticamente.</div>
                </div>
                <div className="card">
                  <div className="card-title">🔑 Código del grupo</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div className="code-display">{settings.groupCode}</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard?.writeText(settings.groupCode); showNotif("📋 Código copiado"); }}>📋</button>
                    <button className="btn btn-gold btn-sm" onClick={regenerateCode}>🔄 Nuevo</button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">👥 Participantes ({participants.filter(p => p.role !== "admin").length})</div>
                  {participants.filter(p => p.role !== "admin").map(p => (
                    <div key={p.id} style={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{p.name[0].toUpperCase()}</div>
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 10, color: "var(--text3)" }}>{p.active ? "Activo" : "Suspendido"}</div></div>
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(p)}>{p.active ? "⏸" : "▶️"}</button>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[{ key: "paidGroups", label: "⚽ Pozo Grupos", fn: togglePaidGroups }, { key: "paidElim", label: "🏆 Pozo Elim.", fn: togglePaidElim }].map(({ key, label, fn }) => (
                          <div key={key} style={{ flex: 1, background: "var(--bg2)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 6 }}>{label}</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 11, color: p[key] ? "var(--green)" : "var(--red)" }}>{p[key] ? "✅ Pagó" : "⏳ Pendiente"}</span>
                              <button className={"btn btn-sm " + (p[key] ? "btn-danger" : "btn-primary")} style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => fn(p)}>{p[key] ? "Revertir" : "Confirmar"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN */}
            {activeTab === "admin" && isAdmin && (
              <div>
                <div className="section-hero">
                  <div className="hero-title">⚙️ Panel Admin</div>
                  <div className="hero-sub">{activeTournament?.icon} {activeTournament?.name} {activeTournament?.year}</div>
                </div>
                <div className="tabs">
                  <button className={`tab ${adminTab === "tournaments" ? "active" : ""}`} onClick={() => setAdminTab("tournaments")}>🏆 Torneos</button>
                  <button className={`tab ${adminTab === "matches" ? "active" : ""}`} onClick={() => setAdminTab("matches")}>Partidos</button>
                  <button className={`tab ${adminTab === "scoring" ? "active" : ""}`} onClick={() => setAdminTab("scoring")}>Puntos</button>
                  <button className={`tab ${adminTab === "champ" ? "active" : ""}`} onClick={() => setAdminTab("champ")}>Campeón</button>
                </div>

                {/* TOURNAMENTS TAB */}
                {adminTab === "tournaments" && (
                  <div>
                    <div className="card">
                      <div className="card-title">➕ Nuevo torneo</div>
                      <div className="input-group">
                        <label className="input-label">Nombre</label>
                        <input className="input" placeholder="Ej: Champions League 2025/26" value={newTournament.name} onChange={e => setNewTournament(t => ({ ...t, name: e.target.value }))} />
                      </div>
                      <div className="input-row">
                        <div className="input-group" style={{ flex: 2 }}>
                          <label className="input-label">Tipo</label>
                          <select className="input" value={newTournament.type} onChange={e => setNewTournament(t => ({ ...t, type: e.target.value }))}>
                            {Object.entries(TOURNAMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                          </select>
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">Año</label>
                          <input className="input" type="number" value={newTournament.year} onChange={e => setNewTournament(t => ({ ...t, year: parseInt(e.target.value) }))} />
                        </div>
                      </div>
                      <button className="btn btn-primary btn-full" onClick={createTournament}>🏆 Crear torneo</button>
                    </div>

                    <div className="admin-section-title">Torneos creados</div>
                    {tournamentList.length === 0
                      ? <div className="empty"><div className="empty-icon">🏆</div><div className="empty-text">No hay torneos aún. ¡Crea el primero!</div></div>
                      : tournamentList.map(t => (
                        <div key={t.id} className={`tournament-card ${t.isActive ? "active-tournament" : ""}`}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 24 }}>{t.icon}</span>
                              <div>
                                <div className="tournament-name">{t.name}</div>
                                <div className="tournament-meta">{TOURNAMENT_TYPES[t.type]?.label || t.type} · {t.year}</div>
                              </div>
                            </div>
                            {t.isActive && <span className="active-pill">● ACTIVO</span>}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {!t.isActive && <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setActiveTournament(t.id)}>✅ Activar</button>}
                            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setActiveTournamentId(t.id); setAdminTab("matches"); }}>⚽ Ver partidos</button>
                            {<button className="btn btn-danger btn-sm" onClick={() => deleteTournament(t.id)}>🗑</button>}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* MATCHES TAB */}
                {adminTab === "matches" && (
                  <div>
                    <div className="card">
                      <div className="card-title">➕ Nuevo partido</div>
                      <div className="input-row">
                        <div className="input-group" style={{ flex: 1 }}><label className="input-label">Local</label><input className="input" placeholder="Equipo local" value={newMatch.homeTeam} onChange={e => setNewMatch(m => ({ ...m, homeTeam: e.target.value }))} /></div>
                        <div className="input-group" style={{ flex: 1 }}><label className="input-label">Visitante</label><input className="input" placeholder="Visitante" value={newMatch.awayTeam} onChange={e => setNewMatch(m => ({ ...m, awayTeam: e.target.value }))} /></div>
                      </div>
                      <div className="input-row">
                        <div className="input-group" style={{ flex: 1 }}><label className="input-label">Fecha y hora</label><input className="input" type="datetime-local" value={newMatch.datetime} onChange={e => setNewMatch(m => ({ ...m, datetime: e.target.value }))} /></div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">Fase</label>
                          <select className="input" value={newMatch.phase} onChange={e => setNewMatch(m => ({ ...m, phase: e.target.value }))}>
                            <option value="test">🧪 Prueba</option><option value="groups">Fase Grupos</option><option value="r16">Octavos</option><option value="qf">Cuartos</option><option value="sf">Semifinal</option><option value="final">Final</option>
                          </select>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-full" onClick={addMatch}>⚽ Agregar partido</button>
                    </div>
                    {activeTournament?.type === "worldcup" && (
                      <button className="btn btn-gold btn-full" style={{ marginBottom: 12 }} onClick={loadWorldCupMatches}>🌍 Cargar partidos Mundial 2026</button>
                    )}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => { if(window.confirm("¿Eliminar partidos de prueba?")) clearTestMatches(); }}>🧹 Limpiar prueba</button>
                    </div>
                    <div className="admin-section-title">Partidos programados</div>
                    {Object.values(matches).length === 0
                      ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No hay partidos aún</div></div>
                      : Object.values(matches).sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map(m => (
                        <div key={m.id} className="match-card">
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{m.homeTeam} vs {m.awayTeam}</div>
                              <div style={{ fontSize: 11, color: "var(--text3)" }}>{fmtDate(m.datetime)} · {getPhaseLabel(m.phase)}</div>
                              <div style={{ fontSize: 11, marginTop: 2 }}>
                                {m.status === "finished"
                                  ? <span style={{ color: "var(--green)" }}>✅ {m.result.home}-{m.result.away}</span>
                                  : <span style={{ color: "var(--text3)" }}>⏳ Pendiente</span>}
                              </div>
                            </div>
                            {m.status !== "finished" && <button className="btn btn-danger btn-sm" onClick={() => deleteMatch(m.id)}>🗑</button>}
                          </div>
                          <EditMatch match={m} onEdit={editMatch} onCorrectResult={correctResult} />
                        </div>
                      ))}
                  </div>
                )}

                {/* SCORING TAB */}
                {adminTab === "scoring" && (
                  <div>
                    <div className="card">
                      <div className="card-title">🎯 Configuración de puntos</div>
                      <div className="info-box" style={{ fontSize: 12 }}>Los cambios se aplican a todos los participantes de este torneo.</div>
                      <ScoringConfig scoring={scoring} onChange={updateScoring} />
                    </div>
                    <RulesBox scoring={scoring} tournamentName={activeTournament?.name} />
                  </div>
                )}

                {/* CHAMPION TAB */}
                {adminTab === "champ" && (
                  <div>
                    <div className="card">
                      <div className="card-title">🏆 La Polla del Campeón</div>
                      <div className="input-group">
                        <label className="input-label">Equipo campeón (ingresar al finalizar)</label>
                        <input className="input" placeholder="Ej: Colombia 🇨🇴" value={settings.tournamentWinner || ""} onChange={e => update(dbRef(db, tPath("settings")), { tournamentWinner: e.target.value })} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>Al ingresar el campeón se calculan automáticamente los +{scoring.champion} pts.</div>
                    </div>
                    <div className="card">
                      <div className="card-title">👥 Predicciones de campeón</div>
                      {Object.entries(champPredictions).length === 0
                        ? <div style={{ color: "var(--text3)", fontSize: 13 }}>Nadie ha predicho aún</div>
                        : Object.entries(champPredictions).map(([uid, cp]) => (
                          <div key={uid} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                            <span>{cp.userName}</span>
                            <span style={{ color: settings.tournamentWinner && cp.team === settings.tournamentWinner ? "var(--gold)" : "var(--text2)" }}>
                              {settings.tournamentWinner ? cp.team : "🔒 Oculta"}
                              {settings.tournamentWinner && cp.team === settings.tournamentWinner && " 🏆"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* NAV */}
          <nav className="nav">
            <button className={`nav-btn ${activeTab === "predictions" ? "active" : ""}`} onClick={() => setActiveTab("predictions")}><span className="icon">⚽</span>Partidos</button>
            <button className={`nav-btn ${activeTab === "groups" ? "active" : ""}`} onClick={() => setActiveTab("groups")}><span className="icon">📊</span>Grupos</button>
            <button className={`nav-btn ${activeTab === "standings" ? "active" : ""}`} onClick={() => setActiveTab("standings")}><span className="icon">🏆</span>Escalafón</button>
            {isAdmin && <button className={`nav-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}><span className="icon">💰</span>Pagos</button>}
            {isAdmin && <button className={`nav-btn ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}><span className="icon">⚙️</span>Admin</button>}
          </nav>
        </div>
      </div>
    </>
  );
}