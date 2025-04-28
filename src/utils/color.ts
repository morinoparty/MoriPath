export function hashToHSL(hash: number): string {
  // ハッシュを0-360の範囲に変換
  const hue = hash % 360;
  // 彩度と明度をハッシュから生成して変化をつける
  const saturation = 60 + (hash % 20); // 60-80%の範囲
  const lightness = 75 + (hash % 10); // 75-85%の範囲
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
export function hashToPastelColor(hash: number, isDark: boolean): string {
  const hue = hash % 360;
  const saturation = isDark ? 25 : 90 + Math.random() * 10; // 彩度は90～100
  const lightness = isDark ? 35 : 80 + Math.random() * 10; // 明度は20～90
  return `hsl(${hue} ${saturation}% ${lightness}% / 0.7)`; // hsl(色相, 彩度, 明度)
}
