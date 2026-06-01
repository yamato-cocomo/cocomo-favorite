console.log("EV system loaded");

function calculateEV(winRate, odds) {
  if (odds < 2.7) {
    return { ev: -999, buy: false, reason: "オッズが2.7未満" };
  }

  const ev = winRate * odds - 1;

  return {
    ev: ev,
    buy: ev > 0,
    reason: ev > 0 ? "EVプラス" : "EVマイナス"
  };
}

// レースデータ（例）
const raceData = {
  winRate: 0.32,
  odds2: 3.4
};

// EV判定
const result = calculateEV(raceData.winRate, raceData.odds2);
console.log("EV判定結果:", result);

const area = document.getElementById("resultArea");

area.innerHTML = `
  <p>EV値：${result.ev.toFixed(2)}</p>
  <p>判定：${result.buy ? "🟢 買い" : "🔴 スルー"}</p>
  <p>理由：${result.reason}</p>
`;
function runEV() {
  const winRate = parseFloat(document.getElementById("winRateInput").value);
  const odds = parseFloat(document.getElementById("oddsInput").value);

  const result = calculateEV(winRate, odds);

  const area = document.getElementById("resultArea");
  area.innerHTML = `
    <p>EV値：${result.ev.toFixed(2)}</p>
    <p>判定：${result.buy ? "🟢 買い" : "🔴 スルー"}</p>
    <p>理由：${result.reason}</p>
  `;
}

