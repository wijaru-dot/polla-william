import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";


// ── UTILS ─────────────────────────────────────────────────────────────────────
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

// ── SCORING ───────────────────────────────────────────────────────────────────
function calcPoints(pred, result) {
  if (!pred || !result || result.status !== "finished") return null;
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
        pts += 2;
        if (pHome === rHome && pAway === rAway) pts += 3;
        if (pred.pensHome !== undefined && pred.pensAway !== undefined) {
          if (parseInt(pred.pensHome) === parseInt(result.pensHome) && parseInt(pred.pensAway) === parseInt(result.pensAway)) pts += 3;
        }
      } else {
        if (predWinner === realPensWinner) pts += 1;
      }
    } else {
      const realET_Home = parseInt(result.etHome ?? result.home);
      const realET_Away = parseInt(result.etAway ?? result.away);
      const realETWinner = realET_Home > realET_Away ? "home" : "away";
      if (predWinner === "draw") pts += 2;
      if (predWinner !== "draw" && predWinner === realETWinner) pts += 2;
      if (pHome === realET_Home && pAway === realET_Away) pts += 3;
    }
  } else {
    if (predWinner === realWinner) pts += 2;
    if (pHome === rHome && pAway === rAway) pts += 3;
  }
  return pts;
}

function calcChampPoints(pred, winner) {
  if (!pred || !winner) return 0;
  return pred === winner ? 10 : 0;
}

function computeStats(participantId, matches, predictions, champPredictions, tournamentWinner) {
  let total = 0, exact = 0, wins = 0, maxStreak = 0, tempStreak = 0;
  let groupsPts = 0, elimPts = 0, played = 0;
  const finishedMatches = Object.values(matches || {}).filter(m => m.status === "finished").sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  finishedMatches.forEach(m => {
    const pred = predictions?.[m.id]?.[participantId];
    const pts = calcPoints(pred, m.result) ?? 0;
    if (pred) played++;
    total += pts;
    if (pts >= 5) exact++;
    if (pts >= 2) { wins++; tempStreak++; maxStreak = Math.max(maxStreak, tempStreak); }
    else tempStreak = 0;
    if (m.phase === "groups" || m.phase === "test") groupsPts += pts;
    else elimPts += pts;
  });

  const champPts = calcChampPoints(champPredictions?.[participantId]?.team, tournamentWinner);
  total += champPts;
  const pct = played > 0 ? Math.round((wins / played) * 100) : 0;

  return { total, exact, wins, groupsPts, elimPts, champPts, streak: maxStreak, pct, played };
}

// ── CSS ───────────────────────────────────────────────────────────────────────
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

  /* AVATAR */
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gold); color: var(--green-deep); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); overflow: hidden; flex-shrink: 0; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-lg { width: 56px; height: 56px; border-radius: 50%; background: var(--gold); color: var(--green-deep); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; border: 3px solid var(--green); overflow: hidden; flex-shrink: 0; cursor: pointer; position: relative; }
  .avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 18px; opacity: 0; transition: opacity 0.2s; border-radius: 50%; }
  .avatar-lg:hover .avatar-overlay { opacity: 1; }

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
  .team-name { font-weight: 600; font-size: 14px; flex: 1; }
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
  .reveal-name { font-size: 11px; color: var(--text3); margin-bottom: 3px; display: flex; align-items: center; gap: 4px; }
  .reveal-score { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: var(--text); display: flex; align-items: center; justify-content: space-between; }

  /* STANDINGS */
  .standings-row { display: flex; align-items: center; gap: 10px; padding: 12px 12px; border-radius: 10px; margin-bottom: 6px; background: var(--card2); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
  .standings-row:hover { border-color: var(--green-dark); }
  .standings-row.top1 { background: linear-gradient(90deg, rgba(255,215,0,0.1), transparent); border-color: rgba(255,215,0,0.3); }
  .standings-row.top2 { background: linear-gradient(90deg, rgba(192,192,192,0.08), transparent); border-color: rgba(192,192,192,0.2); }
  .rank { font-family: 'Bebas Neue', sans-serif; font-size: 22px; width: 26px; color: var(--text3); text-align: center; }
  .rank.gold { color: var(--gold); }
  .rank.silver { color: #C0C0C0; }
  .rank.bronze { color: #CD7F32; }
  .standing-name { font-weight: 600; font-size: 14px; }
  .standing-stats { font-size: 10px; color: var(--text3); margin-top: 2px; }
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
  .paid-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .paid-yes { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .paid-no { background: var(--red); }

  /* POOL */
  .pool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .pool-card { background: var(--card2); border: 1px solid var(--border); border-radius: 10px; padding: 12px; text-align: center; }
  .pool-label { font-size: 10px; color: var(--text3); margin-bottom: 4px; letter-spacing: 0.5px; }
  .pool-amount { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--gold); }

  /* CHAMPION */
  .champ-card { background: linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,200,83,0.04)); border: 1px solid rgba(255,215,0,0.25); border-radius: var(--radius); padding: 14px; margin-bottom: 12px; }

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
  .loading-icon { font-size: 52px; animation: spin 2s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

// ── STEPPER ───────────────────────────────────────────────────────────────────
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

// ── STATS MODAL ───────────────────────────────────────────────────────────────
function StatsModal({ participant, stats, onClose, matches, predictions }) {
  const matchHistory = Object.values(matches || {})
    .filter(m => m.status === "finished")
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, 10);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="avatar-lg" style={{ cursor: "default" }}>
            {participant.photoURL ? <img src={participant.photoURL} alt="" /> : participant.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{participant.name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>Estadísticas del torneo</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }} onClick={onClose}>✕</button>
        </div>

        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-val">{stats.total}</div>
            <div className="stat-lbl">PUNTOS</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.exact}</div>
            <div className="stat-lbl">EXACTOS</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.pct}%</div>
            <div className="stat-lbl">ACIERTOS</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.streak}</div>
            <div className="stat-lbl">MEJOR RACHA</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.groupsPts}</div>
            <div className="stat-lbl">PTS GRUPOS</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{stats.elimPts}</div>
            <div className="stat-lbl">PTS ELIM.</div>
          </div>
        </div>

        {stats.champPts > 0 && (
          <div className="info-box">🏆 +{stats.champPts} puntos por acertar el campeón</div>
        )}

        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 8, letterSpacing: 0.5 }}>ÚLTIMOS PARTIDOS</div>
        {matchHistory.map(m => {
          const pred = predictions?.[m.id]?.[participant.id];
          const pts = calcPoints(pred, m.result);
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 500 }}>{m.homeTeam} vs {m.awayTeam}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>
                  Real: {m.result.home}-{m.result.away} · Mi pred: {pred ? `${pred.home}-${pred.away}` : "Sin pred."}
                </div>
              </div>
              {pts !== null && (
                <span className={`pts-badge ${pts >= 4 ? "good" : pts > 0 ? "ok" : "zero"}`}>{pts}p</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MATCH CARD ────────────────────────────────────────────────────────────────
function MatchCard({ match, myPred, onSave, isAdmin, onSetResult, allPreds, participants }) {
  const [pred, setPred] = useState(myPred || { home: 0, away: 0 });
  const [expanded, setExpanded] = useState(false);
  const locked = isPastDeadline(match);
  const finished = match.status === "finished";
  const isKnockout = match.phase !== "groups" && match.phase !== "test";
  const predDraw = parseInt(pred.home) === parseInt(pred.away);

  useEffect(() => { setPred(myPred || { home: 0, away: 0 }); }, [myPred]);

  const myPts = finished ? calcPoints(myPred, match.result) : null;
  const phaseClass = match.phase === "test" ? "phase-test" : match.phase === "groups" ? "phase-groups" : "phase-knockout";

  return (
    <div className="match-card">
      <div className="match-meta">
        <span>{fmtDate(match.datetime)}</span>
        <span className={`phase-badge ${phaseClass}`}>{getPhaseLabel(match.phase)}</span>
      </div>
      <div className="match-teams">
        <span className="team-name">{match.homeTeam}</span>
        <span className="vs">VS</span>
        <span className="team-name away">{match.awayTeam}</span>
      </div>

      {!finished && (
        <div>
          <div className="score-input-row">
            <Stepper value={pred.home} onChange={v => setPred(p => ({ ...p, home: v }))} disabled={locked} />
            <span className="score-dash">:</span>
            <Stepper value={pred.away} onChange={v => setPred(p => ({ ...p, away: v }))} disabled={locked} />
          </div>
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
            <button className="btn btn-primary btn-full btn-sm" style={{ marginTop: 10 }} onClick={() => onSave(match.id, pred)}>
              💾 Guardar predicción
            </button>
          )}
          {locked && !myPred && <div className="warning-box" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>⏰ Sin predicción — 0 puntos</div>}
          {locked && myPred && <div className="info-box" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>🔒 Predicción guardada</div>}
          {isAdmin && locked && <AdminSetResult match={match} onSetResult={onSetResult} />}
        </div>
      )}

      {finished && (
        <div>
          <div className="result-row">
            <div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 2 }}>Resultado oficial</div>
              <div className="result-score">{match.result.home} — {match.result.away}</div>
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
                const pts = calcPoints(p, match.result);
                const participant = participants?.find(x => x.id === uid);
                return (
                  <div key={uid} className="reveal-item">
                    <div className="reveal-name">
                      {participant?.photoURL && <img src={participant.photoURL} alt="" style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} />}
                      {p.userName}
                    </div>
                    <div className="reveal-score">
                      <span>{p.home}-{p.away}</span>
                      <span className={`pts-badge ${pts >= 4 ? "good" : pts > 0 ? "ok" : "zero"}`} style={{ fontSize: 10, padding: "1px 6px" }}>{pts}p</span>
                    </div>
                    {p.pensHome !== undefined && p.pensHome !== "" && (
                      <div style={{ fontSize: 10, color: "var(--text3)" }}>Pen: {p.pensHome}-{p.pensAway}</div>
                    )}
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

function AdminSetResult({ match, onSetResult }) {
  const [res, setRes] = useState({ home: 0, away: 0, penalties: false, pensHome: 0, pensAway: 0 });
  const [open, setOpen] = useState(false);
  const isKnockout = match.phase !== "groups" && match.phase !== "test";

  if (!open) return (
    <button className="btn btn-gold btn-sm btn-full" style={{ marginTop: 8 }} onClick={() => setOpen(true)}>⚽ Ingresar resultado</button>
  );
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

// ── CHAMPION COMPONENT ────────────────────────────────────────────────────────
function ChampPrediction({ userId, userName, champPredictions, tournamentWinner, onSave, matches }) {
  const [team, setTeam] = useState(champPredictions?.[userId]?.team || "");
  const [editing, setEditing] = useState(false);
  const myPred = champPredictions?.[userId];
  const hasStarted = Object.values(matches || {}).some(m => m.phase !== "test" && isPastDeadline(m));

  return (
    <div className="champ-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)" }}>🏆 La Polla del Campeón</div>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>+10 pts</span>
      </div>
      {myPred && !editing ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Tu predicción</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{hasStarted ? myPred.team : "🔒 Guardada"}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {!hasStarted && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️</button>}
            {tournamentWinner && myPred.team === tournamentWinner && <span className="pts-badge good">🏆 +10 pts</span>}
          </div>
        </div>
      ) : (
        <div>
          <input className="input" placeholder="¿Quién ganará el Mundial?" value={team} onChange={e => setTeam(e.target.value)} style={{ marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => { onSave(team); setEditing(false); }} disabled={!team.trim()}>🏆 Guardar</button>
            {editing && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancelar</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ mode: "join", name: "", code: "", password: "" });
  const [activeTab, setActiveTab] = useState("predictions");
  const [predTab, setPredTab] = useState("upcoming");
  const [adminTab, setAdminTab] = useState("matches");
  const [standTab, setStandTab] = useState("total");
  const [notif, setNotif] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [newMatch, setNewMatch] = useState({ homeTeam: "", awayTeam: "", datetime: "", phase: "test" });
  const fileInputRef = useRef();

  // Firebase data
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState({});
  const [predictions, setPredictions] = useState({});
  const [champPredictions, setChampPredictions] = useState({});
  const [settings, setSettings] = useState({ quota: 50000, currency: "COP", groupCode: genCode(), adminPassword: "admin123", tournamentWinner: "" });
  const [pools, setPools] = useState({ groups: 0, eliminations: 0 });

  const showNotif = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  }, []);

  // ── FIREBASE LISTENERS ────────────────────────────────────────────────────
  useEffect(() => {
    const unsubs = [];
    unsubs.push(onValue(ref(db, "participants"), snap => {
      const data = snap.val() || {};
      setParticipants(Object.values(data));
      setLoading(false);
    }));
    unsubs.push(onValue(ref(db, "matches"), snap => setMatches(snap.val() || {})));
    unsubs.push(onValue(ref(db, "predictions"), snap => setPredictions(snap.val() || {})));
    unsubs.push(onValue(ref(db, "champPredictions"), snap => setChampPredictions(snap.val() || {})));
    unsubs.push(onValue(ref(db, "settings"), snap => {
      const s = snap.val();
      if (s) setSettings(s);
      else {
        // First run — initialize settings
        set(ref(db, "settings"), { quota: 50000, currency: "COP", groupCode: genCode(), adminPassword: "admin123", tournamentWinner: "" });
      }
    }));
    unsubs.push(onValue(ref(db, "pools"), snap => { if (snap.val()) setPools(snap.val()); }));

    // Init admin if not exists
    onValue(ref(db, "participants/admin"), snap => {
      if (!snap.val()) {
        set(ref(db, "participants/admin"), { id: "admin", name: "Admin", role: "admin", paid: true, active: true });
      }
    }, { onlyOnce: true });

    return () => unsubs.forEach(u => u());
  }, []);

  // Restore session and sync with Firebase
  useEffect(() => {
    const saved = localStorage.getItem("polla_user");
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        setCurrentUser(savedUser);
        // Sync with latest Firebase data
        onValue(ref(db, `participants/${savedUser.id}`), snap => {
          const fresh = snap.val();
          if (fresh) {
            setCurrentUser(fresh);
            localStorage.setItem("polla_user", JSON.stringify(fresh));
          }
        }, { onlyOnce: true });
      } catch {}
    }
  }, []);

  // ── AUTH ──────────────────────────────────────────────────────────────────
  function handleLogin() {
    const name = loginForm.name.trim();
    if (!name) return showNotif("Ingresa tu nombre", "error");

    if (loginForm.mode === "admin") {
      if (loginForm.password !== settings.adminPassword) return showNotif("Contraseña incorrecta", "error");
      const adminUser = { id: "admin", name: "Admin", role: "admin", paid: true, active: true };
      setCurrentUser(adminUser);
      localStorage.setItem("polla_user", JSON.stringify(adminUser));
      showNotif("¡Bienvenido, Admin!");
      return;
    }

    if (loginForm.code !== settings.groupCode) return showNotif("Código incorrecto", "error");
    const existing = participants.find(p => p.name.toLowerCase() === name.toLowerCase() && p.role !== "admin");
    if (existing) {
      setCurrentUser(existing);
      localStorage.setItem("polla_user", JSON.stringify(existing));
      showNotif(`¡Bienvenido de nuevo, ${existing.name}!`);
      return;
    }
    const newUser = { id: genId(), name, role: "player", paid: false, active: false };
    set(ref(db, `participants/${newUser.id}`), newUser);
    setCurrentUser(newUser);
    localStorage.setItem("polla_user", JSON.stringify(newUser));
    showNotif(`¡Bienvenido, ${name}! Espera confirmación de pago.`);
  }

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("polla_user");
    setActiveTab("predictions");
  }

  // ── PHOTO UPLOAD ──────────────────────────────────────────────────────────
  async function handlePhotoUpload(file) { showNotif("Fotos próximamente disponibles"); }

  
  // ── PREDICTIONS ───────────────────────────────────────────────────────────
  function savePrediction(matchId, pred) {
    if (!currentUser?.active && currentUser?.role !== "admin") return showNotif("⚠️ Pago pendiente", "error");
    set(ref(db, `predictions/${matchId}/${currentUser.id}`), { ...pred, userName: currentUser.name });
    showNotif("✅ Predicción guardada");
  }

  function saveChampPred(team) {
    if (!currentUser?.active && currentUser?.role !== "admin") return showNotif("⚠️ Pago pendiente", "error");
    set(ref(db, `champPredictions/${currentUser.id}`), { team, userName: currentUser.name });
    showNotif("🏆 Predicción de campeón guardada");
  }

  // ── ADMIN: MATCHES ────────────────────────────────────────────────────────
  function addMatch() {
    if (!newMatch.homeTeam || !newMatch.awayTeam || !newMatch.datetime) return showNotif("Completa todos los campos", "error");
    const id = genId();
    set(ref(db, `matches/${id}`), { ...newMatch, id, status: "upcoming", result: null });
    setNewMatch({ homeTeam: "", awayTeam: "", datetime: "", phase: "test" });
    showNotif("⚽ Partido agregado");
  }

  function deleteMatch(id) {
    remove(ref(db, `matches/${id}`));
    showNotif("Partido eliminado");
  }

  function setResult(matchId, res) {
    update(ref(db, `matches/${matchId}`), { status: "finished", result: res });
    showNotif("✅ Resultado ingresado");
  }

  // ── ADMIN: PARTICIPANTS ───────────────────────────────────────────────────
  function togglePaid(p) {
    const newPaid = !p.paid;
    update(ref(db, `participants/${p.id}`), { paid: newPaid, active: newPaid });
    // Recalc pools
    const paidCount = participants.filter(u => u.paid && u.id !== p.id).length + (newPaid ? 1 : 0);
    const total = paidCount * settings.quota;
    const newPools = { groups: Math.round(total * 0.4), eliminations: Math.round(total * 0.6) };
    set(ref(db, "pools"), newPools);
    showNotif(newPaid ? "✅ Pago confirmado" : "Pago revertido");
  }

  function toggleActive(p) {
    update(ref(db, `participants/${p.id}`), { active: !p.active });
    showNotif(p.active ? "⏸ Participante suspendido" : "▶️ Participante reactivado");
  }

  function clearTestParticipants() {
    participants.filter(p => p.role !== "admin").forEach(p => {
      remove(ref(db, `participants/${p.id}`));
    });
    showNotif("🧹 Participantes de prueba eliminados");
  }

  function clearTestMatches() {
    Object.values(matches).filter(m => m.phase === "test").forEach(m => {
      remove(ref(db, `matches/${m.id}`));
      remove(ref(db, `predictions/${m.id}`));
    });
    showNotif("🧹 Partidos de prueba eliminados");
  }

  function regenerateCode() {
    const code = genCode();
    update(ref(db, "settings"), { groupCode: code });
    showNotif(`🔑 Nuevo código: ${code}`);
  }

  // ── STANDINGS ─────────────────────────────────────────────────────────────
  const standings = participants
    .filter(p => p.role !== "admin" && (p.active || p.paid))
    .map(p => ({ ...p, ...computeStats(p.id, matches, predictions, champPredictions, settings.tournamentWinner) }))
    .sort((a, b) => b.total - a.total || b.exact - a.exact || b.pct - a.pct);

  const upcomingMatches = Object.values(matches).filter(m => m.status !== "finished").sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const finishedMatches = Object.values(matches).filter(m => m.status === "finished").sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  const isAdmin = currentUser?.role === "admin";
  const isPlayer = currentUser?.role === "player";

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading">
        <div className="loading-icon">⚽</div>
        <div style={{ color: "var(--text2)", fontFamily: "Outfit, sans-serif" }}>Cargando...</div>
      </div>
    </>
  );

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (!currentUser) return (
    <>
      <style>{css}</style>
      <div className={darkMode ? "" : "light"}>
        <div className="login-screen">
          <div className="login-chicken">🐔</div>
          <div className="login-logo">¡PÉGUELE<br />A LA POLLA!</div>
          <div className="login-slogan">¡PÉGUELE A LA POLLA! — MUNDIAL 2026</div>
          <div className="login-card">
            <div className="login-tabs">
              <button className={`login-tab ${loginForm.mode === "join" ? "active" : ""}`} onClick={() => setLoginForm(f => ({ ...f, mode: "join" }))}>Unirme</button>
              <button className={`login-tab ${loginForm.mode === "admin" ? "active" : ""}`} onClick={() => setLoginForm(f => ({ ...f, mode: "admin" }))}>Admin</button>
            </div>
            <div className="input-group">
              <label className="input-label">Tu nombre</label>
              <input className="input" placeholder="James Rodriguez" value={loginForm.name} onChange={e => setLoginForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {loginForm.mode === "join" && (
              <div className="input-group">
                <label className="input-label">Código del grupo</label>
                <input className="input" placeholder="Pide el código a William" value={loginForm.code} onChange={e => setLoginForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            )}
            {loginForm.mode === "admin" && (
              <div className="input-group">
                <label className="input-label">Contraseña admin</label>
                <input className="input" type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={handleLogin}>
              {loginForm.mode === "join" ? "🚀 Unirme al grupo" : "🔐 Ingresar"}
            </button>
            {loginForm.mode === "join" && (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)", textAlign: "center", lineHeight: 1.5 }}>
                Tu acceso se activa una vez confirmes el pago con William.
              </div>
            )}
          </div>
        </div>
        {notif && <div className="notif">{notif.msg}</div>}
      </div>
    </>
  );

  // ── MAIN ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className={darkMode ? "" : "light"}>
        {notif && <div className="notif">{notif.msg}</div>}
        {selectedParticipant && (
          <StatsModal
            participant={selectedParticipant}
            stats={computeStats(selectedParticipant.id, matches, predictions, champPredictions, settings.tournamentWinner)}
            matches={matches}
            predictions={predictions}
            onClose={() => setSelectedParticipant(null)}
          />
        )}

        <div className="app">
          {/* HEADER */}
          <header className="header">
            <div>
              <div className="header-title">🐔 ¡Péguele a la Polla!</div>
              <div className="header-sub">MUNDIAL 2026</div>
            </div>
            <div className="header-right">
              <button className="dark-toggle" onClick={() => setDarkMode(d => !d)}>{darkMode ? "☀️" : "🌙"}</button>
              {isPlayer && (
                <>
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={e => handlePhotoUpload(e.target.files[0])} />
                  <div className="avatar" onClick={() => fileInputRef.current?.click()} title="Cambiar foto">
                    {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" /> : currentUser.name[0].toUpperCase()}
                  </div>
                </>
              )}
              {isAdmin && (
                <div className="avatar" onClick={handleLogout} title="Cerrar sesión" style={{ background: "var(--gold-dark)" }}>⚙️</div>
              )}
            </div>
          </header>

          <div className="content">

            {/* ── PREDICTIONS ── */}
            {activeTab === "predictions" && (
              <div>
                {isPlayer && !currentUser.active && (
                  <div className="warning-box">⚠️ Tu pago está pendiente. Contacta a William para activar tu cuenta.</div>
                )}
                {isPlayer && (
                  <ChampPrediction
                    userId={currentUser.id}
                    userName={currentUser.name}
                    champPredictions={champPredictions}
                    tournamentWinner={settings.tournamentWinner}
                    onSave={saveChampPred}
                    matches={matches}
                  />
                )}
                <div className="tabs">
                  <button className={`tab ${predTab === "upcoming" ? "active" : ""}`} onClick={() => setPredTab("upcoming")}>Próximos ({upcomingMatches.length})</button>
                  <button className={`tab ${predTab === "finished" ? "active" : ""}`} onClick={() => setPredTab("finished")}>Terminados ({finishedMatches.length})</button>
                </div>
                {predTab === "upcoming" && (
                  upcomingMatches.length === 0
                    ? <div className="empty"><div className="empty-icon">⚽</div><div className="empty-text">No hay partidos próximos</div></div>
                    : upcomingMatches.map(m => (
                      <MatchCard key={m.id} match={m}
                        myPred={predictions[m.id]?.[currentUser?.id]}
                        allPreds={predictions[m.id] || {}}
                        onSave={savePrediction}
                        isAdmin={isAdmin}
                        onSetResult={setResult}
                        participants={participants}
                      />
                    ))
                )}
                {predTab === "finished" && (
                  finishedMatches.length === 0
                    ? <div className="empty"><div className="empty-icon">🏁</div><div className="empty-text">Ningún partido finalizado aún</div></div>
                    : finishedMatches.map(m => (
                      <MatchCard key={m.id} match={m}
                        myPred={predictions[m.id]?.[currentUser?.id]}
                        allPreds={predictions[m.id] || {}}
                        onSave={savePrediction}
                        isAdmin={isAdmin}
                        onSetResult={setResult}
                        participants={participants}
                      />
                    ))
                )}
              </div>
            )}

            {/* ── STANDINGS ── */}
            {activeTab === "standings" && (
              <div>
                <div className="section-hero">
                  <div className="hero-title">🏆 Escalafón</div>
                  <div className="hero-sub">Toca un nombre para ver sus estadísticas</div>
                </div>
                <div className="pool-grid">
                  <div className="pool-card">
                    <div className="pool-label">💰 POZO GRUPOS</div>
                    <div className="pool-amount">${pools.groups.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{settings.currency} · 70/30</div>
                  </div>
                  <div className="pool-card">
                    <div className="pool-label">🏆 POZO ELIM.</div>
                    <div className="pool-amount">${pools.eliminations.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{settings.currency} · 70/30</div>
                  </div>
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
                        <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, flexShrink: 0 }}>
                          {p.photoURL ? <img src={p.photoURL} alt="" /> : p.name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="standing-name" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {p.name}
                            {!p.paid && <span className="unpaid-badge">Sin pago</span>}
                          </div>
                          <div className="standing-stats">🎯 {p.exact} exactos · ✅ {p.pct}% · 🔥 {p.streak} racha</div>
                        </div>
                        <div className="standing-pts">{pts}</div>
                      </div>
                    );
                  })}
                <div className="sep" />
                <div className="info-box" style={{ fontSize: 12 }}>
                  ✅ Ganador/empate = 2 pts · 🎯 Marcador exacto = +3 pts · ⚽ Penales exactos = +3 pts · 🏆 Campeón = +10 pts
                </div>
              </div>
            )}

            {/* ── PAYMENTS (ADMIN) ── */}
            {activeTab === "payments" && isAdmin && (
              <div>
                <div className="section-hero">
                  <div className="hero-title">💰 Pagos</div>
                  <div className="hero-sub">Gestión de cuotas y participantes</div>
                </div>
                <div className="card">
                  <div className="card-title">⚙️ Configuración</div>
                  <div className="input-row">
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">Cuota</label>
                      <input className="input" type="number" value={settings.quota} onChange={e => update(ref(db, "settings"), { quota: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">Moneda</label>
                      <select className="input" value={settings.currency} onChange={e => update(ref(db, "settings"), { currency: e.target.value })}>
                        <option>COP</option><option>CAD</option><option>USD</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="pool-grid">
                  <div className="pool-card">
                    <div className="pool-label">💰 POZO GRUPOS</div>
                    <div className="pool-amount">${pools.groups.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>70% 1er · 30% 2do</div>
                  </div>
                  <div className="pool-card">
                    <div className="pool-label">🏆 POZO ELIM.</div>
                    <div className="pool-amount">${pools.eliminations.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>70% 1er · 30% 2do</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">🔑 Código del grupo</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div className="code-display">{settings.groupCode}</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard?.writeText(settings.groupCode); showNotif("📋 Código copiado"); }}>📋</button>
                    <button className="btn btn-gold btn-sm" onClick={regenerateCode}>🔄 Nuevo</button>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>Al regenerar, los que ya están adentro no se ven afectados.</div>
                </div>
                <div className="card">
                  <div className="card-title">👥 Participantes ({participants.filter(p => p.role !== "admin").length})</div>
                  {participants.filter(p => p.role !== "admin").map(p => (
                    <div key={p.id} className="payment-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className={`paid-dot ${p.paid ? "paid-yes" : "paid-no"}`} />
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                          {p.photoURL ? <img src={p.photoURL} alt="" /> : p.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: "var(--text3)" }}>{p.paid ? "✅ Pagó" : "⏳ Pendiente"} · {p.active ? "Activo" : "Suspendido"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className={`btn btn-sm ${p.paid ? "btn-danger" : "btn-primary"}`} onClick={() => togglePaid(p)}>
                          {p.paid ? "Revertir" : "Pagó ✓"}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(p)} title={p.active ? "Suspender" : "Reactivar"}>
                          {p.active ? "⏸" : "▶️"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ADMIN ── */}
            {activeTab === "admin" && isAdmin && (
              <div>
                <div className="section-hero">
                  <div className="hero-title">⚙️ Panel Admin</div>
                  <div className="hero-sub">Gestión de partidos y torneo</div>
                </div>
                <div className="tabs">
                  <button className={`tab ${adminTab === "matches" ? "active" : ""}`} onClick={() => setAdminTab("matches")}>Partidos</button>
                  <button className={`tab ${adminTab === "test" ? "active" : ""}`} onClick={() => setAdminTab("test")}>Prueba</button>
                  <button className={`tab ${adminTab === "champ" ? "active" : ""}`} onClick={() => setAdminTab("champ")}>Campeón</button>
                </div>

                {adminTab === "matches" && (
                  <div>
                    <div className="card">
                      <div className="card-title">➕ Nuevo partido</div>
                      <div className="input-row">
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">Local</label>
                          <input className="input" placeholder="Equipo local" value={newMatch.homeTeam} onChange={e => setNewMatch(m => ({ ...m, homeTeam: e.target.value }))} />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">Visitante</label>
                          <input className="input" placeholder="Equipo visitante" value={newMatch.awayTeam} onChange={e => setNewMatch(m => ({ ...m, awayTeam: e.target.value }))} />
                        </div>
                      </div>
                      <div className="input-row">
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">Fecha y hora</label>
                          <input className="input" type="datetime-local" value={newMatch.datetime} onChange={e => setNewMatch(m => ({ ...m, datetime: e.target.value }))} />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">Fase</label>
                          <select className="input" value={newMatch.phase} onChange={e => setNewMatch(m => ({ ...m, phase: e.target.value }))}>
                            <option value="test">🧪 Prueba</option>
                            <option value="groups">Fase Grupos</option>
                            <option value="r16">Octavos</option>
                            <option value="qf">Cuartos</option>
                            <option value="sf">Semifinal</option>
                            <option value="final">Final</option>
                          </select>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-full" onClick={addMatch}>⚽ Agregar partido</button>
                    </div>
                    <div className="admin-section-title">Partidos programados</div>
                    {Object.values(matches).length === 0
                      ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No hay partidos aún</div></div>
                      : Object.values(matches).sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map(m => (
                        <div key={m.id} className="match-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{m.homeTeam} vs {m.awayTeam}</div>
                            <div style={{ fontSize: 11, color: "var(--text3)" }}>{fmtDate(m.datetime)} · {getPhaseLabel(m.phase)}</div>
                            <div style={{ fontSize: 11, marginTop: 2 }}>
                              {m.status === "finished"
                                ? <span style={{ color: "var(--green)" }}>✅ {m.result.home}-{m.result.away}{m.result.penalties ? ` (Pen: ${m.result.pensHome}-${m.result.pensAway})` : ""}</span>
                                : <span style={{ color: "var(--text3)" }}>⏳ Pendiente</span>}
                            </div>
                          </div>
                          {m.status !== "finished" && (
                            <button className="btn btn-danger btn-sm" onClick={() => deleteMatch(m.id)}>🗑</button>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {adminTab === "test" && (
                  <div>
                    <div className="info-box">🧪 <strong>Modo Prueba:</strong> Crea partidos con fase "Prueba" para que el grupo se familiarice con la app. Los datos de prueba no afectan el torneo real.</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => { if (window.confirm("¿Eliminar todos los partidos de prueba?")) clearTestMatches(); }}>
                        🧹 Limpiar partidos de prueba
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => { if (window.confirm("¿Eliminar todos los participantes de prueba? (excepto Admin)")) clearTestParticipants(); }}>
                        👥 Limpiar participantes
                      </button>
                    </div>
                    <div className="admin-section-title">Partidos de prueba</div>
                    {Object.values(matches).filter(m => m.phase === "test").length === 0
                      ? <div className="empty"><div className="empty-icon">🧪</div><div className="empty-text">No hay partidos de prueba. Créalos desde "Partidos" eligiendo la fase "Prueba".</div></div>
                      : Object.values(matches).filter(m => m.phase === "test").map(m => (
                        <div key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <strong>{m.homeTeam} vs {m.awayTeam}</strong>
                            <span style={{ color: "var(--text3)", marginLeft: 6, fontSize: 11 }}>{fmtDate(m.datetime)}</span>
                          </div>
                          {m.status === "finished"
                            ? <span style={{ color: "var(--green)", fontSize: 12 }}>✅ {m.result.home}-{m.result.away}</span>
                            : <span style={{ color: "var(--text3)", fontSize: 12 }}>⏳</span>}
                        </div>
                      ))}
                  </div>
                )}

                {adminTab === "champ" && (
                  <div>
                    <div className="card">
                      <div className="card-title">🏆 Campeón del Mundial</div>
                      <div className="input-group">
                        <label className="input-label">Equipo campeón (ingresar al finalizar el torneo)</label>
                        <input className="input" placeholder="Ej: Colombia 🇨🇴" value={settings.tournamentWinner || ""} onChange={e => update(ref(db, "settings"), { tournamentWinner: e.target.value })} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>Al ingresar el campeón se calculan automáticamente los +10 pts.</div>
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
            <button className={`nav-btn ${activeTab === "predictions" ? "active" : ""}`} onClick={() => setActiveTab("predictions")}>
              <span className="icon">⚽</span>Partidos
            </button>
            <button className={`nav-btn ${activeTab === "standings" ? "active" : ""}`} onClick={() => setActiveTab("standings")}>
              <span className="icon">🏆</span>Escalafón
            </button>
            {isAdmin && (
              <button className={`nav-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
                <span className="icon">💰</span>Pagos
              </button>
            )}
            {isAdmin && (
              <button className={`nav-btn ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}>
                <span className="icon">⚙️</span>Admin
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
