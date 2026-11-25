/**
 * 保護ブロック 1 つのどんぐり (MineAuth の GriefPrevention アドオン設定 claimBlockCost と同じ値)。
 * MineAuth に単価を返す API が無いため、サーバーの設定の写しとして定数で持つ。
 * 実際に引かれる額は購入 API の totalCost が正なので、画面の合計は「目安」として出す。
 * サーバー側の単価を変えたら、ここも合わせて変える
 */
export const CLAIM_BLOCK_PRICE = 1;
