console.log("app.js loaded");

// ココモ設定
const kokomoSequence = [100, 100, 200, 300, 500, 800];
let kokomo = {
  east: { loss: 0, totalLoss: 0, index: 0 },
  west: { loss: 0, totalLoss: 0, index: 0 }
};

// EV計算
function calculateEV(winRate, odds) {
  if (odds < 2.7) return { ev: -999, buy: false, reason: "オッズが2.7未満" };
  const ev = winRate * odds - 1;
  return { ev, buy: ev > 0, reason: ev > 0 ? "EVプラス" : "EVマイナス" };
}

// ココモ状態更新
function updateKokomoStatus(place) {
  const k = kokomo[place];
  const box = document.getElementById(`${place}_kokomoStatus`);
  box.innerHTML = `
    <b>ココモ状態</b><br>
    段階：${k.index + 1}<br>
    連敗：${k.loss}<br>
    累計損失：${k.totalLoss}円<br>
    次の賭け金：${kokomoSequence[k.index]}円
  `;
}

// EV判定
function runEV(place) {
  const winRate = parseFloat(document.getElementById(`${place}_winRate`).value);
  const odds = parseFloat(document.getElementById(`${place}_odds`).value);
  const area = document.getElementById(`${place}_resultArea`);
  const k = kokomo[place];

  const result = calculateEV(winRate, odds);

  area.innerHTML = `
    EV値：${result.ev.toFixed(2)}<br>
    判定：${result.buy ? "🟢買い" : "🔴スルー"}<br>
    理由：${result.reason}<br>
  `;

  if (result.buy) {
    area.innerHTML += `賭け金：${kokomoSequence[k.index]}円<br>`;
  }

  updateKokomoStatus(place);
}

// 勝敗更新
function updateKokomo(place, isWin) {
  const area = document.getElementById(`${place}_resultArea`);
  const k = kokomo[place];

  if (isWin) {
    k.loss = 0;
    k.totalLoss = 0;
    k.index = 0;
    area.innerHTML += "<br>🏆 勝利 → リセット";
  } else {
    k.loss++;
    k.totalLoss += kokomoSequence[k.index];
    k.index = Math.min(k.index + 1, kokomoSequence.length - 1);
    area.innerHTML += `<br>❌ 負け → ${k.loss}連敗`;
  }

  updateKokomoStatus(place);
}

// オッズ貼り付け
async function pasteOdds(place) {
  try {
    const text = await navigator.clipboard.readText();
    const num = parseFloat(text.match(/[0-9.]+/)[0]);
    document.getElementById(`${place}_odds`).value = num;
  } catch {
    alert("クリップボード読み取り失敗");
  }
}
