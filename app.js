console.log("EV system loaded");

// ココモ法の賭け金シーケンス
const kokomoSequence = [100, 100, 200, 300, 500, 800];
let lossCount = 0;
let totalLoss = 0;
let currentBetIndex = 0;

// EV計算関数
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

// EV判定実行
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

  // ココモ賭け金表示
  if (result.buy) {
    const betAmount = kokomoSequence[currentBetIndex];
    area.innerHTML += `<p>賭け金：${betAmount}円</p>`;
  } else {
    area.innerHTML += `<p>賭け金：0円（スルー）</p>`;
  }
}

// 勝敗更新関数
function updateKokomo(isWin) {
  const area = document.getElementById("resultArea");

  if (isWin) {
    lossCount = 0;
    totalLoss = 0;
    currentBetIndex = 0;
    area.innerHTML += `<p>🏆 勝利 → ココモリセット</p>`;
  } else {
    lossCount++;
    totalLoss += kokomoSequence[currentBetIndex];
    currentBetIndex = Math.min(currentBetIndex + 1, kokomoSequence.length - 1);

    area.innerHTML += `
      <p>❌ 負け：${lossCount}連敗</p>
      <p>累計損失：${totalLoss}円</p>
      <p>次の賭け金：${kokomoSequence[currentBetIndex]}円</p>
    `;
  }
}
