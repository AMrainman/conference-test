export function formatBitrate(bps: number): string {
  if (bps < 1000) return `${bps}bps`
  if (bps < 1000 * 1000) return `${(bps / 1000).toFixed(1)}Kbps`
  return `${(bps / 1000 / 1000).toFixed(2)}Mbps`
}
