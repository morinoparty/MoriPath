export function generateHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash + char) * 31; // 31を掛けることでより大きな数値の変化を生む
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}
