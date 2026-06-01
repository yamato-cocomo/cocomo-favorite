console.log("EV system loaded");
function calculateEV(winRate, odds) {
  // オッズが2.7未満なら買わない
  if (odds < 2.7) {
    return { ev: -999, buy: false, reason: "オッズが2.7未満" };
  }

  // EV計算：EV = 的中率 × オッズ − 1
  const ev = winRate * odds - 1;

  return {
    ev: ev,
    buy: ev > 0, // EVがプラスなら買い
    reason: ev > 0 ? "EVプラス" : "EVマイナス"
  };
}
