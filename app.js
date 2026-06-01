console.log("EV system loaded");

// ===============================
// ココモ設定（東西別々）
// ===============================
const kokomoSequence = [100, 100, 200, 300, 500, 800];

let kokomo = {
  east: { loss: 0, totalLoss: 0, index: 0 },
  west: { loss: 0, totalLoss: 0, index: 0 }
};

// ===============================
// 通知許可
// ===============================
function requestNotificationPermission() {
  const status = document.getElementById("notifyStatus");

  if (!("Notification" in window)) {
    status.innerText = "このブラウザは通知に対応していません";
    return;
  }

  Notification.requestPermission().then((perm) => {
    if (perm === "granted") {
      status.innerText = "通知が有効になりました";
    } else if (perm === "denied") {
      status.innerText = "通知が拒否されました";
    } else {
      status.innerText = "通知設定が保留状態です";
    }
  });
}

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
// ココモ状態表示
// ===============================
function updateKokomoStatus(place) {
  const k = kokomo[place];
  const statusBox = document.getElementById(`${place}_kokomoStatus`);
  const nextBet = kokomoSequence[k.index];

  statusBox.innerHTML = `
    <p><b>ココモ状態</b></p>
    <p>段階：${k.index + 1}（賭け金：${nextBet}円）</p>
    <p>連敗：${k.loss}</p>
    <p>累計損失：${k.totalLoss}円</p>
  `;
}

// ===============================
// EV判定（東 or 西）
// ===============================
function runEV(place) {
  const winRate = parseFloat(document.getElementById(`${place}_winRate`).value);
  const odds = parseFloat(document.getElementById(`${place}_odds`).value);

  if (isNaN(winRate) || isNaN(odds)) {
    document.getElementById(`${place}_resultArea`).innerHTML =
      "<p>入力値が不正です</p>";
    return;
  }

  const result = calculateEV(winRate, odds);
  const area = document.getElementById(`${place}_resultArea`);
  const k = kokomo[place];

  area.innerHTML = `
    <p>EV値：${result.ev.toFixed(2)}</p>
    <p>判定：${result.buy ? "🟢 買い" : "🔴 スルー"}</p>
    <p>理由：${result.reason}</p>
  `;

  if (result.buy) {
    const betAmount = kokomoSequence[k.index];
    area.innerHTML += `<p>賭け金：${betAmount}円</p>`;
    area.innerHTML += `<p style="color:green;">📢 買いシグナル発生！</p>`;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("買いシグナル", {
        body: `${place === "east" ? "東" : "西"}会場：EVプラス＆買い判定`,
      });
    }
  } else {
    area.innerHTML += `<p>賭け金：0円（スルー）</p>`;
  }

  if (k.loss >= 6) {
    area.innerHTML += `<p style="color:red;">⚠️ 6連敗 → 自動停止</p>`;
  }

  updateKokomoStatus(place);
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

  updateKokomoStatus(place);
}

// ===============================
// オッズ貼り付け（クリップボードから）
// ===============================
async function pasteOdds(place) {
  try {
    const text = await navigator.clipboard.readText();
    const match = text.match(/[0-9.]+/);

    if (!match) {
      alert("オッズらしき数値が見つかりませんでした");
      return;
    }

    const odds = parseFloat(match[0]);
    document.getElementById(`${place}_odds`).value = odds;

    const area = document.getElementById(`${place}_resultArea`);
    area.innerHTML += `<p>📥 オッズ自動取得：${odds}</p>`;
  } catch (e) {
    alert("クリップボードの読み取りに失敗しました（HTTPS環境か確認してください）");
  }
}

// ===============================
// 初期表示
// ===============================
window.addEventListener("load", () => {
  updateKokomoStatus("east");
  updateKokomoStatus("west");
});

// ===============================
// 自動更新（1分ごと）
// ===============================
setInterval(() => {
  runEV("east");
  runEV("west");
}, 60000);
