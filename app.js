console.log("EV system loaded");

// ===============================
// ココモ設定（東西別々に管理）
// ===============================
const kokomoSequence = [100, 100, 200, 300, 500, 800];

let kokomo = {
  east: { loss: 0, totalLoss: 0, index: 0 },
  west: { loss: 0, totalLoss: 0, index: 0 }
};

// ===============================
// EV計算
// ===============================
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

// ===============================
// EV判定（東 or 西）
// ===============================
function runEV(place) {
  const winRate = parseFloat(document.getElementById(`${place}_winRate`).value);
  const odds = parseFloat(document.getElementById(`${place}_odds`).value);

  const result = calculateEV(winRate, odds);
  const area = document.getElementById(`${place}_resultArea`);

  area.innerHTML = `
    <p>EV値：${result.ev.toFixed(2)}</p>
    <p>判定：${result.buy ? "🟢 買い" : "🔴 スルー"}</p>
    <p>理由：${result.reason}</p>
  `;

  // ココモ賭け金表示
  const k = kokomo[place];
  if (result.buy) {
    const betAmount = kokomoSequence[k.index];
    area.innerHTML += `<p>賭け金：${betAmount}円</p>`;
  } else {
    area.innerHTML += `<p>賭け金：0円（スルー）</p>`;
  }

  // 6連敗ストップ
  if (k.loss >= 6) {
    area.innerHTML += `<p style="color:red;">⚠️ 6連敗 → 自動停止</p>`;
  }
}

// ===============================
// 勝敗更新（東 or 西）
// ===============================
function updateKokomo(place, isWin) {
  const area = document.getElementById(`${place}_resultArea`);
  const k = kokomo[place];

  if (isWin) {
    k.loss = 0;
    k.totalLoss = 0;
    k.index = 0;
    area.innerHTML += `<p>🏆 勝利 → ココモリセット</p>`;
  } else {
    k.loss++;
    k.totalLoss += kokomoSequence[k.index];
    k.index = Math.min(k.index + 1, kokomoSequence.length - 1);

    area.innerHTML += `
      <p>❌ 負け：${k.loss}連敗</p>
      <p>累計損失：${k.totalLoss}円</p>
      <p>次の賭け金：${kokomoSequence[k.index]}円</p>
    `;
  }

  if (k.loss >= 6) {
    area.innerHTML += `<p style="color:red;">⚠️ 6連敗 → 自動停止</p>`;
  }
}

// ===============================
// 自動更新（1分ごと）
// ===============================
setInterval(() => {
  runEV("east");
  runEV("west");
}, 60000);
